#!/bin/bash -l
# =============================================================================
# PBI-044 v0 orchestrator
# Chain: Planner → Coder → QA → (PASS: Deployer) OR (FAIL: back to Coder, ≤3x)
#
# Usage:
#   ./orchestrate.sh "Your natural-language change request"
#   echo "Your request" | ./orchestrate.sh
#
# Env:
#   CLAUDE_CODE_OAUTH_TOKEN  required. Sourced from /etc/profile.d/claude.sh
#                            if not already set.
# =============================================================================

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT" || exit 1

MAX_RETRIES=3
MAX_TURNS_PER_AGENT=40
CLAUDE_FLAGS="--output-format text --dangerously-skip-permissions --max-turns $MAX_TURNS_PER_AGENT"

# --- helpers ------------------------------------------------------------------

log() { echo "[$(date -u +%H:%M:%S)Z] [$1] $2"; }
die() { log ERROR "$1"; exit 1; }

# Load OAuth token if not in env (headless / cron scenarios)
if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && [ -f /etc/profile.d/claude.sh ]; then
  source /etc/profile.d/claude.sh
fi
[ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && die "CLAUDE_CODE_OAUTH_TOKEN not set — check /etc/profile.d/claude.sh"

# --- input --------------------------------------------------------------------

if [ $# -ge 1 ]; then
  TASK="$*"
else
  TASK=$(cat)
fi
[ -z "$TASK" ] && die "No task provided. Pass as arg or via stdin."

log ORCH "Task received: $(echo "$TASK" | head -c 120)..."

# --- start clean on main ------------------------------------------------------

log ORCH "Resetting to clean main"
git checkout main --quiet || die "git checkout main failed"
git pull --quiet || die "git pull failed"

# Remove any state files from a previous run
rm -f PLAN.md IMPLEMENT.md QA_REPORT.md DEPLOY.md agents/CURRENT_TASK.md

# --- write current task file --------------------------------------------------

cat > agents/CURRENT_TASK.md <<EOF
# Current Task

$TASK
EOF
log ORCH "Wrote agents/CURRENT_TASK.md"

# --- invoke_agent helper ------------------------------------------------------
# Args:
#   $1 = agent name (planner|coder|qa|deployer) — for role file + log naming
#   $2 = context suffix appended after the role file content
invoke_agent() {
  local NAME="$1"
  local SUFFIX="$2"
  local ROLE_FILE="agents/${NAME}.md"
  local LOG="/tmp/orchestrate-${NAME}.log"
  [ ! -f "$ROLE_FILE" ] && die "Missing role file: $ROLE_FILE"

  log ORCH "Invoking $NAME agent (max ${MAX_TURNS_PER_AGENT} turns)..."
  local PROMPT="$(cat "$ROLE_FILE")
---
$SUFFIX"

  claude -p "$PROMPT" $CLAUDE_FLAGS >"$LOG" 2>&1
  local RC=$?
  log ORCH "$NAME agent exited with code $RC (log: $LOG)"
  if [ $RC -ne 0 ]; then
    echo "--- last 30 lines of $LOG ---"
    tail -30 "$LOG"
    die "$NAME agent failed (exit $RC)"
  fi
  # print short summary
  echo "--- $NAME output tail ---"
  tail -10 "$LOG"
  echo "---"
}

# --- 1. Planner ---------------------------------------------------------------

invoke_agent planner "User request (also in agents/CURRENT_TASK.md):

$TASK"

[ ! -f PLAN.md ] && die "Planner did not produce PLAN.md — see /tmp/orchestrate-planner.log"
log ORCH "PLAN.md created ($(wc -l < PLAN.md) lines)"

# --- 2. Coder / QA loop (max $MAX_RETRIES) -----------------------------------

RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  RETRY=$((RETRY + 1))
  log ORCH "=== Attempt $RETRY / $MAX_RETRIES ==="

  # Coder — include previous QA report on retry so it knows what to fix
  CODER_SUFFIX="PLAN.md:
$(cat PLAN.md)"
  if [ -f QA_REPORT.md ] && [ $RETRY -gt 1 ]; then
    CODER_SUFFIX+="

---
Previous QA_REPORT.md (fix the failures):
$(cat QA_REPORT.md)"
  fi

  rm -f IMPLEMENT.md
  invoke_agent coder "$CODER_SUFFIX"

  [ ! -f IMPLEMENT.md ] && die "Coder did not produce IMPLEMENT.md — see /tmp/orchestrate-coder.log"

  # QA
  rm -f QA_REPORT.md
  invoke_agent qa "PLAN.md:
$(cat PLAN.md)

---
IMPLEMENT.md:
$(cat IMPLEMENT.md)"

  [ ! -f QA_REPORT.md ] && die "QA did not produce QA_REPORT.md — see /tmp/orchestrate-qa.log"

  # Parse QA verdict
  if grep -qE "^\*\*PASS\*\*|Overall verdict.*PASS" QA_REPORT.md; then
    log ORCH "QA verdict: PASS"
    break
  fi

  log ORCH "QA verdict: FAIL. Attempt $RETRY of $MAX_RETRIES."
  if [ $RETRY -eq $MAX_RETRIES ]; then
    echo ""
    echo "=========================================="
    echo "MAX RETRIES HIT. Final state:"
    echo "=========================================="
    echo "--- PLAN.md ---"; cat PLAN.md
    echo "--- IMPLEMENT.md ---"; cat IMPLEMENT.md
    echo "--- QA_REPORT.md ---"; cat QA_REPORT.md
    die "Task not shippable after $MAX_RETRIES attempts."
  fi
done

# --- 3. Deployer --------------------------------------------------------------

invoke_agent deployer "PLAN.md:
$(cat PLAN.md)

---
IMPLEMENT.md:
$(cat IMPLEMENT.md)

---
QA_REPORT.md:
$(cat QA_REPORT.md)"

[ ! -f DEPLOY.md ] && die "Deployer did not produce DEPLOY.md — see /tmp/orchestrate-deployer.log"

# --- done ---------------------------------------------------------------------

log ORCH "=== ORCHESTRATION COMPLETE ==="
echo ""
echo "=========================================="
cat DEPLOY.md
echo "=========================================="
