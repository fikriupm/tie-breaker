import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

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

    const optionsList = Array.isArray(rawOptions) && rawOptions.filter(Boolean).length > 0
      ? rawOptions.filter((o: unknown) => typeof o === "string" && (o as string).trim().length > 0)
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
            "score": number, // 1 to 10
            "verdictBadge": "Strong" | "Average" | "Weak" | "Caution",
            "summary": string
          }
        }
      }
    ],
    "overallScores": {
      "[OptionName]": number // sum or weighted average out of 100
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

    if (!ai) {
      // If API key is missing, provide a rich synthesized template
      return res.status(200).json(generateFallbackDecision(title, optionsList, context, priorities));
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are The Tiebreaker, an elite rational decision strategist. Provide impartial, high-clarity, non-generic evaluations that cut through bias, uncertainty, and analysis paralysis.",
      },
    });

    const rawText = response.text?.trim() || "";
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Try stripping markdown blocks if any
      const cleaned = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    // Attach id and timestamp
    const fullAnalysis = {
      id: "dec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      context: context || "",
      ...parsedData,
    };

    res.json(fullAnalysis);
  } catch (err: unknown) {
    console.error("Error analyzing decision:", err);
    // Return a thoughtful fallback if API fails
    const reqBody = req.body || {};
    const fallback = generateFallbackDecision(
      reqBody.title || "Decision",
      reqBody.options || [],
      reqBody.context,
      reqBody.priorities
    );
    res.json(fallback);
  }
});

