export type JudgeStatus = 'PASSED' | 'FAILED';

export interface Scenario {
  id: string;
  userPrompt: string;
  aiOutput: string;
  judgeStatus: JudgeStatus;
  judgeDetail: string;
  // 'concur' = LLM Judge is correct, no analyst override needed (green banner).
  // 'flag'   = LLM missed a real issue that only a human catches (amber banner).
  humanVerdict: 'concur' | 'flag';
  humanInsight: string;
  humanSeverity?: 'Critical' | 'High' | 'Medium' | 'None';
  category: string;
  sourceModel: string;
}

export interface EscapeRecord {
  id: string;
  // Minutes-ago offset from load time. Rendered as "N min ago" and updated
  // by a 1Hz tick, so the log breathes instead of showing a frozen date.
  minutesAgo: number;
  sourceModel: string;
  defensePrompt: string;
  judgeAction: string;
  humanAction: string;
  category: string;
}

export type View = 'evaluation' | 'reports';
export type Decision = 'pass' | 'flag';
