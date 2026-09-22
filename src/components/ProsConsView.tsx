import React, { useState } from "react";
import { OptionProsCons, ProConItem, ImpactLevel } from "../types";
import { CheckCircle2, XCircle, Plus, Filter, AlertCircle, Info } from "lucide-react";

interface ProsConsViewProps {
  optionsProsCons: OptionProsCons[];
  onAddCustomItem?: (optionIndex: number, type: "pros" | "cons", item: ProConItem) => void;
}

const IMPACT_STYLES: Record<ImpactLevel, { bg: string; text: string; label: string; border: string }> = {
  critical: { bg: "bg-rose-50", text: "text-rose-700", label: "Critical Impact", border: "border-rose-200" },
  high: { bg: "bg-amber-50", text: "text-amber-800", label: "High Impact", border: "border-amber-200" },
  medium: { bg: "bg-stone-100", text: "text-stone-700", label: "Medium Impact", border: "border-stone-200" },
  low: { bg: "bg-stone-50", text: "text-stone-500", label: "Minor Impact", border: "border-stone-200" },
};

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  optionsProsCons,
  onAddCustomItem,
}) => {
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [activeOptionTab, setActiveOptionTab] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<{ optionIndex: number; type: "pros" | "cons" } | null>(null);
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Personal Factor");
  const [newItemImpact, setNewItemImpact] = useState<ImpactLevel>("high");

  const filterItems = (items: ProConItem[]) => {
    if (impactFilter === "all") return items;
    return items.filter((i) => i.impact === impactFilter);
  };

  const handleSaveCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddModal || !newItemText.trim()) return;

    const newItem: ProConItem = {
      id: "custom_" + Date.now(),
      text: newItemText.trim(),
      category: newItemCategory.trim() || "Custom Factor",
      impact: newItemImpact,
    };

    onAddCustomItem?.(showAddModal.optionIndex, showAddModal.type, newItem);
    setShowAddModal(null);
    setNewItemText("");
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-semibold text-stone-700">Filter by Impact:</span>
          <div className="flex items-center gap-1">
            {["all", "critical", "high", "medium"].map((filter) => (
              <button
                key={filter}
                onClick={() => setImpactFilter(filter)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  impactFilter === filter
                    ? "bg-stone-900 text-white font-semibold"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {filter === "all" ? "All Impacts" : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Option Navigator for mobile/compact screens */}
        <div className="flex items-center gap-1 sm:hidden">
          {optionsProsCons.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setActiveOptionTab(idx)}
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                activeOptionTab === idx ? "bg-stone-900 text-white" : "text-stone-600 bg-white border border-stone-200"
              }`}
            >
              Option {String.fromCharCode(65 + idx)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {optionsProsCons.map((opt, optIndex) => {
          const filteredPros = filterItems(opt.pros);
          const filteredCons = filterItems(opt.cons);
          const totalPoints = opt.pros.length + opt.cons.length;
          const proRatio = totalPoints > 0 ? Math.round((opt.pros.length / totalPoints) * 100) : 50;

          return (
            <div
              key={optIndex}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col"
            >
              {/* Option Header */}
              <div className="p-5 border-b border-stone-200 bg-stone-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-stone-200 text-stone-800">
                    Option {String.fromCharCode(65 + optIndex)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                    <span>Viability Score:</span>
                    <span className="font-bold text-stone-900">{opt.scoreEstimate}/100</span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                  {opt.optionName}
                </h3>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                  {opt.summary}
                </p>

                {/* Balance Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-stone-500 font-medium mb-1">
                    <span className="text-emerald-700">{opt.pros.length} Pros ({proRatio}%)</span>
                    <span className="text-rose-700">{opt.cons.length} Cons ({100 - proRatio}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${proRatio}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Pros & Cons Columns */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                {/* Pros List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Pros ({filteredPros.length})
                    </span>
                    <button
                      onClick={() => setShowAddModal({ optionIndex: optIndex, type: "pros" })}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Pro
                    </button>
                  </div>

                  {filteredPros.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-3 text-center">
                      No pros match this filter.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredPros.map((item) => {
                        const impactCfg = IMPACT_STYLES[item.impact] || IMPACT_STYLES.medium;
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/80 hover:border-emerald-200 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${impactCfg.bg} ${impactCfg.text} ${impactCfg.border}`}
                              >
                                {impactCfg.label}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-stone-900 leading-snug">
                              {item.text}
                            </p>
                            {item.explanation && (
                              <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                                {item.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Cons List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Cons ({filteredCons.length})
                    </span>
                    <button
                      onClick={() => setShowAddModal({ optionIndex: optIndex, type: "cons" })}
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Con
                    </button>
                  </div>

                  {filteredCons.length === 0 ? (
                    <p className="text-xs text-stone-400 italic py-3 text-center">
                      No cons match this filter.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredCons.map((item) => {
                        const impactCfg = IMPACT_STYLES[item.impact] || IMPACT_STYLES.medium;
                        return (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-rose-50/40 border border-rose-100/80 hover:border-rose-200 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 bg-rose-100/70 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${impactCfg.bg} ${impactCfg.text} ${impactCfg.border}`}
                              >
                                {impactCfg.label}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-stone-900 leading-snug">
                              {item.text}
                            </p>
                            {item.explanation && (
                              <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                                {item.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-serif font-bold text-stone-900 text-base">
                Add Custom {showAddModal.type === "pros" ? "Pro (+)" : "Con (-)"} to{" "}
                {optionsProsCons[showAddModal.optionIndex]?.optionName}
              </h4>
              <button
                onClick={() => setShowAddModal(null)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Point / Factor Description
                </label>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="e.g. Spouse is excited about the neighborhood"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="e.g. Family, Lifestyle"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Impact Level
                  </label>
                  <select
                    value={newItemImpact}
                    onChange={(e) => setNewItemImpact(e.target.value as ImpactLevel)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 bg-white"
                  >
                    <option value="critical">Critical Impact</option>
                    <option value="high">High Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
                >
                  Save Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
