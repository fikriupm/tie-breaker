import React, { useState } from "react";
import { OptionSwot } from "../types";
import { ShieldCheck, AlertCircle, Compass, Zap } from "lucide-react";

interface SwotViewProps {
  swotAnalysis: OptionSwot[];
}

export const SwotView: React.FC<SwotViewProps> = ({ swotAnalysis }) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  if (!swotAnalysis || swotAnalysis.length === 0) {
    return <div className="p-8 text-center text-stone-400">No SWOT analysis available.</div>;
  }

  const currentSwot = swotAnalysis[selectedOptionIndex] || swotAnalysis[0];

  return (
    <div className="space-y-6">
      {/* Option Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 pl-2">
            Select Option for SWOT:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {swotAnalysis.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedOptionIndex === idx
                    ? "bg-stone-900 text-amber-400 shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Option {String.fromCharCode(65 + idx)}: {item.optionName}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-stone-500 hidden sm:inline">
          Internal (Strengths/Weaknesses) vs. External (Opportunities/Threats)
        </span>
      </div>

      {/* Active Option Title Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Strategic SWOT Evaluation
          </span>
          <h3 className="text-xl font-serif font-bold text-white mt-0.5">
            {currentSwot.optionName}
          </h3>
        </div>
        <div className="text-xs text-stone-400 bg-stone-800/90 px-3 py-1 rounded-lg border border-stone-700">
          Option {String.fromCharCode(65 + selectedOptionIndex)} of {swotAnalysis.length}
        </div>
      </div>

      {/* 2x2 SWOT Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths Quadrant */}
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Strengths</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
              Internal Advantage
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {currentSwot.strengths.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/70">
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  {item.point}
                </p>
                {item.detail && (
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses Quadrant */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
            <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span>Weaknesses</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
              Internal Friction
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {currentSwot.weaknesses.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/70">
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  {item.point}
                </p>
                {item.detail && (
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities Quadrant */}
        <div className="bg-white rounded-2xl border border-blue-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100">
            <div className="flex items-center gap-2 text-blue-900 font-serif font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                <Zap className="w-4 h-4" />
              </div>
              <span>Opportunities</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
              External Upside
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {currentSwot.opportunities.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-xl bg-blue-50/40 border border-blue-100/70">
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  {item.point}
                </p>
                {item.detail && (
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Threats Quadrant */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-100">
            <div className="flex items-center gap-2 text-rose-900 font-serif font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <Compass className="w-4 h-4" />
              </div>
              <span>Threats</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
              External Risks
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {currentSwot.threats.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-xl bg-rose-50/40 border border-rose-100/70">
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  {item.point}
                </p>
                {item.detail && (
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
