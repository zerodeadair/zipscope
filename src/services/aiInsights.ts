import type { OddsQuote } from "../providers/oddsProvider";
import type { SportsEvent } from "../providers/sportsEventsProvider";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatOptionalCurrency, localMarketScore } from "../utils/formatters";
import { impliedProbability } from "../utils/impliedProbability";

export type AiSourceTrace = {
  demographics: string;
  sports: string;
  odds: string;
};

export type AiInsightModel = {
  summary: string;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Directional";
  riskSignals: string[];
  opportunitySignals: string[];
  anomalyRadar: Array<{ label: string; value: string; detail: string; tone: "alert" | "watch" | "stable" }>;
  actionQueue: Array<{ label: string; detail: string }>;
  confidenceFactors: Array<{ label: string; score: number }>;
  strategicQuestions: string[];
  forecast: Array<{ label: string; value: string; tone: "up" | "steady" | "watch" }>;
  executiveBrief: string[];
  comparisonPeers: ComparisonPeer[];
  sourceCategories: string[];
};

export type ComparisonPeer = {
  label: string;
  population: number;
  income: number;
  marketScore: number;
  sportsIndex: number;
};

const comparisonPeers: ComparisonPeer[] = [
  { label: "Regional growth ZIP", population: 44200, income: 78200, marketScore: 74, sportsIndex: 67 },
  { label: "Large metro benchmark", population: 82100, income: 91800, marketScore: 86, sportsIndex: 73 },
  { label: "Emerging college market", population: 36700, income: 61200, marketScore: 66, sportsIndex: 81 },
  { label: "Civic services peer", population: 54500, income: 70400, marketScore: 69, sportsIndex: 58 },
];

