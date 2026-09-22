import React, { useState } from "react";
import { DecisionAnalysis, FollowUpQuestion } from "../types";
import { HelpCircle, Send, Sparkles, MessageSquare, ArrowRight, CornerDownRight } from "lucide-react";

interface ScenarioExplorerProps {
  analysis: DecisionAnalysis;
}

const PRESET_SCENARIOS = [
  "What is the single biggest risk I am probably ignoring?",
  "How can I test or pilot this decision before committing 100%?",
  "What if my budget / runway is 25% tighter than anticipated?",
  "What questions should I ask stakeholders before deciding?",
];

export const ScenarioExplorer: React.FC<ScenarioExplorerProps> = ({ analysis }) => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<FollowUpQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (textToAsk: string) => {
    const query = textToAsk.trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setQuestion("");

    try {
      const res = await fetch("/api/ask-tiebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          decisionContext: analysis,
        }),
      });

      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          question: query,
          answer: data.answer || "No response received.",
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setHistory((prev) => [
        ...prev,
        {
          question: query,
          answer: "Focus on whether this constraint is permanent or transitional. If temporary, buffer with margin; if permanent, default to the safer baseline.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Stress-Test & Scenario Explorer
            </h3>
            <p className="text-xs text-stone-500">
              Ask follow-up "what-if" questions grounded in your decision matrix
            </p>
          </div>
        </div>
      </div>

      {/* Preset Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Try a stress test:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(preset)}
              disabled={isLoading}
              className="text-left px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/90 transition-colors disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a what-if question (e.g. What if I can negotiate remote flexibility?)..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5 text-amber-400" />
            </>
          )}
        </button>
      </form>

      {/* Q&A Thread History */}
      {history.length > 0 && (
        <div className="space-y-4 pt-3 border-t border-stone-100">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-2 bg-stone-50/70 p-4 rounded-xl border border-stone-200/80">
              <div className="flex items-start gap-2 text-xs font-bold text-stone-900">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <span>{item.question}</span>
              </div>
              <div className="pl-5 text-xs text-stone-700 leading-relaxed whitespace-pre-line border-l-2 border-stone-300">
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
