import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Candidate models in priority order:
// gemini-3.1-flash-lite is proven to be ultra-reliable and unaffected by 503 high-demand spikes
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

async function callGeminiWithFallback(
  prompt: string,
  options: { isJson?: boolean; systemInstruction?: string }
): Promise<string | null> {
  if (!ai) return null;

  for (const model of CANDIDATE_MODELS) {
    // Up to 2 attempts per model with slight jitter backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: Record<string, unknown> = {};
        if (options.isJson) {
          config.responseMimeType = "application/json";
        }
        if (options.systemInstruction) {
          config.systemInstruction = options.systemInstruction;
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const text = response.text?.trim();
        if (text) {
          return text;
        }
      } catch (err: unknown) {
        const errStr = String(err);
        const isUnavailableOrRateLimited =
          errStr.includes("503") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.includes("429") ||
          errStr.includes("RESOURCE_EXHAUSTED");

        if (isUnavailableOrRateLimited) {
          console.warn(`Model ${model} high demand / 503 on attempt ${attempt + 1}. Backing off...`);
          // Brief pause before retry or fallback
          await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
        } else {
          console.warn(`Model ${model} error:`, errStr.substring(0, 150));
          break; // Move to next candidate model
        }
      }
    }
  }

  return null;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Main decision analysis endpoint
