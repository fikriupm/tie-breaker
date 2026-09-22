import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DecisionInputForm } from "./components/DecisionInputForm";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { ProsConsView } from "./components/ProsConsView";
import { ComparisonTableView } from "./components/ComparisonTableView";
import { SwotView } from "./components/SwotView";
import { VerdictView } from "./components/VerdictView";
import { ScenarioExplorer } from "./components/ScenarioExplorer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { DecisionAnalysis, AnalysisTab, ProConItem } from "./types";
import { AlertCircle } from "lucide-react";

const STORAGE_KEY = "the_tiebreaker_saved_decisions";

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<DecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load saved decisions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved decisions:", e);
    }
  }, []);

  // Save to localStorage when decisions change
  const saveDecisionsList = (updated: DecisionAnalysis[]) => {
    setSavedDecisions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save decisions to localStorage:", e);
    }
  };

  const handleAnalyzeDecision = async (
    title: string,
    options: string[],
    context: string,
    priorities: string[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          options,
          context,
          priorities,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: DecisionAnalysis = await res.json();
      setCurrentAnalysis(data);
      setActiveTab("all");

      // Auto-save to history
      const exists = savedDecisions.some((d) => d.id === data.id);
      if (!exists) {
        const updated = [data, ...savedDecisions.slice(0, 19)]; // Keep up to 20 decisions
        saveDecisionsList(updated);
      }
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      setError("Unable to process decision right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomItem = (
    optionIndex: number,
    type: "pros" | "cons",
    item: ProConItem
  ) => {
    if (!currentAnalysis) return;

    const updatedOptions = [...currentAnalysis.prosAndCons];
    if (updatedOptions[optionIndex]) {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [type]: [...updatedOptions[optionIndex][type], item],
      };

      const updatedAnalysis = {
        ...currentAnalysis,
        prosAndCons: updatedOptions,
      };

      setCurrentAnalysis(updatedAnalysis);

      // Update in saved list as well
      const updatedSaved = savedDecisions.map((d) =>
        d.id === updatedAnalysis.id ? updatedAnalysis : d
      );
      saveDecisionsList(updatedSaved);
    }
  };

  const handleDeleteDecision = (id: string) => {
    const updated = savedDecisions.filter((d) => d.id !== id);
    saveDecisionsList(updated);
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
    }
  };

  const handleClearAllHistory = () => {
    saveDecisionsList([]);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans flex flex-col selection:bg-amber-200">
      <Header
        onNewDecision={() => {
          setCurrentAnalysis(null);
          setError(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedDecisions.length}
        hasActiveAnalysis={!!currentAnalysis}
      />

      <main className="flex-1">
        {error && (
          <div className="max-w-3xl mx-auto mt-4 px-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold text-rose-900 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {!currentAnalysis ? (
          <DecisionInputForm
            onSubmit={handleAnalyzeDecision}
            isLoading={isLoading}
          />
        ) : (
          <div>
            <ExecutiveSummary
              analysis={currentAnalysis}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBackToInput={() => setCurrentAnalysis(null)}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
              {/* Tab 1: All-In-One Executive Brief */}
              {activeTab === "all" && (
                <div className="space-y-10">
                  <VerdictView verdict={currentAnalysis.verdict} />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-serif font-bold text-stone-900">
                        Pros & Cons at a Glance
                      </h3>
                      <button
                        onClick={() => setActiveTab("pros-cons")}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                      >
                        View Full Pros & Cons →
                      </button>
                    </div>
                    <ProsConsView
                      optionsProsCons={currentAnalysis.prosAndCons}
                      onAddCustomItem={handleAddCustomItem}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-serif font-bold text-stone-900">
                        Side-by-Side Comparison Matrix
                      </h3>
                      <button
                        onClick={() => setActiveTab("comparison")}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                      >
                        Inspect Full Matrix Details →
                      </button>
                    </div>
                    <ComparisonTableView
                      criteria={currentAnalysis.comparisonMatrix.criteria}
                      overallScores={currentAnalysis.comparisonMatrix.overallScores}
                      bestFitOption={currentAnalysis.comparisonMatrix.bestFitOption}
                      options={currentAnalysis.options}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-serif font-bold text-stone-900">
                        Strategic SWOT Analysis
                      </h3>
                      <button
                        onClick={() => setActiveTab("swot")}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2"
                      >
                        Deep Dive into SWOT →
                      </button>
                    </div>
                    <SwotView swotAnalysis={currentAnalysis.swotAnalysis} />
                  </div>

                  <ScenarioExplorer analysis={currentAnalysis} />
                </div>
              )}

              {/* Tab 2: Dedicated Pros & Cons */}
              {activeTab === "pros-cons" && (
                <div className="space-y-8">
                  <ProsConsView
                    optionsProsCons={currentAnalysis.prosAndCons}
                    onAddCustomItem={handleAddCustomItem}
                  />
                  <ScenarioExplorer analysis={currentAnalysis} />
                </div>
              )}

              {/* Tab 3: Dedicated Comparison Matrix */}
              {activeTab === "comparison" && (
                <div className="space-y-8">
                  <ComparisonTableView
                    criteria={currentAnalysis.comparisonMatrix.criteria}
                    overallScores={currentAnalysis.comparisonMatrix.overallScores}
                    bestFitOption={currentAnalysis.comparisonMatrix.bestFitOption}
                    options={currentAnalysis.options}
                  />
                  <ScenarioExplorer analysis={currentAnalysis} />
                </div>
              )}

              {/* Tab 4: Dedicated SWOT */}
              {activeTab === "swot" && (
                <div className="space-y-8">
                  <SwotView swotAnalysis={currentAnalysis.swotAnalysis} />
                  <ScenarioExplorer analysis={currentAnalysis} />
                </div>
              )}

              {/* Tab 5: Dedicated Verdict */}
              {activeTab === "verdict" && (
                <div className="space-y-8">
                  <VerdictView verdict={currentAnalysis.verdict} />
                  <ScenarioExplorer analysis={currentAnalysis} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(dec) => {
          setCurrentAnalysis(dec);
          setActiveTab("all");
        }}
        onDeleteDecision={handleDeleteDecision}
        onClearAll={handleClearAllHistory}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-6 text-center text-xs text-stone-500">
        <p className="font-serif font-semibold text-stone-700">The Tiebreaker</p>
        <p className="mt-1">
          Designed for structured, rational decision-making • Pros & Cons • Comparison Matrix • SWOT Analysis
        </p>
      </footer>
    </div>
  );
}