export function buildAiInsightModel(
  profile: DemographicProfile,
  events: SportsEvent[],
  odds: OddsQuote[],
  sourceTrace: AiSourceTrace,
): AiInsightModel {
  const marketScore = localMarketScore(profile);
  const moneylineOdds = odds.filter((quote) => quote.market === "moneyline" && quote.homeOdds);
  const averageHomeProbability = moneylineOdds.length
    ? moneylineOdds.reduce((sum, quote) => sum + impliedProbability(quote.homeOdds ?? 0), 0) / moneylineOdds.length
    : 0;
  const income = profile.medianHouseholdIncome ?? 0;
  const education = profile.bachelorsOrHigherRate ?? 0;
  const housing = profile.housingUnits ?? 0;
  const poverty = profile.povertyRate ?? 0;
  const vacancy = profile.vacancyRate ?? 0;
  const commute = profile.averageCommuteMinutes ?? 0;
  const homeValue = profile.medianHomeValue ?? 0;
  const homeIncomeRatio = income && homeValue ? homeValue / income : 0;
  const confidence = calculateConfidence(profile, events, odds);
  const affordabilityTone = homeIncomeRatio > 5 ? "alert" : homeIncomeRatio > 3.5 ? "watch" : "stable";
  const mobilityTone = commute > 32 ? "alert" : commute > 24 ? "watch" : "stable";
  const civicTone = poverty > 0.18 || vacancy > 0.12 ? "alert" : poverty > 0.12 || vacancy > 0.08 ? "watch" : "stable";

  return {
    summary: `${profile.displayName} is reading as a ${marketScore >= 72 ? "high-signal" : marketScore >= 52 ? "balanced" : "developing"} market with ${formatNumber(profile.population)} residents, ${formatOptionalCurrency(profile.medianHouseholdIncome)} median household income, and ${events.length} visible sports events in the current slate.`,
    confidence,
    confidenceLabel: confidence >= 82 ? "High" : confidence >= 66 ? "Medium" : "Directional",
    riskSignals: [
      profile.povertyRate !== null && profile.povertyRate > 0.18
        ? `Elevated poverty signal at ${(profile.povertyRate * 100).toFixed(1)}%; civic or affordability context should be reviewed before action.`
        : "No elevated demographic risk threshold triggered by the current sourced profile.",
      odds.length
        ? `${odds.length} odds quotes are demo-normalized; treat market movement as a UI simulation until a live odds provider is connected.`
        : "Sports odds coverage is thin for the current filters, reducing comparison strength.",
      profile.place ? "ZIP-to-ZCTA geography is resolved, but USPS ZIP areas and Census ZCTAs are not exact boundaries." : "Place metadata is incomplete, so geographic comparisons should stay conservative.",
    ],
    opportunitySignals: [
      income >= 85000
        ? `Premium household income signal: ${formatCurrency(income)} median income supports high-value segmentation.`
        : `Income signal is serviceable at ${formatOptionalCurrency(profile.medianHouseholdIncome)}; compare against nearby peers before prioritizing premium offers.`,
      education >= 0.34
        ? `Education signal is strong with ${(education * 100).toFixed(0)}% bachelor's+ attainment.`
        : "Education profile suggests mass-market or broad civic messaging may outperform niche expert positioning.",
      housing >= 18000
        ? `${formatNumber(housing)} housing units create a meaningful local coverage base for planning, outreach, or venue analysis.`
        : "Housing base is smaller, so regional aggregation may produce more stable insights.",
    ],
    anomalyRadar: [
      {
        label: "Affordability delta",
        value: homeIncomeRatio ? `${homeIncomeRatio.toFixed(1)}x` : "Pending",
        detail: homeIncomeRatio ? "Median home value divided by median household income." : "Home value or income is unavailable.",
        tone: affordabilityTone,
      },
      {
        label: "Civic stress blend",
        value: profile.povertyRate === null ? "Pending" : `${(poverty * 100).toFixed(1)}%`,
        detail: "Poverty and vacancy are blended as a planning-pressure marker.",
        tone: civicTone,
      },
      {
        label: "Mobility pressure",
        value: profile.averageCommuteMinutes === null ? "Pending" : `${commute.toFixed(1)}m`,
        detail: "Average commute helps expose regional access friction.",
        tone: mobilityTone,
      },
      {
        label: "Sports adapter density",
        value: `${events.length}/${odds.length}`,
        detail: "Visible event count compared with normalized odds quotes.",
        tone: events.length && odds.length ? "stable" : "watch",
      },
    ],
    actionQueue: [
      { label: "Compare peer ZIPs", detail: "Run this profile against a nearby income-peer and population-peer before prioritizing decisions." },
      { label: "Inspect affordability", detail: "Review home value, income, poverty, owner occupancy, and rent fields together." },
      { label: "Separate sports from demographics", detail: "Use sports signals for context only; do not let odds data alter Census facts." },
      { label: "Verify geography", detail: `Treat ZIP ${profile.zip} as ZCTA ${profile.zcta}; ZIP routes and ZCTAs are approximate.` },
    ],
    confidenceFactors: [
      { label: "Census demographics", score: profile.population > 0 ? 96 : 30 },
      { label: "Place resolution", score: profile.place ? 92 : 44 },
      { label: "Economic fields", score: profile.medianHouseholdIncome !== null && profile.povertyRate !== null ? 88 : 52 },
      { label: "Housing fields", score: profile.housingUnits !== null && profile.medianHomeValue !== null ? 84 : 48 },
      { label: "Sports adapters", score: Math.min(90, 46 + events.length * 7 + odds.length * 3) },
    ],
    strategicQuestions: [
      `How does ${profile.displayName} compare with ZIPs that have similar population but stronger income?`,
      `Is the ${homeIncomeRatio ? `${homeIncomeRatio.toFixed(1)}x` : "pending"} affordability ratio improving or worsening across future ACS releases?`,
      `Which sports/event categories best match the median age and income profile here?`,
      `What civic services would be most sensitive to poverty, commute, and vacancy pressure in this ZCTA?`,
    ],
    forecast: [
      {
        label: "Market Attention",
        value: marketScore >= 70 ? "+12%" : "+5%",
        tone: marketScore >= 70 ? "up" : "steady",
      },
      {
        label: "Data Reliability",
        value: `${confidence}%`,
        tone: confidence >= 82 ? "up" : "watch",
      },
      {
        label: "Sports Pulse",
        value: averageHomeProbability ? `${(averageHomeProbability * 100).toFixed(0)}%` : "Pending",
        tone: averageHomeProbability > 0.56 ? "up" : "steady",
      },
    ],
    executiveBrief: [
      `${profile.displayName} currently scores ${marketScore}/100 on the local market signal model.`,
      `Primary public-data anchors are Census ACS/ZCTA demographics, place lookup metadata, sports event adapters, and normalized public odds fields.`,
      "Forecast outputs are demo estimates intended to show product behavior; they are not guarantees, recommendations, or betting advice.",
    ],
    comparisonPeers,
    sourceCategories: [
      sourceTrace.demographics,
      sourceTrace.sports,
      sourceTrace.odds,
      "ZIP/ZCTA place resolution",
      "Derived local market scoring",
      "Beta anomaly radar",
      "Client-side strategic prompts",
    ],
  };
}

function calculateConfidence(profile: DemographicProfile, events: SportsEvent[], odds: OddsQuote[]) {
  let score = 54;
  if (profile.population > 0) score += 10;
  if (profile.medianHouseholdIncome !== null) score += 8;
  if (profile.medianAge !== null) score += 6;
  if (profile.place) score += 6;
  if (profile.raceEthnicity.some((group) => group.value > 0)) score += 5;
  if (events.length > 0) score += 5;
  if (odds.length > 0) score += 4;
  return Math.min(96, score);
}
