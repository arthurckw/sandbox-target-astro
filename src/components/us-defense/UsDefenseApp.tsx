import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  Flag,
  Inbox,
  LayoutDashboard,
  Loader2,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  scenarios,
  initialEscapeLog,
  escapeRate,
  initialQueueDepth,
  randomDecisionLatencyMs,
  formatRelativeMinutes,
} from './data';
import type { Decision, EscapeRecord, View } from './types';

export default function UsDefenseApp() {
  const [view, setView] = useState<View>('evaluation');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
  const [queueDepth, setQueueDepth] = useState(initialQueueDepth);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Log entries. Base rows come from initialEscapeLog with fixed minutesAgo
  // offsets. New Flag decisions get prepended with a live createdAt (ms) so
  // they render as "just now" and count up naturally.
  const [logEntries, setLogEntries] = useState<
    Array<EscapeRecord & { createdAtMs?: number }>
  >(() => initialEscapeLog);

  // 1Hz tick just to force re-render of relative-time labels in the log.
  const [, setTickNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setTickNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Session clock — starts at mount time. Recomputed every render, and the
  // 1Hz tick above forces a re-render each second.
  const mountedAt = useRef(Date.now());
  const elapsedSec = Math.floor((Date.now() - mountedAt.current) / 1000);
  const sessionClock =
    String(Math.floor(elapsedSec / 3600)).padStart(2, '0') +
    ':' +
    String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0') +
    ':' +
    String(elapsedSec % 60).padStart(2, '0');

  const scenario = scenarios[scenarioIndex];

  function handleDecision(d: Decision) {
    if (loading) return;
    setDecision(d);
    setLoading(true);

    // Only Flag decisions land in the human-override log — the whole log
    // narrative is "cases the LLM Judge passed but a human flagged."
    if (d === 'flag') {
      setLogEntries((prev) => [
        {
          id: `FL-${Math.floor(Date.now() / 1000)}`,
          minutesAgo: 0,
          createdAtMs: Date.now(),
          sourceModel: scenario.sourceModel,
          defensePrompt: shortPrompt(scenario.userPrompt),
          judgeAction: scenario.judgeStatus,
          humanAction: 'FLAGGED',
          category: scenario.category,
        },
        ...prev,
      ]);
    }

    setQueueDepth((q) => Math.max(1, q - 1));
    setReviewedCount((c) => c + 1);

    window.setTimeout(() => {
      setScenarioIndex((i) => (i + 1) % scenarios.length);
      setDecision(null);
      setLoading(false);
    }, randomDecisionLatencyMs());
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 border-b border-border-subtle pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
            <Radar className="h-6 w-6 text-accent" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
            </span>
          </div>
          <div>
            <h1 className="text-lg font-display font-semibold tracking-tight text-primary">
              HumanJudge <span className="text-accent">· Defense</span>
            </h1>
            <p className="text-xs text-tertiary">
              AI Response Evaluation Suite — Analyst Console
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span className="text-tertiary">SECURE CHANNEL</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-accent" />
            <span className="text-tertiary">SESSION</span>
            <span className="text-primary tabular-nums">{sessionClock}</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-success font-medium">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="mb-8 inline-flex gap-1 rounded-lg border border-border-subtle bg-surface p-1">
        <TabButton
          active={view === 'evaluation'}
          onClick={() => setView('evaluation')}
          icon={<Terminal className="h-4 w-4" />}
          label="Active Evaluation"
        />
        <TabButton
          active={view === 'reports'}
          onClick={() => setView('reports')}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Reports Dashboard"
        />
      </nav>

      {view === 'evaluation' ? (
        <EvaluationView
          scenario={scenario}
          loading={loading}
          decision={decision}
          queueDepth={queueDepth}
          reviewedCount={reviewedCount}
          onDecision={handleDecision}
        />
      ) : (
        <ReportsView logEntries={logEntries} />
      )}

      {/* Footer */}
      <footer className="mt-12 flex flex-col gap-1 border-t border-border-subtle pt-5 text-[11px] font-mono text-tertiary sm:flex-row sm:items-center sm:justify-between">
        <span>HumanJudge Defense · Analyst Console — Interactive demo, non-production</span>
        <span>BUILD 2.4.1 · NODE 04</span>
      </footer>
    </div>
  );
}

/* ---------------- Utilities ---------------- */

function shortPrompt(p: string): string {
  const t = p.trim().replace(/[.!?]+$/, '');
  return t.length <= 42 ? t : t.slice(0, 40).trimEnd() + '…';
}

/* ---------------- Navigation ---------------- */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-micro ease-smooth ${
        active
          ? 'bg-accent text-accent-on'
          : 'text-secondary hover:bg-surface-elevated hover:text-primary'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ---------------- Evaluation View ---------------- */

function EvaluationView({
  scenario,
  loading,
  decision,
  queueDepth,
  reviewedCount,
  onDecision,
}: {
  scenario: (typeof scenarios)[number];
  loading: boolean;
  decision: Decision | null;
  queueDepth: number;
  reviewedCount: number;
  onDecision: (d: Decision) => void;
}) {
  const isConcur = scenario.humanVerdict === 'concur';

  return (
    <div className="relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-elevated px-6 py-4 shadow-elevated">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <p className="text-sm text-secondary">
              Logging analyst decision · fetching next telemetry log…
            </p>
          </div>
        </div>
      )}

      {/* Case-queue strip (replaces the old SCENARIO N/M counter + progress dots) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-mono">
          <Inbox className="h-3.5 w-3.5 text-accent" />
          <span className="text-tertiary uppercase tracking-widest">Case Queue</span>
          <span className="text-primary tabular-nums font-semibold">{queueDepth}</span>
          <span className="text-tertiary">pending</span>
        </div>
        <div className="text-[11px] font-mono text-tertiary">
          Reviewed this session · <span className="text-primary tabular-nums">{reviewedCount}</span>
        </div>
      </div>

      {/* Metadata strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'MODEL', value: scenario.sourceModel },
          { label: 'DOMAIN', value: 'TACTICAL / LOGISTICS' },
          { label: 'CLEARANCE', value: 'TS//SCI' },
          { label: 'CASE ID', value: scenario.id },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-md border border-border-subtle bg-surface px-3 py-2.5"
          >
            <div className="text-[10px] uppercase tracking-widest text-tertiary font-mono">
              {m.label}
            </div>
            <div className="mt-0.5 text-sm text-primary font-mono">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel index="01" icon={<Terminal className="h-4 w-4" />} label="User Intent / Prompt">
          <p className="text-[15px] leading-relaxed text-primary">
            {scenario.userPrompt}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-tertiary">
            <ChevronRight className="h-3 w-3 text-accent" />
            <span>Operator input · classified routing request</span>
          </div>
        </Panel>

        <Panel index="02" icon={<Cpu className="h-4 w-4" />} label="AI Model Output">
          <p className="text-[15px] leading-relaxed text-primary">
            {scenario.aiOutput}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-tertiary">
            <ChevronRight className="h-3 w-3 text-accent" />
            <span>Model response · no override applied</span>
          </div>
        </Panel>

        {/* Evaluation layer full width */}
        <div className="lg:col-span-2">
          <Panel
            index="03"
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Evaluation Layer"
            accent
          >
            {/* LLM Judge badge */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-success/40 bg-success-soft px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  LLM Judge Status: {scenario.judgeStatus}
                </span>
                <span className="ml-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-success font-mono">
                  {scenario.judgeDetail}
                </span>
              </div>
              <div className="text-[11px] text-tertiary font-mono">
                Automated check · ruleset v9.1
              </div>
            </div>

            {/* Human analyst banner — flips green for concur, amber for flag */}
            {isConcur ? (
              <div className="relative mt-5 overflow-hidden rounded-lg border border-success/30 bg-success-soft">
                <div className="absolute left-0 top-0 h-full w-1 bg-success" />
                <div className="flex items-start gap-3 p-4 sm:p-5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-success/40 bg-success/15">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold uppercase tracking-wide text-success">
                        Human Analyst Review
                      </span>
                      <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success font-mono">
                        Concur
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-primary">
                      {scenario.humanInsight}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative mt-5 overflow-hidden rounded-lg border border-warning/40 bg-warning-soft">
                <div className="absolute left-0 top-0 h-full w-1 bg-warning" />
                <div className="flex items-start gap-3 p-4 sm:p-5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-warning/40 bg-warning/15">
                    <ShieldAlert className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold uppercase tracking-wide text-warning">
                        Human Analyst Insight
                      </span>
                      {scenario.humanSeverity && scenario.humanSeverity !== 'None' && (
                        <span className="rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning font-mono">
                          {scenario.humanSeverity}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-primary">
                      {scenario.humanInsight}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Decision buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-tertiary">
                Submit your analyst decision to log and advance the queue.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onDecision('pass')}
                  className={`group inline-flex items-center justify-center gap-2.5 rounded-md border px-6 py-3.5 text-sm font-semibold tracking-wide transition-micro ease-smooth disabled:opacity-50 ${
                    decision === 'pass'
                      ? 'border-success bg-success/15 text-success'
                      : 'border-success/50 bg-success-soft text-success hover:border-success hover:bg-success/20'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  Pass Response
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onDecision('flag')}
                  className={`group inline-flex items-center justify-center gap-2.5 rounded-md border px-6 py-3.5 text-sm font-semibold tracking-wide transition-micro ease-smooth disabled:opacity-50 ${
                    decision === 'flag'
                      ? 'border-warning bg-warning/15 text-warning'
                      : 'border-warning/50 bg-warning-soft text-warning hover:border-warning hover:bg-warning/20'
                  }`}
                >
                  <Flag
                    className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                      decision === 'flag' ? 'fill-warning text-warning' : 'text-warning'
                    }`}
                  />
                  Flag Detrimental Response
                  <AlertTriangle className="h-4 w-4 text-warning transition-transform duration-200 group-hover:-translate-y-px" />
                </button>
              </div>
            </div>

            {/* Decision confirmation */}
            {decision && !loading && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-md border px-4 py-2.5 text-[12px] font-mono ${
                  decision === 'flag'
                    ? 'border-warning/30 bg-warning-soft text-warning'
                    : 'border-success/30 bg-success-soft text-success'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    decision === 'flag' ? 'bg-warning' : 'bg-success'
                  }`}
                />
                Decision logged · escalating to analyst queue · case ID{' '}
                <span className="text-primary">
                  FL-2026-0914-{scenario.id.slice(-4)}
                </span>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reports View ---------------- */

function ReportsView({ logEntries }: { logEntries: Array<EscapeRecord & { createdAtMs?: number }> }) {
  const nowMs = Date.now();

  return (
    <div>
      {/* KPI strip */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Automated LLM Escape Rate"
          value={escapeRate}
          tone="warning"
          icon={<AlertTriangle className="h-4 w-4" />}
          sub="Prompts passed by LLM judge but flagged by humans"
        />
        <KpiCard
          label="Human Overrides Logged"
          value={String(logEntries.length)}
          tone="accent"
          icon={<ClipboardList className="h-4 w-4" />}
          sub="Total system escapes caught by analysts"
        />
        <KpiCard
          label="Avg. Time to Flag"
          value="2.4s"
          tone="neutral"
          icon={<Activity className="h-4 w-4" />}
          sub="Median analyst response latency"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border-subtle bg-surface">
        <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5">
          <ClipboardList className="h-4 w-4 text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
            Human Override Log · LLM Judge Failures
          </h2>
          <span className="ml-auto rounded-full bg-warning-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning font-mono">
            {logEntries.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] uppercase tracking-widest text-tertiary font-mono">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Source Model</th>
                <th className="px-5 py-3 font-medium">Defense Prompt</th>
                <th className="px-5 py-3 font-medium">LLM-as-Judge Action</th>
                <th className="px-5 py-3 font-medium">Human Analyst Action</th>
                <th className="px-5 py-3 font-medium">Vulnerability Category</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.map((row) => {
                const effectiveMinutesAgo = row.createdAtMs
                  ? (nowMs - row.createdAtMs) / 60_000
                  : row.minutesAgo;
                const isFresh = effectiveMinutesAgo < 0.5;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-border-subtle transition-colors duration-150 hover:bg-surface-elevated ${
                      isFresh ? 'bg-warning-soft/40' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 text-tertiary font-mono">
                      {formatRelativeMinutes(effectiveMinutesAgo)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-secondary font-mono">
                      {row.sourceModel}
                    </td>
                    <td className="px-5 py-3.5 text-primary">
                      {row.defensePrompt}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-2.5 py-1 text-[11px] text-success font-mono">
                        <ShieldCheck className="h-3 w-3" />
                        {row.judgeAction}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-soft px-2.5 py-1 text-[11px] text-warning font-mono">
                        <Flag className="h-3 w-3 fill-warning" />
                        {row.humanAction}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-secondary">
                        <ArrowRight className="h-3 w-3 text-warning" />
                        {row.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'warning' | 'accent' | 'neutral';
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === 'warning'
      ? { border: 'border-warning/30', value: 'text-warning', icon: 'text-warning' }
      : tone === 'accent'
      ? { border: 'border-accent/30', value: 'text-accent', icon: 'text-accent' }
      : { border: 'border-border-subtle', value: 'text-primary', icon: 'text-secondary' };

  return (
    <div className={`rounded-lg border ${toneClass.border} bg-surface px-5 py-4`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-tertiary font-mono">
        <span className={toneClass.icon}>{icon}</span>
        {label}
      </div>
      <div className={`mt-2 text-3xl font-display font-bold ${toneClass.value}`}>{value}</div>
      <div className="mt-1 text-[11px] text-tertiary">{sub}</div>
    </div>
  );
}

/* ---------------- Shared Panel ---------------- */

function Panel({
  index,
  icon,
  label,
  accent = false,
  children,
}: {
  index: string;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  const headColor = accent ? 'text-accent' : 'text-secondary';
  const cardBorder = accent ? 'border-accent/25' : 'border-border-subtle';

  return (
    <section className={`relative rounded-lg border ${cardBorder} bg-surface`}>
      <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3.5">
        <span className={`font-mono text-xs ${headColor}`}>{index}</span>
        <span className={headColor}>{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-primary font-mono">
          {label}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
