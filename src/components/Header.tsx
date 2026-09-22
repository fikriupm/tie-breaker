import React from "react";
import { Scale, History, PlusCircle, Sparkles } from "lucide-react";

interface HeaderProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  hasActiveAnalysis: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewDecision,
  onOpenHistory,
  savedCount,
  hasActiveAnalysis,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="app-header-brand"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-stone-900 text-lg tracking-tight">
                The Tiebreaker
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                AI Decision Engine
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Pros & Cons • Multi-Criteria Matrix • SWOT Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveAnalysis && (
            <button
              onClick={onNewDecision}
              id="header-btn-new-decision"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-300 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-stone-500" />
              <span>New Decision</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            id="header-btn-history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-200/70 border border-stone-300 transition-colors"
          >
            <History className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Saved Decisions</span>
            <span className="sm:hidden">Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-stone-900 text-white leading-tight">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
