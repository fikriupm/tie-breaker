export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ProConItem {
  id: string;
  text: string;
  impact: ImpactLevel;
  category: string;
  explanation?: string;
}

export interface OptionProsCons {
  optionName: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  scoreEstimate: number; // e.g. 1-100 or weighted score
}

export interface CriterionRating {
  score: number; // 1 to 10
  verdictBadge: 'Strong' | 'Average' | 'Weak' | 'Caution';
  summary: string;
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  category: string;
  weight: 'critical' | 'high' | 'medium';
  description: string;
  ratings: Record<string, CriterionRating>;
}

export interface SwotItem {
  id: string;
  point: string;
  detail: string;
}

export interface OptionSwot {
  optionName: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

export interface ConditionalVerdict {
  condition: string;
  recommendedOption: string;
  rationale: string;
}

export interface Verdict {
  headline: string;
  recommendedOption: string;
  confidenceScore: number; // e.g. 85%
  deepReasoning: string;
  conditionalRecommendations: ConditionalVerdict[];
  hiddenBlindSpots: string[];
  immediateActionPlan: string[];
}

export interface DecisionAnalysis {
  id: string;
  createdAt: number;
  title: string;
  context?: string;
  options: string[];
  keyPriorities: string[];
  executiveSummary: string;
  prosAndCons: OptionProsCons[];
  comparisonMatrix: {
    criteria: ComparisonCriterion[];
    overallScores: Record<string, number>;
    bestFitOption: string;
  };
  swotAnalysis: OptionSwot[];
  verdict: Verdict;
}

export type AnalysisTab = 'all' | 'pros-cons' | 'comparison' | 'swot' | 'verdict';

export interface FollowUpQuestion {
  question: string;
  answer: string;
  timestamp: number;
}
