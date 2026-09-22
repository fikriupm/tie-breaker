# The Tiebreaker

> **A strategic, rational decision-making assistant** that cuts through analysis paralysis with structured evaluation frameworks: weighted pros and cons, multi-criteria comparison tables, 2×2 SWOT matrices, and clear, decisive verdicts.

---

## Overview

When faced with high-stakes personal, career, or business choices, intuition is often clouded by status-quo bias, emotional attachment, and overwhelming variables. 

**The Tiebreaker** transforms messy dilemmas into structured, objective clarity by evaluating competing pathways across proven strategic frameworks:
- **Pros & Cons List**: Categorized by impact level (*Critical*, *High*, *Medium*, *Minor*) with visual balance ratios and the ability to append your own custom considerations.
- **Multi-Criteria Comparison Matrix**: Grades each option on a 1–10 scale across dimensions like *Growth Potential*, *Downside Protection*, *Reversibility (Two-Way Door)*, and *Personal Fulfillment*, generating a quantitative leaderboard.
- **2×2 SWOT Matrix**: Unpacks internal strengths, internal vulnerabilities (weaknesses), external opportunities, and external threats for every option.
- **The Tiebreaker Verdict**: Delivers an unequivocal primary recommendation, a confidence score, conditional "if-then" rules, overlooked blind spots, and a 3-step immediate action plan.
- **Scenario Stress-Testing**: An interactive exploration console to test "what-if" edge cases (e.g., changes in budget, runway, or priorities).
- **Decision Archive**: Auto-saves evaluations locally so you can review previous conclusions or export comprehensive Markdown summaries.

---

## How to Use

### 1. Frame Your Dilemma
1. **Decision Title**: State the dilemma directly (e.g., *"Accept VP of Engineering at Series A Startup vs. Stay Principal Engineer at Tech Giant"*).
2. **Preset Examples**: Alternatively, click any of the preset cards (e.g., *Startup vs. Corporate*, *Buy vs. Rent*, *Bootstrapping vs. VC Funding*) to see an instant demonstration.

### 2. Specify Your Competing Options
- Add the distinct choices you are weighing (e.g., *Option A: Join Startup*, *Option B: Stay at Big Tech*).
- You can compare 2, 3, or more options simultaneously.

### 3. Add Context & Constraints *(Optional but Recommended)*
- Provide details that matter to your reality: financial runway, family commitments, relocation limits, risk tolerance, or timing windows.

### 4. Tag Core Priorities
- Select or type key evaluation priorities (e.g., *3-Year Growth Ceiling*, *Downside Protection*, *Daily Autonomy*, *Work-Life Balance*). The analysis weights these factors heavily when scoring trade-offs.

### 5. Run the Analysis
- Click **"Analyze Decision & Break Tie"**.
- The Tiebreaker evaluates your scenario and compiles a complete multi-perspective dossier.

---

## Exploring Your Analysis

The evaluation is organized into focused tabs:

### 📋 Executive Brief (`All-in-One`)
A unified view containing the headline verdict, summary cards, and quick links into every framework.

### ⚖️ Weighted Pros & Cons
- **Scored Viability**: Each option receives an estimated viability score (0–100) and an overall pros-to-cons balance bar.
- **Impact Filtering**: Filter points by impact tier (*Critical*, *High*, *Medium*, *Minor*).
- **Add Custom Considerations**: Click **"+ Add Factor"** to insert your own personal pros or cons into any option.

### 📊 Comparison Matrix
- **Quantitative Leaderboard**: Highlights the mathematically optimal fit based on weighted dimensional scoring.
- **Side-by-Side Dimension Table**: Evaluates options across Growth Upside, Downside Risk, Reversibility, and Stress Cost.
- **Dimension Filtering**: Filter to view only *Critical* or *High-Priority* dimensions.

### 🎯 SWOT Analysis
- A structured 2×2 breakdown for each choice:
  - **Strengths**: Tangible assets and compounding advantages.
  - **Weaknesses**: Friction points and transition vulnerabilities.
  - **Opportunities**: Strategic tailwinds and market timing leverage.
  - **Threats**: External risks, execution fatigue, and obsolescence traps.

### 🏆 The Tiebreaker Verdict
- **Primary Recommendation**: A clear pick with supporting philosophical and pragmatic reasoning.
- **Confidence Rating**: Indicates the clarity of the trade-off margin (e.g., 85%).
- **Conditional Recommendations**: Tailored "if-then" rules (e.g., *"If your top priority is stability for the next 90 days, pick Option B; if your top priority is 3-year leverage, pick Option A"*).
- **Hidden Blind Spots**: Highlights subtle psychological traps like status-quo bias or loss aversion.
- **Immediate Action Plan**: Three concrete, low-risk steps to validate or execute the choice today.

---

## Additional Features

- **Scenario Stress-Testing**: Scroll to the bottom of any tab or use the input box to ask "what-if" questions (e.g., *"What if my budget is 25% tighter?"* or *"What if I can negotiate remote work?"*).
- **Exporting Reports**: Click **"Copy Report"** or **"Download .md"** in the verdict header to save a formatted decision memo.
- **Saved History**: Click the **Saved Decisions** button in the top navigation to revisit, compare, or delete prior decision analyses. All analyses are preserved in your browser's local storage.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express, Vite middleware
- **AI Intelligence**: `@google/genai` with a resilient multi-model fallback cascade (`gemini-3.1-flash-lite`, `gemini-flash-latest`, `gemini-3.8-flash`) and exponential backoff retry handling.
