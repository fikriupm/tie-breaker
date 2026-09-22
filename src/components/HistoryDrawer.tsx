import React from "react";
import { DecisionAnalysis } from "../types";
import { Clock, Trash2, ArrowRight, X, Scale } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (analysis: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Saved Decisions
              </h3>
              <p className="text-xs text-stone-500">
                {savedDecisions.length} archived analyses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Decisions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <Scale className="w-10 h-10 mx-auto text-stone-300 stroke-[1.5]" />
              <p className="text-sm font-medium">No saved decisions yet.</p>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">
                Any decision you analyze is automatically preserved locally for quick review.
              </p>
            </div>
          ) : (
            savedDecisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-stone-900 bg-stone-50/50 hover:bg-white transition-all group relative cursor-pointer"
                onClick={() => {
                  onSelectDecision(dec);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                  <span>{new Date(dec.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}</span>
                  <span className="font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                    Winner: {dec.verdict?.recommendedOption || dec.options[0]}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug group-hover:text-amber-900 transition-colors">
                  {dec.title}
                </h4>

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {dec.options.length} options compared
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(dec.id);
                      }}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-stone-900 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedDecisions.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 transition-colors"
            >
              Clear All Saved
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