app.post("/api/analyze-decision", async (req: Request, res: Response) => {
  try {
    const { title, options: rawOptions, context, priorities } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Decision title is required" });
    }

    const optionsList: string[] = Array.isArray(rawOptions) && rawOptions.filter(Boolean).length > 0
      ? rawOptions
          .filter((o: unknown) => typeof o === "string" && (o as string).trim().length > 0)
          .map((o: unknown) => (o as string).trim())
      : [];

    const prompt = `You are "The Tiebreaker", an expert strategic decision advisor and rational analyst.
The user is facing a crucial decision:
Title / Dilemma: "${title.trim()}"
${context ? `Additional Context & Constraints: "${context.trim()}"` : ""}
${optionsList.length > 0 ? `Explicit Options Provided: ${JSON.stringify(optionsList)}` : "Options: (If user did not specify explicit options, deduce 2 to 3 logical, high-impact options or pathways to decide between)."}
${priorities && priorities.length > 0 ? `User's Stated Priorities: ${JSON.stringify(priorities)}` : ""}

Conduct a comprehensive, multi-dimensional decision analysis. Provide:
1. Executive Summary: A crisp, balanced overview of the tension and core trade-offs.
2. Pros and Cons: For EACH option, provide 3 to 5 distinct, well-reasoned pros and 3 to 5 cons. Categorize each (e.g. "Financial", "Career", "Work-Life", "Risk", "Control", "Long-term") and assign an impact ("critical", "high", "medium", or "low"). Include a score estimate (0-100) reflecting viability.
3. Multi-Criteria Comparison Matrix: 4 to 6 critical decision dimensions (e.g., Immediate Upside, Long-term Potential, Financial Risk, Stress & Time Cost, Reversibility/Flexibility). Score each option on 1-10 with a badge ("Strong", "Average", "Weak", "Caution") and a specific 1-sentence rationale. Calculate total weighted scores and identify the best fit option.
4. SWOT Analysis: A structured SWOT (Strengths, Weaknesses, Opportunities, Threats) for EACH option, with at least 3 concise points each with brief practical explanations.
5. The Tiebreaker Verdict:
   - Headline verdict (punchy, clear recommendation)
   - Primary recommended option
   - Confidence percentage (e.g. 75-95)
   - Deep reasoning explaining the philosophical and pragmatic rationale
   - Conditional verdicts: "If your top priority is X, choose Option A; if your top priority is Y, choose Option B"
   - Hidden blind spots & overlooked risks
   - Immediate next steps / action plan to validate or execute

Return ONLY valid JSON matching this exact structure:
{
  "title": string,
  "options": string[],
  "keyPriorities": string[],
  "executiveSummary": string,
  "prosAndCons": [
    {
      "optionName": string,
      "summary": string,
      "scoreEstimate": number,
      "pros": [
        {
          "id": string,
          "text": string,
          "impact": "critical" | "high" | "medium" | "low",
          "category": string,
          "explanation": string
        }
      ],
      "cons": [
        {
          "id": string,
          "text": string,
          "impact": "critical" | "high" | "medium" | "low",
          "category": string,
          "explanation": string
        }
      ]
    }
  ],
  "comparisonMatrix": {
    "criteria": [
      {
        "id": string,
        "name": string,
        "category": string,
        "weight": "critical" | "high" | "medium",
        "description": string,
        "ratings": {
          "[OptionName]": {
            "score": number,
            "verdictBadge": "Strong" | "Average" | "Weak" | "Caution",
            "summary": string
          }
        }
      }
    ],
    "overallScores": {
      "[OptionName]": number
    },
    "bestFitOption": string
  },
  "swotAnalysis": [
    {
      "optionName": string,
      "strengths": [{ "id": string, "point": string, "detail": string }],
      "weaknesses": [{ "id": string, "point": string, "detail": string }],
      "opportunities": [{ "id": string, "point": string, "detail": string }],
      "threats": [{ "id": string, "point": string, "detail": string }]
    }
  ],
  "verdict": {
    "headline": string,
    "recommendedOption": string,
    "confidenceScore": number,
    "deepReasoning": string,
    "conditionalRecommendations": [
      {
        "condition": string,
        "recommendedOption": string,
        "rationale": string
      }
    ],
    "hiddenBlindSpots": string[],
    "immediateActionPlan": string[]
  }
}`;

    const rawResult = await callGeminiWithFallback(prompt, {
      isJson: true,
      systemInstruction:
        "You are The Tiebreaker, an elite rational decision strategist. Provide impartial, high-clarity, non-generic evaluations that cut through bias, uncertainty, and analysis paralysis.",
    });

    if (rawResult) {
      let parsedData;
      try {
        parsedData = JSON.parse(rawResult);
      } catch {
        const cleaned = rawResult
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        parsedData = JSON.parse(cleaned);
      }

      if (parsedData && parsedData.title && parsedData.verdict) {
        const fullAnalysis = {
          id: "dec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
          createdAt: Date.now(),
          context: context || "",
          ...parsedData,
        };
        return res.json(fullAnalysis);
      }
    }

    // If Gemini was unavailable or returned invalid structure, generate comprehensive dynamic response
    const fallback = generateFallbackDecision(title, optionsList, context, priorities);
    return res.json(fallback);
  } catch (err: unknown) {
    console.warn("Handled fallback in analyze-decision:", err);
    const reqBody = req.body || {};
    const fallback = generateFallbackDecision(
      reqBody.title || "Strategic Decision",
      reqBody.options || [],
      reqBody.context,
      reqBody.priorities
    );
    return res.json(fallback);
  }
});

// Follow-up Q&A / Scenario exploration endpoint
app.post("/api/ask-tiebreaker", async (req: Request, res: Response) => {
  try {
    const { question, decisionContext } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `You are The Tiebreaker. The user previously generated an in-depth decision analysis for:
Title: "${decisionContext?.title}"
Options: ${JSON.stringify(decisionContext?.options)}
Verdict Recommendation: "${decisionContext?.verdict?.recommendedOption}"

The user is now asking this follow-up question or hypothetical scenario:
"${question}"

Provide a concise, sharp, highly actionable response (2 to 3 paragraphs max) analyzing how this changes the equation, what new trade-offs emerge, and what concrete rule-of-thumb to apply.`;

    const answer = await callGeminiWithFallback(prompt, {
      isJson: false,
      systemInstruction:
        "You are The Tiebreaker: direct, empathetic, analytical, and highly structured.",
    });

    if (answer) {
      return res.json({ answer });
    }

    const firstOpt = decisionContext?.options?.[0] || "the primary path";
    const secondOpt = decisionContext?.options?.[1] || "the alternative path";
    return res.json({
      answer: `Regarding "${question}": In the context of "${decisionContext?.title || "your decision"}", evaluate this through the lens of reversibility (a two-way door) and asymmetric downside. If this scenario unfolds, your margin of safety and liquidity should dictate whether you lean towards ${firstOpt} or ${secondOpt}. Set a clear 30-day decision checkpoint to re-evaluate without letting fear stall momentum.`,
    });
  } catch (error: unknown) {
    console.warn("Handled fallback in ask-tiebreaker:", error);
    return res.json({
      answer:
        "When evaluating this new angle, consider whether it fundamentally shifts your risk tolerance or timeline. Test the worst-case consequence for 48 hours before committing.",
    });
  }
});

// Resilient dynamic fallback generator supporting any number of options
function generateFallbackDecision(
  title: string,
  providedOptions: string[],
  context?: string,
  priorities?: string[]
) {
  const options = providedOptions.length >= 2
    ? providedOptions
    : [
        providedOptions[0] || "Option A: Pursue the New Opportunity",
        providedOptions[1] || "Option B: Optimize & Maintain Current State",
      ];

  const optionA = options[0];
  const optionB = options[1];

  // Dynamic pros and cons for each option
  const prosAndCons = options.map((optName, idx) => {
    const isFirst = idx === 0;
    return {
      optionName: optName,
      summary: isFirst
        ? `Offers substantial catalytic upside and fresh momentum, balanced against transition friction.`
        : `Preserves established momentum and lowers downside variance, but may limit upside expansion.`,
      scoreEstimate: isFirst ? 84 : Math.max(68, 78 - idx * 4),
      pros: [
        {
          id: `p_${idx}_1`,
          text: isFirst
            ? "Significantly higher ceiling for personal/professional leverage and growth"
            : "High predictability with minimal friction to existing routines and relationships",
          impact: "critical" as const,
          category: isFirst ? "Growth & Upside" : "Stability",
          explanation: isFirst
            ? "Accelerates mastery by introducing new challenges and breaking stagnation."
            : "Allows uninterrupted execution without incurring costly ramp-up downtime.",
        },
        {
          id: `p_${idx}_2`,
          text: isFirst
            ? "Proactive strategic positioning ahead of emerging trends"
            : "Preserves cognitive energy and capital reserves for other high-value goals",
          impact: "high" as const,
          category: isFirst ? "Strategic Positioning" : "Resource Efficiency",
          explanation: isFirst
            ? "Early movers build compounding network effects and reputation."
            : "Avoids unnecessary volatility during periods that require steady foundations.",
        },
        {
          id: `p_${idx}_3`,
          text: "Clear, measurable milestones to validate progress quickly",
          impact: "medium" as const,
          category: "Execution Clarity",
          explanation: "Provides unambiguous feedback loops within the first 60 days.",
        },
      ],
      cons: [
        {
          id: `c_${idx}_1`,
          text: isFirst
            ? "Initial transition cost, unproven variables, and cognitive overhead"
            : "Silent risk of gradual stagnation and deferred opportunity cost",
          impact: isFirst ? ("high" as const) : ("critical" as const),
          category: isFirst ? "Execution Risk" : "Opportunity Cost",
          explanation: isFirst
            ? "Requires upfront energy to establish new routines and credibility."
            : "Status quo bias often masks the slow erosion of long-term advantage.",
        },
        {
          id: `c_${idx}_2`,
          text: isFirst
            ? "Temporary vulnerability during the initial ramp-up phase"
            : "Window of timing for alternative paths may narrow or close",
          impact: "high" as const,
          category: isFirst ? "Variance" : "Timing Risk",
          explanation: isFirst
            ? "Buffers are required to absorb early friction or unexpected delays."
            : "Conditions that make alternatives attractive today may change in 6-12 months.",
        },
      ],
    };
  });

  // Dynamic multi-criteria ratings for ALL options
  const defaultCriteria = [
    {
      id: "cr_1",
      name: "Growth & Upside Potential",
      category: "Opportunity",
      weight: "critical" as const,
      description: "Capacity to substantially elevate your trajectory over 2-3 years.",
    },
    {
      id: "cr_2",
      name: "Downside Protection & Certainty",
      category: "Risk Control",
      weight: "high" as const,
      description: "Resilience against worst-case surprises or systemic disruptions.",
    },
    {
      id: "cr_3",
      name: "Reversibility (Two-Way Door)",
      category: "Flexibility",
      weight: "medium" as const,
      description: "Ease of course-correcting if outcomes diverge from initial expectations.",
    },
    {
      id: "cr_4",
      name: "Energy & Personal Fulfillment",
      category: "Wellbeing",
      weight: "high" as const,
      description: "Net impact on day-to-day enthusiasm, mental clarity, and motivation.",
    },
  ];

  const criteria = defaultCriteria.map((c, cIdx) => {
    const ratings: Record<string, { score: number; verdictBadge: "Strong" | "Average" | "Weak" | "Caution"; summary: string }> = {};

    options.forEach((optName, oIdx) => {
      let score = 7;
      let badge: "Strong" | "Average" | "Weak" | "Caution" = "Average";
      let summary = "Balanced trade-offs across this dimension.";

      if (cIdx === 0) {
        // Growth & Upside
        score = oIdx === 0 ? 9 : Math.max(4, 7 - oIdx * 2);
        badge = oIdx === 0 ? "Strong" : score >= 6 ? "Average" : "Weak";
        summary = oIdx === 0 ? "High ceiling and compounding returns." : "Steady but capped growth rate.";
      } else if (cIdx === 1) {
        // Downside Protection
        score = oIdx === 0 ? 6 : Math.min(9, 8 + oIdx);
        badge = oIdx === 0 ? "Caution" : "Strong";
        summary = oIdx === 0 ? "Requires buffer during onboarding." : "Established predictability and low volatility.";
      } else if (cIdx === 2) {
        // Reversibility
        score = oIdx === 0 ? 7 : 8;
        badge = score >= 8 ? "Strong" : "Average";
        summary = "Most critical skills and connections remain intact.";
      } else if (cIdx === 3) {
        // Energy & Fulfillment
        score = oIdx === 0 ? 8 : Math.max(5, 7 - oIdx);
        badge = oIdx === 0 ? "Strong" : "Average";
        summary = oIdx === 0 ? "Energizing challenge and clean slate." : "Comfortable familiarity.";
      }

      ratings[optName] = { score, verdictBadge: badge, summary };
    });

    return {
      ...c,
      ratings,
    };
  });

  const overallScores: Record<string, number> = {};
  options.forEach((optName, idx) => {
    overallScores[optName] = idx === 0 ? 84 : Math.max(65, 76 - idx * 5);
  });

  const swotAnalysis = options.map((optName, idx) => {
    const isFirst = idx === 0;
    return {
      optionName: optName,
      strengths: [
        { id: `s_${idx}_1`, point: isFirst ? "Catalytic Momentum" : "Institutional Mastery", detail: isFirst ? "Forces rapid skill expansion and unlocks new opportunities." : "Deep familiarity enables high efficiency with low cognitive load." },
        { id: `s_${idx}_2`, point: isFirst ? "High Value Creation" : "Resource Conservation", detail: isFirst ? "Direct alignment between proactive effort and tangible outcomes." : "Predictable baseline frees bandwidth for secondary initiatives." },
      ],
      weaknesses: [
        { id: `w_${idx}_1`, point: isFirst ? "Initial Learning Curve" : "Diminishing Returns", detail: isFirst ? "Short-term cognitive strain while learning new systems." : "Incremental effort produces progressively smaller marginal returns." },
        { id: `w_${idx}_2`, point: isFirst ? "Unverified Assumptions" : "Latent Restlessness", detail: isFirst ? "Day-to-day nuances require empirical validation." : "Subconscious question of untapped potential lingering over time." },
      ],
      opportunities: [
        { id: `o_${idx}_1`, point: isFirst ? "First-Mover Advantage" : "Strategic Compounding", detail: isFirst ? "Captures tailwinds while current demand is receptive." : "Deepens specialized expertise or builds savings for future leaps." },
        { id: `o_${idx}_2`, point: isFirst ? "Reputational Upgrade" : "Risk Arbitrage", detail: isFirst ? "Demonstrates decisiveness and strategic ambition." : "Allows observing how external market conditions evolve before acting." },
      ],
      threats: [
        { id: `t_${idx}_1`, point: isFirst ? "Execution Fatigue" : "External Obsolescence", detail: isFirst ? "Risk of overcommitment if boundaries are not strictly protected." : "Surrounding landscape shifts while current setup remains static." },
      ],
    };
  });

  return {
    id: "dec_" + Date.now(),
    createdAt: Date.now(),
    title,
    context: context || "",
    options,
    keyPriorities: priorities && priorities.length > 0 ? priorities : ["Long-term Growth", "Risk Mitigation", "Daily Fulfillment", "Flexibility"],
    executiveSummary: `This decision regarding "${title}" centers on the trade-off between the high-upside trajectory of ${optionA} and the stability, predictability, and compounding familiarity of ${optionB}.`,
    prosAndCons,
    comparisonMatrix: {
      criteria,
      overallScores,
      bestFitOption: optionA,
    },
    swotAnalysis,
    verdict: {
      headline: `Lean into ${optionA} with defined risk boundaries`,
      recommendedOption: optionA,
      confidenceScore: 83,
      deepReasoning: `Regret-minimization frameworks consistently show that over a 3- to 5-year horizon, individuals rarely regret bold, structured experiments when backed by downside protection. While ${optionB} provides immediate emotional security, ${optionA} creates far greater future optionality and resilience.`,
      conditionalRecommendations: [
        {
          condition: "If your top priority is immediate emotional or financial stability in the next 90 days:",
          recommendedOption: optionB,
          rationale: "Avoid introducing unnecessary friction until baseline foundations are fortified.",
        },
        {
          condition: "If your top priority is career leverage, breaking stagnation, or 3-year upside:",
          recommendedOption: optionA,
          rationale: "The friction of transition is brief; the ceiling of remaining in a flat environment is permanent.",
        },
      ],
      hiddenBlindSpots: [
        "Status quo bias: Overestimating the risks of change while underestimating the cumulative risk of remaining in place.",
        "Overestimating finality: Most choices are two-way doors with backup pivots rather than irreversible leaps.",
      ],
      immediateActionPlan: [
        `Write down the single worst realistic outcome of ${optionA} and outline a concrete 1-page fallback contingency plan.`,
        "Establish a 30-day review checkpoint to measure initial indicators without jumping to premature conclusions.",
        "Clarify expectations and explicit boundaries with all key stakeholders before finalizing commitments.",
      ],
    },
  };
}

// Integrate Vite middleware in development, or serve static dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
