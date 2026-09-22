import React, { useState } from "react";
import { DecisionAnalysis, AnalysisTab } from "../types";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Scale, 
  Table2, 
  Compass, 
  Award,
  Layers,
  ArrowLeft
} from "lucide-react";

interface ExecutiveSummaryProps {
  analysis: DecisionAnalysis;
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
  onBackToInput: () => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  analysis,
  activeTab,
  onTabChange,
  onBackToInput,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    let md = `# Decision Analysis: ${analysis.title}\n\n`;
    md += `## Executive Summary\n${analysis.executiveSummary}\n\n`;
    md += `## The Tiebreaker Verdict\n**Recommended:** ${analysis.verdict.recommendedOption} (${analysis.verdict.confidenceScore}% confidence)\n\n`;
    md += `${analysis.verdict.headline}\n\n${analysis.verdict.deepReasoning}\n\n`;

    md += `### Conditional Recommendations\n`;
    analysis.verdict.conditionalRecommendations.forEach((c) => {
      md += `- **${c.condition}** → **${c.recommendedOption}**: ${c.rationale}\n`;
    });

    md += `\n### Pros and Cons Overview\n`;
    analysis.prosAndCons.forEach((op) => {
      md += `\n#### ${op.optionName}\n**Pros:**\n`;
      op.pros.forEach((p) => (md += `- [${p.impact.toUpperCase()}] ${p.text} (${p.category})\n`));
      md += `\n**Cons:**\n`;
      op.cons.forEach((c) => (md += `- [${c.impact.toUpperCase()}] ${c.text} (${c.category})\n`));
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: AnalysisTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "all", label: "Executive Brief", icon: Layers },
    { id: "pros-cons", label: "Pros & Cons", icon: Scale, badge: `${analysis.prosAndCons.reduce((acc, curr) => acc + curr.pros.length + curr.cons.length, 0)}` },
    { id: "comparison", label: "Comparison Matrix", icon: Table2, badge: `${analysis.comparisonMatrix.criteria.length}` },
    { id: "swot", label: "SWOT Analysis", icon: Compass },
    { id: "verdict", label: "The Verdict", icon: Award, badge: `${analysis.verdict.confidenceScore}%` },
  ];

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            onClick={onBackToInput}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Dilemma & Options</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-medium text-stone-700 transition-colors"
              title="Copy formatted markdown report"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title & Stated Dilemma */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-900 text-amber-400">
              Active Dilemma
            </span>
            <span className="text-xs text-stone-500">
              Comparing {analysis.options.length} Paths
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
            {analysis.title}
          </h1>

          {/* Executive Summary Quote Callout */}
          <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/90 text-stone-700 text-sm leading-relaxed">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-stone-900 mb-1">Executive Summary</p>
                <p className="text-stone-600">{analysis.executiveSummary}</p>
              </div>
            </div>

            {/* Key Priorities Chips */}
            {analysis.keyPriorities && analysis.keyPriorities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-200/70 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-stone-500 mr-1">Evaluated Against:</span>
                {analysis.keyPriorities.map((pri, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-stone-700 border border-stone-200"
                  >
                    {pri}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 border-b border-stone-200 -mb-[1px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-stone-900 text-stone-900 font-semibold"
                    : "border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-stone-900" : "text-stone-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