// Follow-up Q&A / Scenario exploration endpoint
app.post("/api/ask-tiebreaker", async (req: Request, res: Response) => {
  try {
    const { question, decisionContext } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!ai) {
      return res.json({
        answer: `Regarding "${question}": In the context of "${decisionContext?.title || "your decision"}", evaluate this through the lens of reversibility (two-way door decision) and asymmetric downside. If this scenario unfolds, your safety buffer and flexibility should dictate whether you lean towards ${decisionContext?.options?.[0] || "the first path"} or ${decisionContext?.options?.[1] || "the alternative"}.`,
      });
    }

    const prompt = `You are The Tiebreaker. The user previously generated an in-depth decision analysis for:
Title: "${decisionContext?.title}"
Options: ${JSON.stringify(decisionContext?.options)}
Verdict Recommendation: "${decisionContext?.verdict?.recommendedOption}"

The user is now asking this follow-up question or hypothetical scenario:
"${question}"

Provide a concise, sharp, highly actionable response (2 to 3 paragraphs max) analyzing how this changes the equation, what new trade-offs emerge, and what concrete rule-of-thumb to apply.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are The Tiebreaker: direct, empathetic, analytical, and highly structured.",
      },
    });

    res.json({ answer: response.text || "Could not generate an answer at this time." });
  } catch (error: unknown) {
    console.error("Error in ask-tiebreaker:", error);
    res.json({
      answer: "When evaluating this new angle, consider whether it fundamentally shifts your risk tolerance or timeline. Test the worst-case consequence for 48 hours before committing.",
    });
  }
});

// Fallback generator when API key is unconfigured or rate limited
function generateFallbackDecision(
  title: string,
  providedOptions: string[],
  context?: string,
  priorities?: string[]
) {
  const options = providedOptions.length >= 2
    ? providedOptions
    : ["Option A: Pursue the New Opportunity", "Option B: Optimize & Maintain Current State"];

  const optionA = options[0];
  const optionB = options[1];

  return {
    id: "dec_" + Date.now(),
    createdAt: Date.now(),
    title,
    context: context || "",
    options,
    keyPriorities: priorities && priorities.length > 0 ? priorities : ["Long-term Growth", "Risk Mitigation", "Daily Fulfillment", "Financial Upside"],
    executiveSummary: `This decision regarding "${title}" pivots on the core trade-off between the high-upside potential of ${optionA} versus the stability, predictability, and compounding familiarity of ${optionB}.`,
    prosAndCons: [
      {
        optionName: optionA,
        summary: `Offers substantial catalytic upside and fresh momentum, balanced against transition friction.`,
        scoreEstimate: 82,
        pros: [
          {
            id: "p1_1",
            text: "Higher ceiling for learning, growth, and long-term leverage",
            impact: "critical",
            category: "Growth & Upside",
            explanation: "Accelerates exposure to new domains and prevents stagnation.",
          },
          {
            id: "p1_2",
            text: "Strong alignment with proactive future positioning",
            impact: "high",
            category: "Strategic Direction",
            explanation: "Positions you ahead of changing market and personal dynamics.",
          },
          {
            id: "p1_3",
            text: "Psychological boost from breaking out of current comfort zone",
            impact: "medium",
            category: "Motivation",
            explanation: "Energizes focus and clears accumulated mental inertia.",
          },
        ],
        cons: [
          {
            id: "c1_1",
            text: "Initial ramp-up stress and unproven variables",
            impact: "high",
            category: "Execution Risk",
            explanation: "Requires upfront energy to establish new routines and credibility.",
          },
          {
            id: "c1_2",
            text: "Opportunity cost of walking away from accrued trust or equity",
            impact: "medium",
            category: "Opportunity Cost",
            explanation: "Sacrifices the leverage of your existing baseline.",
          },
        ],
      },
      {
        optionName: optionB,
        summary: `Preserves stability and predictable execution while leaving potential upside uncaptured.`,
        scoreEstimate: 74,
        pros: [
          {
            id: "p2_1",
            text: "Zero disruption to existing operational rhythm and relationships",
            impact: "high",
            category: "Stability",
            explanation: "Allows uninterrupted compounding of current competencies.",
          },
          {
            id: "p2_2",
            text: "Low downside risk and predictable time/resource commitments",
            impact: "high",
            category: "Risk Control",
            explanation: "Provides emotional and financial breathing room.",
          },
        ],
        cons: [
          {
            id: "c2_1",
            text: "Risk of slow stagnation and deferred regret",
            impact: "critical",
            category: "Long-term Trap",
            explanation: "Status quo bias often masks the slow erosion of competitive advantage.",
          },
          {
            id: "c2_2",
            text: "Missed window of timing that may not reappear easily",
            impact: "high",
            category: "Timing",
            explanation: "Circumstances might make future transitions substantially more difficult.",
          },
        ],
      },
    ],
    comparisonMatrix: {
      criteria: [
        {
          id: "cr_1",
          name: "Growth & Upside Potential",
          category: "Opportunity",
          weight: "critical",
          description: "Capacity to substantially elevate your trajectory over 2-3 years.",
          ratings: {
            [optionA]: { score: 9, verdictBadge: "Strong", summary: "Significantly expands ceiling and opens unforeseen doors." },
            [optionB]: { score: 5, verdictBadge: "Average", summary: "Predictable, incremental trajectory." },
          },
        },
        {
          id: "cr_2",
          name: "Downside Protection & Certainty",
          category: "Risk",
          weight: "high",
          description: "Resilience against worst-case surprises or systemic disruptions.",
          ratings: {
            [optionA]: { score: 6, verdictBadge: "Caution", summary: "Carries transitional vulnerability in the first 6 months." },
            [optionB]: { score: 9, verdictBadge: "Strong", summary: "Established safeguards and verified predictability." },
          },
        },
        {
          id: "cr_3",
          name: "Reversibility (Two-Way Door)",
          category: "Flexibility",
          weight: "medium",
          description: "Ease of course-correcting if outcomes diverge from expectations.",
          ratings: {
            [optionA]: { score: 7, verdictBadge: "Average", summary: "Partially reversible; key relationships and skills remain." },
            [optionB]: { score: 8, verdictBadge: "Strong", summary: "Maintains immediate optionality for the future." },
          },
        },
        {
          id: "cr_4",
          name: "Energy & Personal Fulfillment",
          category: "Wellbeing",
          weight: "high",
          description: "Net impact on enthusiasm, mental clarity, and daily drive.",
          ratings: {
            [optionA]: { score: 8, verdictBadge: "Strong", summary: "High novelty and creative challenge." },
            [optionB]: { score: 6, verdictBadge: "Average", summary: "Comfortable but prone to routine exhaustion." },
          },
        },
      ],
      overallScores: {
        [optionA]: 84,
        [optionB]: 73,
      },
      bestFitOption: optionA,
    },
    swotAnalysis: [
      {
        optionName: optionA,
        strengths: [
          { id: "s1", point: "Catalytic Momentum", detail: "Forces rapid skill acquisition and expands your network." },
          { id: "s2", point: "Higher Value Creation", detail: "Direct connection between effort and tangible results." },
        ],
        weaknesses: [
          { id: "w1", point: "Steep Initial Learning Curve", detail: "Short-term cognitive strain while learning new systems." },
          { id: "w2", point: "Uncertain Nuances", detail: "Unforeseen day-to-day friction points." },
        ],
        opportunities: [
          { id: "o1", point: "Market Timing Advantage", detail: "Captures a rising tide while demand or interest is elevated." },
          { id: "o2", point: "Brand & Reputation Upgrade", detail: "Signals boldness and dynamic capability." },
        ],
        threats: [
          { id: "t1", point: "Execution Fatigue", detail: "Burnout risk if boundaries are not strictly established upfront." },
        ],
      },
      {
        optionName: optionB,
        strengths: [
          { id: "s3", point: "Institutional Mastery", detail: "Deep familiarity allows high efficiency with low cognitive load." },
          { id: "s4", point: "Capital & Mental Conservation", detail: "Stable baseline frees energy for side interests." },
        ],
        weaknesses: [
          { id: "w3", point: "Diminishing Returns", detail: "Incremental effort yields increasingly modest rewards." },
          { id: "w4", point: "Hidden Restlessness", detail: "Subconscious lingering question of 'what if'." },
        ],
        opportunities: [
          { id: "o3", point: "Strategic Patience", detail: "Build savings or refine skills before a more tailor-made opportunity arrives." },
        ],
        threats: [
          { id: "t2", point: "External Obsolescence", detail: "Surrounding environment changes while you remain static." },
        ],
      },
    ],
    verdict: {
      headline: `Lean into ${optionA} with defined risk boundaries`,
      recommendedOption: optionA,
      confidenceScore: 82,
      deepReasoning: `When evaluating life and strategic decisions, regret analysis almost always favors action over omission in asymmetric upside situations. While ${optionB} feels comfortable right now, the long-term compounding of ${optionA} will build far more resilience and future optionality.`,
      conditionalRecommendations: [
        {
          condition: "If your #1 priority is immediate financial or emotional stability in the next 90 days:",
          recommendedOption: optionB,
          rationale: "Avoid introducing voluntary volatility until your support foundations are secure.",
        },
        {
          condition: "If your #1 goal is 3-year trajectory expansion and breaking stagnation:",
          recommendedOption: optionA,
          rationale: "The friction of starting is temporary; the ceiling of remaining is fixed.",
        },
      ],
      hiddenBlindSpots: [
        "Status quo bias: We routinely overestimate the risks of taking action while ignoring the silent risk of staying put.",
        "Overestimating initial permanence: Most choices are two-way doors with backup pivots rather than irreversible leaps.",
      ],
      immediateActionPlan: [
        `Write down the single worst realistic outcome of ${optionA} and formulate a 1-page contingency response.`,
        "Set a firm 30-day checkpoint to review early signals without prematurely judging success.",
        "Communicate your boundaries clearly with stakeholders before committing.",
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
