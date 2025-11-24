
export interface ProbabilityData {
  name: string;
  value: number;
  fill?: string;
}

export interface Statistics {
  recentPerformance: string;
  last5GamesForm: string;
  avgGoalsScoredConceded: string;
  homeAwayStrength: string;
  defensiveConsistency: string;
  offensiveAggression: string;
  goalPatterns: string;
  openClosedGameTrends: string;
}

export interface Probabilities {
  winA: number;
  draw: number;
  winB: number;
  over15: number;
  over25: number;
  btts: number;
  goalFirstHalf: number;
  goalAfter75: number;
}

export interface HiddenPatterns {
  earlyGoalTeam: string;
  lateGoalTeam: string;
  concedeLateTeam: string;
  shutoffAfterGoalTeam: string;
  pressurePeaks: string;
  dangerousMoments: string;
  liveEntryMinutes: string;
}

export interface Trends {
  winLossSequence: string;
  gamesWithoutScoring: string;
  gamesWithoutConceding: string;
  performanceVsSimilar: string;
  evolutionOrDecline: string;
}

export interface Psychology {
  motivationPressure: string;
  squadMorale: string;
  matchType: string;
  physicalWear: string;
  travelFatigue: string;
  psychologicalClimate: string;
}

export interface SafeEntries {
  bestPreLive: string;
  bestLive: string;
  recommendedMinutes: string;
  mostReliableType: string;
  indicatedLine: string;
}

export interface Risks {
  volatility: string;
  inconsistency: string;
  unpredictableHistory: string;
  commonBettingGaffes: string;
  underdogSignals: string;
}

export interface Strategy {
  entryPlan: string;
  exitPlan: string;
  suggestedStake: string;
  avoid: string;
  finalRead: string;
}

export interface HighValueTip {
  market: string;
  selection: string;
  probability: string;
  reason: string;
}

export interface AnalysisResult {
  matchTitle: string;
  highValueTips: HighValueTip[];
  statistics: Statistics;
  probabilities: Probabilities;
  hiddenPatterns: HiddenPatterns;
  trends: Trends;
  psychology: Psychology;
  safeEntries: SafeEntries;
  risks: Risks;
  strategy: Strategy;
  summary: string;
  groundingUrls?: string[];
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  STATS = 'STATS',
  PROBS = 'PROBS',
  PATTERNS = 'PATTERNS',
  TRENDS = 'TRENDS',
  PSYCH = 'PSYCH',
  SAFE = 'SAFE',
  RISKS = 'RISKS',
  STRATEGY = 'STRATEGY',
  SUMMARY = 'SUMMARY'
}
