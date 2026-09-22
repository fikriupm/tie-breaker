import React, { useState } from "react";
import { ComparisonCriterion } from "../types";
import { Table, Trophy, ArrowUpDown, Check, AlertTriangle, ShieldCheck } from "lucide-react";

interface ComparisonTableViewProps {
  criteria: ComparisonCriterion[];
  overallScores: Record<string, number>;
  bestFitOption: string;
  options: string[];
}

const BADGE_STYLES: Record<string, string> = {
  Strong: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Average: "bg-stone-100 text-stone-700 border-stone-200",
  Weak: "bg-amber-100 text-amber-800 border-amber-200",
  Caution: "bg-rose-100 text-rose-800 border-rose-200",
};

const WEIGHT_LABELS: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical Weight", class: "bg-stone-900 text-amber-300" },
  high: { label: "High Priority", class: "bg-amber-100 text-amber-900" },
  medium: { label: "Moderate", class: "bg-stone-100 text-stone-600" },
};

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({
  criteria,
  overallScores,
  bestFitOption,
  options,
}) => {
  const [filterWeight, setFilterWeight] = useState<string>("all");

  const filteredCriteria = filterWeight === "all"
    ? criteria
    : criteria.filter((c) => c.weight === filterWeight);

  return (
    <div className="space-y-6">
      {/* Overall Score Leaderboard */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Quantitative Synthesis
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Multi-Criteria Weighted Ranking</span>
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-500">Filter criteria:</span>
            {["all", "critical", "high"].map((w) => (
              <button
                key={w}
                onClick={() => setFilterWeight(w)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterWeight === w
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {w === "all" ? "All Criteria" : w.charAt(0).toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Score Leaderboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.map((optionName, idx) => {
            const score = overallScores[optionName] || 75;
            const isWinner = optionName === bestFitOption;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isWinner
                    ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/60"
                    : "bg-stone-50/60 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Option {String.fromCharCode(65 + idx)}
                  </span>
                  {isWinner && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      Highest Fit
                    </span>
                  )}
                </div>

                <p className="font-serif font-bold text-stone-900 text-sm line-clamp-1 mb-2">
                  {optionName}
                </p>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-500">Weighted Score:</span>
                  <span className="text-2xl font-black text-stone-900 tracking-tight">
                    {score}
                    <span className="text-xs font-normal text-stone-400">/100</span>
                  </span>
                </div>

                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner ? "bg-amber-600" : "bg-stone-700"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div>
            <h4 className="font-serif font-bold text-stone-900 text-base">
              Direct Side-by-Side Comparison Matrix
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Evaluating each choice across critical trade-off dimensions (1 = Low fit, 10 = Ideal fit)
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {filteredCriteria.length} dimensions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 w-1/3 min-w-[220px]">
                  Decision Dimension
                </th>
                {options.map((opt, i) => (
                  <th key={i} className="py-3.5 px-4 sm:px-6 min-w-[240px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-white text-[10px] flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="truncate max-w-[200px]" title={opt}>
                        {opt}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 text-sm">
              {filteredCriteria.map((criterion, rowIdx) => {
                const weightCfg = WEIGHT_LABELS[criterion.weight] || WEIGHT_LABELS.medium;

                return (
                  <tr key={criterion.id || rowIdx} className="hover:bg-stone-50/50 transition-colors">
                    {/* Dimension Column */}
                    <td className="py-4 px-4 sm:px-6 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">
                            {criterion.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            {criterion.category}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${weightCfg.class}`}>
                            {weightCfg.label}
                          </span>
                        </div>
                        {criterion.description && (
                          <p className="text-xs text-stone-500 mt-1 leading-normal">
                            {criterion.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Ratings Columns */}
                    {options.map((optName, colIdx) => {
                      const rating = criterion.ratings[optName] || {
                        score: 7,
                        verdictBadge: "Average" as const,
                        summary: "Balanced trade-off.",
                      };
                      const badgeClass = BADGE_STYLES[rating.verdictBadge] || BADGE_STYLES.Average;

                      return (
                        <td key={colIdx} className="py-4 px-4 sm:px-6 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}
                              >
                                {rating.verdictBadge}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-black text-stone-900 text-base">
                                  {rating.score}
                                </span>
                                <span className="text-[11px] text-stone-400 font-mono">/10</span>
                              </div>
                            </div>

                            {/* Mini Score Bar */}
                            <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rating.score >= 8
                                    ? "bg-emerald-600"
                                    : rating.score >= 5
                                    ? "bg-stone-600"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${rating.score * 10}%` }}
                              />
                            </div>

                            <p className="text-xs text-stone-700 leading-snug pt-1">
                              {rating.summary}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
