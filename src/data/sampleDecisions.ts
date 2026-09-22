import { DecisionAnalysis } from "../types";

export interface SampleDecisionTemplate {
  title: string;
  options: string[];
  context: string;
  priorities: string[];
  category: string;
}

export const SAMPLE_TEMPLATES: SampleDecisionTemplate[] = [
  {
    title: "Accept early-stage startup Head of Product offer vs. Stay Senior PM at public tech firm",
    options: ["Join Series A Startup as Head of Product", "Remain Senior PM at BigTech"],
    context: "Offered 1.2% equity with a 15% cash pay cut. Have 18 months of personal savings, married with no kids yet. Feeling comfortable but unchallenged in current role.",
    priorities: ["High Career Upside & Learning", "Autonomy & Ownership", "Financial Risk Mitigation", "Work-Life Energy"],
    category: "Career",
  },
  {
    title: "Buy a fully electric vehicle (EV) vs. Plug-in Hybrid (PHEV) for family daily use",
    options: ["All-Electric Vehicle (Tesla Model Y / Ioniq 5)", "Plug-in Hybrid (RAV4 Prime / Outlander PHEV)"],
    context: "Commute 35 miles daily, take 3-4 regional road trips per year (400+ miles). Have a garage with 240V charging capability at home.",
    priorities: ["Total Cost of Ownership", "Road Trip Convenience", "Environmental Impact", "Resale Value & Tech Longevity"],
    category: "Finance & Lifestyle",
  },
  {
    title: "Bootstrap the SaaS product with client revenue vs. Raise a $750k Pre-Seed angel round",
    options: ["Bootstrap & Self-Fund via Agency Work", "Raise $750k Pre-Seed from Angels"],
    context: "B2B SaaS with $3.5k MRR, growing 15% MoM. 2 co-founders. Competitors are beginning to emerge in the enterprise tier.",
    priorities: ["Founder Equity & Control", "Speed to Market", "Mental Freedom & Sustainability", "Valuation Ceiling"],
    category: "Business",
  },
  {
    title: "Renew apartment lease in downtown vs. Move to quiet suburban home with a yard",
    options: ["Renew Downtown 2-Bed Apartment", "Rent Single-Family Home in Suburbs"],
    context: "Both work hybrid (2 days/week in office). Commute would increase from 15 min walk to 45 min train ride. Crave more space, garden, and dog-friendly neighborhood.",
    priorities: ["Daily Commute Friction", "Living Space & Mental Wellbeing", "Monthly Rent & Utilities", "Social & Walking Lifestyle"],
    category: "Life & Relocation",
  },
];
