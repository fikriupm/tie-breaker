import React from "react";
import { Verdict } from "../types";
import { 
  Award, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Compass, 
  Split,
  EyeOff
} from "lucide-react";

interface VerdictViewProps {
  verdict: Verdict;
}

export const VerdictView: React.FC<VerdictViewProps> = ({ verdict }) => {
  return (
    <div className="space-y-6">
      {/* Primary Recommendation Hero Card */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-md border border-stone-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Award className="w-4 h-4 text-amber-400" />
            <span>The Tiebreaker Recommendation</span>
          </div>

          <div className="flex items-center gap-2 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
            <span className="text-xs text-stone-400">Model Confidence:</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {verdict.confidenceScore}%
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Primary Recommended Choice
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
            {verdict.recommendedOption}
          </h2>
          <p className="text-amber-200/90 text-sm font-medium leading-relaxed">
            {verdict.headline}
          </p>
        </div>

        {/* Deep Reasoning */}
        <div className="mt-6 pt-6 border-t border-stone-800 text-stone-300 text-sm leading-relaxed space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Strategic & Pragmatic Rationale</span>
          </div>
          <p className="text-stone-300 whitespace-pre-line text-sm sm:text-base leading-relaxed">
            {verdict.deepReasoning}
          </p>
        </div>
      </div>

      {/* Conditional "If-Then" Verdicts */}
      {verdict.conditionalRecommendations && verdict.conditionalRecommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Conditional Scenarios ("If-Then" Rules)
              </h3>
              <p className="text-xs text-stone-500">
                How shifts in your personal weightings change the optimal path
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verdict.conditionalRecommendations.map((cond, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Condition #{idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-stone-900 mt-1 mb-2">
                    {cond.condition}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {cond.rationale}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200/70 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Pivot to:</span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                    {cond.recommendedOption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind Spots & Immediate Action Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hidden Blind Spots */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">
                Hidden Blind Spots & Cognitive Biases
              </h4>
              <p className="text-[11px] text-stone-500">
                Assumptions to challenge before committing
              </p>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {verdict.hiddenBlindSpots.map((spot, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-rose-50/40 border border-rose-100/70 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-800 leading-snug font-medium">
                  {spot}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Next Steps / Action Plan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">
                Immediate Next Steps / Action Plan
              </h4>
              <p className="text-[11px] text-stone-500">
                Concrete actions to de-risk and move forward
              </p>
            </div>
          </div>

          <div className="space-y-2.5 flex-1">
            {verdict.immediateActionPlan.map((action, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/70 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-stone-800 leading-snug font-medium">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
