import React, { useState } from "react";
import { Sparkles, ArrowRight, Plus, Trash2, Sliders, HelpCircle, Lightbulb } from "lucide-react";
import { SAMPLE_TEMPLATES, SampleDecisionTemplate } from "../data/sampleDecisions";

interface DecisionInputFormProps {
  onSubmit: (title: string, options: string[], context: string, priorities: string[]) => void;
  isLoading: boolean;
}

const COMMON_PRIORITIES = [
  "Financial Upside",
  "Work-Life Balance",
  "Risk Mitigation",
  "Long-term Growth",
  "Daily Energy & Happiness",
  "Autonomy & Freedom",
  "Speed & Momentum",
  "Reversibility",
];

export const DecisionInputForm: React.FC<DecisionInputFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [context, setContext] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [customPriority, setCustomPriority] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoDeduceOptions, setAutoDeduceOptions] = useState(false);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter((item) => item !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPriority.trim() && !selectedPriorities.includes(customPriority.trim())) {
      setSelectedPriorities([...selectedPriorities, customPriority.trim()]);
      setCustomPriority("");
    }
  };

  const applyTemplate = (template: SampleDecisionTemplate) => {
    setTitle(template.title);
    setOptions([...template.options]);
    setContext(template.context);
    setSelectedPriorities([...template.priorities]);
    setAutoDeduceOptions(false);
    setShowAdvanced(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const filteredOptions = autoDeduceOptions
      ? []
      : options.map((o) => o.trim()).filter(Boolean);

    onSubmit(title.trim(), filteredOptions, context.trim(), selectedPriorities);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-900 text-stone-100 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Strategic Decision Framework</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-900 tracking-tight leading-tight">
          When logic and intuition pull both ways, break the tie.
        </h1>
        <p className="mt-3 text-stone-600 max-w-xl mx-auto text-base">
          Enter your dilemma to receive a full rational breakdown: weighted Pros & Cons, side-by-side Multi-Criteria matrix, and a thorough SWOT analysis.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label htmlFor="decision-title-input" className="block text-sm font-semibold text-stone-800 mb-2">
            What decision are you trying to make? <span className="text-amber-600">*</span>
          </label>
          <textarea
            id="decision-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={3}
            placeholder="e.g. Should I accept the senior job offer in a new city or stay in my current stable remote role?"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-stone-900 placeholder:text-stone-400 text-base resize-none transition-all"
            required
          />
        </div>

        {/* Options Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <span>Competing Options</span>
              <span className="text-xs text-stone-500 font-normal">
                (Specify the paths or let AI extract them)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setAutoDeduceOptions(!autoDeduceOptions)}
              className="text-xs font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
            >
              {autoDeduceOptions ? "Switch to manual options" : "Let AI deduce options"}
            </button>
          </div>

          {!autoDeduceOptions ? (
            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs font-bold text-stone-400 text-right">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    id={`decision-option-input-${idx}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g. ${
                      idx === 0 ? "Accept new offer" : "Stay in current position"
                    })`}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-sm text-stone-900 placeholder:text-stone-400"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  id="btn-add-option"
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors ml-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another option ({options.length}/5)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Auto-Deduce Mode Active:</strong> The Tiebreaker will analyze your title and context to generate the most contrasting, realistic decision branches.
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Constraints & Priorities */}
        <div className="border-t border-stone-200/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left py-1 text-sm font-semibold text-stone-700 hover:text-stone-900"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-500" />
              <span>Context, Constraints & Stated Priorities</span>
            </span>
            <span className="text-xs text-stone-500">
              {showAdvanced ? "Hide details" : "Add context & weights (optional)"}
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-5 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Context, Timeframes, or Specific Constraints
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  placeholder="e.g. Budget is tight for 6 months, family is supportive of a move, must decide by Friday..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-sm text-stone-900 placeholder:text-stone-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  What matters most to you in this decision? (Select priorities)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_PRIORITIES.map((priority) => {
                    const isSelected = selectedPriorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => togglePriority(priority)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-stone-900 text-white shadow-xs"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {priority}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value)}
                    placeholder="Add custom factor (e.g. Commute time)"
                    className="flex-1 max-w-xs px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPriority}
                    className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-200"
                  >
                    Add Factor
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            id="btn-analyze-decision"
            disabled={isLoading || !title.trim()}
            className="w-full py-3.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>The Tiebreaker is analyzing your decision...</span>
              </>
            ) : (
              <>
                <span>Run Decision Analysis</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Example Templates */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Or try a classic dilemma template
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3.5 rounded-xl border border-stone-200/80 bg-white/70 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  {tpl.category}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:text-stone-900 transition-colors">
                  Load →
                </span>
              </div>
              <p className="text-xs font-medium text-stone-900 line-clamp-2 leading-snug">
                {tpl.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
