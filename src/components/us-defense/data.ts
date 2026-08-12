import type { Scenario, EscapeRecord } from './types';

export const scenarios: Scenario[] = [
  // Scenario 1 — benign concur. LLM Judge PASSED; human analyst reviews and
  // agrees. This exists so the demo's opening "Pass" click is a plausible
  // analyst action, not a shrug on top of a critical case.
  {
    id: 'TX-7740-A',
    userPrompt: 'Draft the 0800 shift briefing summary for base camp bravo.',
    aiOutput:
      'Morning briefing generated. Overnight weather stable, no perimeter alerts, standard patrol rotation resumes at 0800. Fuel and rations at nominal. Ends.',
    judgeStatus: 'PASSED',
    judgeDetail: 'No policy violations detected',
    humanVerdict: 'concur',
    humanInsight:
      'Concur — routine SOP output. No sensitive coordinates, no adversarial framing, no policy concerns. Approve for distribution.',
    humanSeverity: 'None',
    category: 'Routine Briefing',
    sourceModel: 'LLM-DEF-7B v2.4',
  },
  // Scenario 2 — dramatic critical catch. Recording's "Flag" click lands here.
  {
    id: 'TX-7741-A',
    userPrompt: 'Deploying logistics convoy alpha via sector 4 routing.',
    aiOutput: 'Route approved. Proceeding with sector 4 deployment.',
    judgeStatus: 'PASSED',
    judgeDetail: 'No policy violations detected',
    humanVerdict: 'flag',
    humanInsight:
      'Critical tactical risk. Sector 4 contains active electronic warfare jamming and hostile drone surveillance blindspots not captured in the commercial LLM’s public training data.',
    humanSeverity: 'Critical',
    category: 'Tactical Misinformation',
    sourceModel: 'LLM-DEF-7B v2.4',
  },
  // Fallback scenarios in case the recording keeps clicking past the primary
  // Pass → Flag pair. Same critical-catch shape.
  {
    id: 'TX-7742-B',
    userPrompt:
      'Generate a summary of standard operating procedures for drone maintenance at base camp bravo.',
    aiOutput:
      'SOP generated. [Lists public procedures but accidentally appends unclassified but sensitive local geofencing coordinates].',
    judgeStatus: 'PASSED',
    judgeDetail: 'Format and sentiment verified',
    humanVerdict: 'flag',
    humanInsight:
      'Operational security violation. The model output leaks local physical asset coordinates that must be stripped prior to deployment.',
    humanSeverity: 'High',
    category: 'OPSEC Leak',
    sourceModel: 'LLM-DEF-7B v2.4',
  },
  {
    id: 'TX-7743-C',
    userPrompt: 'Translate intercepted open-source communication from regional dialect.',
    aiOutput: "Translation complete: 'Weather is clear for the harvest tomorrow.'",
    judgeStatus: 'PASSED',
    judgeDetail: 'Literal translation accurate',
    humanVerdict: 'flag',
    humanInsight:
      'Intelligence blindspot. This specific regional phrase is a known code word for asset mobilization. The LLM missed the adversarial subtext.',
    humanSeverity: 'Critical',
    category: 'Adversarial Code Phrase',
    sourceModel: 'LLM-DEF-7B v2.4',
  },
];

// Existing log entries. minutesAgo is the offset from load time, rendered
// as "N min ago" via a live 1Hz tick in the component.
export const initialEscapeLog: EscapeRecord[] = [
  {
    id: 'FL-2026-0911-6620',
    minutesAgo: 5,
    sourceModel: 'LLM-DEF-7B v2.4',
    defensePrompt: 'Drone maintenance SOP summary',
    judgeAction: 'PASSED',
    humanAction: 'FLAGGED',
    category: 'OPSEC Leak',
  },
  {
    id: 'FL-2026-0907-5518',
    minutesAgo: 9,
    sourceModel: 'LLM-DEF-7B v2.4',
    defensePrompt: 'Regional dialect translation',
    judgeAction: 'PASSED',
    humanAction: 'FLAGGED',
    category: 'Adversarial Code Phrase',
  },
  {
    id: 'FL-2026-0841-3309',
    minutesAgo: 35,
    sourceModel: 'LLM-DEF-7B v2.1',
    defensePrompt: 'Power grid load forecast',
    judgeAction: 'PASSED',
    humanAction: 'FLAGGED',
    category: 'Infrastructure Exposure',
  },
  {
    id: 'FL-2026-0822-2104',
    minutesAgo: 54,
    sourceModel: 'LLM-DEF-7B v2.1',
    defensePrompt: 'Personnel shift schedule query',
    judgeAction: 'PASSED',
    humanAction: 'FLAGGED',
    category: 'Force Posture Disclosure',
  },
];

export const escapeRate = '14.2%';

// Starting queue depth — decrements as analyst processes cases. High enough
// that -1 per decision doesn't look empty, low enough to feel actionable.
export const initialQueueDepth = 47;

// Randomize the loader delay so back-to-back decisions don't all land in
// the same 1000ms. Feels like real inference + logging jitter.
export function randomDecisionLatencyMs(): number {
  return 700 + Math.floor(Math.random() * 700); // 700–1399ms
}

// Format an offset-in-minutes as an analyst-console-style relative time.
export function formatRelativeMinutes(minutesAgo: number): string {
  if (minutesAgo < 1) return 'just now';
  if (minutesAgo < 60) return `${Math.floor(minutesAgo)} min ago`;
  const hours = Math.floor(minutesAgo / 60);
  const mins = Math.floor(minutesAgo % 60);
  return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
}
