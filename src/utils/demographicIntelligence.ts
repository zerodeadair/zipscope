import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatOptionalCurrency, formatOptionalPercent, formatPercent } from "./formatters";

export type SimilarArea = {
  zip: string;
  city: string;
  stateCode: string;
  matchScore: number;
  why: string;
  similarities: string[];
  difference: string;
};

export type PremiumSignal = {
  label: string;
  value: string;
  detail: string;
  score: number;
  tone: "cool" | "warm" | "hot";
};

type CandidateArea = {
  zip: string;
  city: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  incomeBand: number;
  populationBand: number;
  ageBand: number;
  homeValueBand: number;
  educationBand: number;
  density: "urban" | "suburban" | "rural";
  note: string;
};

const candidateAreas: CandidateArea[] = [
  { zip: "27560", city: "Morrisville", stateCode: "NC", latitude: 35.8235, longitude: -78.8256, incomeBand: 126000, populationBand: 33000, ageBand: 36, homeValueBand: 520000, educationBand: 0.66, density: "suburban", note: "airport-adjacent suburban office and housing mix" },
  { zip: "27519", city: "Cary", stateCode: "NC", latitude: 35.7894, longitude: -78.8586, incomeBand: 142000, populationBand: 54000, ageBand: 38, homeValueBand: 610000, educationBand: 0.70, density: "suburban", note: "high-education suburban household profile" },
  { zip: "27703", city: "Durham", stateCode: "NC", latitude: 35.9684, longitude: -78.8246, incomeBand: 91000, populationBand: 61000, ageBand: 36, homeValueBand: 420000, educationBand: 0.48, density: "suburban", note: "regional growth corridor with mixed income bands" },
  { zip: "27106", city: "Winston-Salem", stateCode: "NC", latitude: 36.1466, longitude: -80.3104, incomeBand: 71000, populationBand: 48000, ageBand: 41, homeValueBand: 285000, educationBand: 0.39, density: "suburban", note: "established Piedmont residential market" },
  { zip: "28621", city: "Elkin", stateCode: "NC", latitude: 36.2443, longitude: -80.8484, incomeBand: 56000, populationBand: 9500, ageBand: 44, homeValueBand: 205000, educationBand: 0.23, density: "rural", note: "smaller foothills community with regional service access" },
  { zip: "28659", city: "North Wilkesboro", stateCode: "NC", latitude: 36.1585, longitude: -81.1476, incomeBand: 52000, populationBand: 20500, ageBand: 43, homeValueBand: 190000, educationBand: 0.22, density: "rural", note: "foothills county-seat style market" },
  { zip: "24333", city: "Galax", stateCode: "VA", latitude: 36.6612, longitude: -80.9239, incomeBand: 50000, populationBand: 17500, ageBand: 45, homeValueBand: 175000, educationBand: 0.20, density: "rural", note: "Appalachian edge community with similar access constraints" },
  { zip: "27284", city: "Kernersville", stateCode: "NC", latitude: 36.1199, longitude: -80.0736, incomeBand: 76000, populationBand: 57000, ageBand: 40, homeValueBand: 295000, educationBand: 0.34, density: "suburban", note: "Triad commuting and housing blend" },
  { zip: "28277", city: "Charlotte", stateCode: "NC", latitude: 35.0521, longitude: -80.8195, incomeBand: 133000, populationBand: 78000, ageBand: 39, homeValueBand: 565000, educationBand: 0.63, density: "suburban", note: "large suburban professional household base" },
  { zip: "30328", city: "Sandy Springs", stateCode: "GA", latitude: 33.9362, longitude: -84.3774, incomeBand: 116000, populationBand: 34000, ageBand: 38, homeValueBand: 520000, educationBand: 0.64, density: "suburban", note: "metro suburban income and education profile" },
];

export function buildSimilarAreas(profile: DemographicProfile): SimilarArea[] {
  const source = profile.place;
  const sourceDensity = classifyDensity(profile);
  const scored = candidateAreas
    .filter((candidate) => candidate.zip !== profile.zip)
    .map((candidate) => {
      const distance = source?.latitude && source?.longitude
        ? milesBetween(source.latitude, source.longitude, candidate.latitude, candidate.longitude)
        : null;
      const score =
        scoreNumber(profile.medianHouseholdIncome, candidate.incomeBand, 0.34) +
        scoreNumber(profile.population, candidate.populationBand, 0.18) +
        scoreNumber(profile.medianAge, candidate.ageBand, 0.13) +
        scoreNumber(profile.medianHomeValue, candidate.homeValueBand, 0.14) +
        scoreNumber(profile.bachelorsOrHigherRate, candidate.educationBand, 0.13) +
        (candidate.density === sourceDensity ? 0.08 : 0.03) +
        (distance === null ? 0.02 : distance < 45 ? 0.08 : distance < 140 ? 0.05 : 0.02);

      return {
        candidate,
        distance,
        matchScore: Math.round(Math.max(58, Math.min(94, score * 100))),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return scored.map(({ candidate, distance, matchScore }) => ({
    zip: candidate.zip,
    city: candidate.city,
    stateCode: candidate.stateCode,
    matchScore,
    why: buildMatchReason(profile, candidate, distance),
    similarities: buildSimilarities(profile, candidate, sourceDensity),
    difference: buildDifference(profile, candidate),
  }));
}

export function buildPremiumSignals(profile: DemographicProfile): PremiumSignal[] {
  const income = profile.medianHouseholdIncome;
  const home = profile.medianHomeValue;
  const commute = profile.averageCommuteMinutes;
  const bachelors = profile.bachelorsOrHigherRate;
  const poverty = profile.povertyRate;
  const vacancy = profile.vacancyRate;
  const owner = profile.ownerOccupiedRate;
  const householdSize = estimateHouseholdSize(profile);
  const familyScore = Math.round(Math.min(100, householdSize * 18 + (owner ?? 0.6) * 28 + (1 - (vacancy ?? 0.08)) * 18));
  const employmentScore = Math.round(Math.min(100, (bachelors ?? 0.28) * 45 + Math.max(0, 1 - (poverty ?? 0.12)) * 28 + Math.max(0, 1 - ((commute ?? 24) - 18) / 45) * 27));
  const pressureScore = income && home ? Math.round(Math.min(100, (home / income) * 16 + (poverty ?? 0.12) * 120)) : Math.round((poverty ?? 0.12) * 140);
  const transportScore = Math.round(Math.min(100, (commute ?? 24) * 2.4 + (vacancy ?? 0.08) * 70));
  const comparisonScore = Math.round(Math.min(100, Math.max(0, ((income ?? 64000) / 75000) * 36 + (bachelors ?? 0.28) * 36 + (1 - (poverty ?? 0.12)) * 28)));
  const growthScore = Math.round(Math.min(100, (bachelors ?? 0.28) * 42 + (1 - (vacancy ?? 0.08)) * 24 + Math.min(profile.population / 72000, 1) * 22 + (owner ?? 0.58) * 12));

  return [
    {
      label: "Family Household Signal",
      value: `${familyScore}/100`,
      detail: `Modeled from ${householdSize.toFixed(1)} residents per occupied unit, ownership, and vacancy context.`,
      score: familyScore,
      tone: familyScore > 72 ? "hot" : familyScore > 50 ? "warm" : "cool",
    },
    {
      label: "Employment Base Proxy",
      value: `${employmentScore}/100`,
      detail: `Education, poverty, and commute signals suggest ${employmentScore > 68 ? "stronger" : employmentScore > 48 ? "mixed" : "lighter"} local workforce depth.`,
      score: employmentScore,
      tone: employmentScore > 68 ? "hot" : employmentScore > 48 ? "warm" : "cool",
    },
    {
      label: "Transportation Friction",
      value: `${transportScore}/100`,
      detail: `${commute === null ? "Commute unavailable" : `${commute.toFixed(1)} minute commute`} blended with housing availability pressure.`,
      score: transportScore,
      tone: transportScore > 70 ? "hot" : transportScore > 45 ? "warm" : "cool",
    },
    {
      label: "Cost Pressure Alert",
      value: `${pressureScore}/100`,
      detail: home && income ? `${formatCurrency(home)} home value against ${formatCurrency(income)} household income.` : "Income or home value unavailable; pressure uses limited source fields.",
      score: pressureScore,
      tone: pressureScore > 70 ? "hot" : pressureScore > 45 ? "warm" : "cool",
    },
    {
      label: "Regional Comparison Index",
      value: `${comparisonScore}/100`,
      detail: "Income, education, and poverty are compressed into a quick cross-ZIP comparison score.",
      score: comparisonScore,
      tone: comparisonScore > 70 ? "hot" : comparisonScore > 48 ? "warm" : "cool",
    },
    {
      label: "Growth / Stability Signal",
      value: `${growthScore}/100`,
      detail: `${formatNumber(profile.population)} residents with education, occupancy, and ownership stability markers.`,
      score: growthScore,
      tone: growthScore > 70 ? "hot" : growthScore > 48 ? "warm" : "cool",
    },
  ];
}

export function buildTopInsights(profile: DemographicProfile): string[] {
  const ratio = profile.medianHouseholdIncome && profile.medianHomeValue ? profile.medianHomeValue / profile.medianHouseholdIncome : null;
  const density = classifyDensity(profile);
  const education = profile.bachelorsOrHigherRate;
  const commute = profile.averageCommuteMinutes;

  return [
    `${profile.displayName} reads as a ${density} ZIP/ZCTA with ${formatNumber(profile.population)} residents.`,
    ratio ? `Home-value pressure sits near ${ratio.toFixed(1)}x median household income.` : "Housing affordability ratio is limited because income or home value is unavailable.",
    education === null ? "Education depth is unavailable from the current source profile." : `${formatPercent(education)} bachelor's+ gives the area a ${education > 0.42 ? "strong" : education > 0.24 ? "moderate" : "light"} advanced-attainment signal.`,
    commute === null ? "Commute data is unavailable, so access friction remains a light signal." : `${commute.toFixed(1)} minute average commute shapes the local access profile.`,
  ];
}

export function buildSourceConfidence(profile: DemographicProfile) {
  const fields = [
    profile.population,
    profile.medianHouseholdIncome,
    profile.medianAge,
    profile.medianHomeValue,
    profile.highSchoolGradRate,
    profile.bachelorsOrHigherRate,
    profile.housingUnits,
    profile.averageCommuteMinutes,
  ];
  const complete = fields.filter((field) => field !== null && field !== undefined).length;
  const score = Math.round((complete / fields.length) * 100);
  return {
    score,
    label: score >= 88 ? "Strong source coverage" : score >= 70 ? "Good source coverage" : "Partial source coverage",
    note: `${complete}/${fields.length} core fields available from ${profile.sourceName}.`,
  };
}

export function buildInfographicRows(profile: DemographicProfile, similarAreas: SimilarArea[]) {
  const signals = buildPremiumSignals(profile);
  const topInsights = buildTopInsights(profile);
  return {
    facts: [
      ["Population", formatNumber(profile.population)],
      ["Median household income", formatOptionalCurrency(profile.medianHouseholdIncome)],
      ["Home value / rent proxy", profile.medianHomeValue === null ? "Estimate unavailable" : `${formatCurrency(profile.medianHomeValue)} median owner value`],
      ["Age profile", profile.medianAge === null ? "Data unavailable" : `${profile.medianAge.toFixed(1)} median age`],
      ["Education snapshot", profile.bachelorsOrHigherRate === null ? "Data unavailable" : `${formatPercent(profile.bachelorsOrHigherRate)} bachelor's+`],
      ["Employment / industry proxy", signals[1]?.value ?? "Coming soon"],
      ["Cost of living snapshot", signals[3]?.value ?? "Beta estimate"],
    ],
    similarPreview: similarAreas.map((area) => `${area.zip} ${area.city}, ${area.stateCode} - ${area.matchScore}% match`),
    insight: topInsights[0] ?? "Top insight unavailable.",
    sourceNote: `${profile.sourceName}; ZIP approximated as Census ZCTA ${profile.zcta}. Last checked ${new Date(profile.lastUpdated).toLocaleDateString()}.`,
  };
}

export function classifyDensity(profile: DemographicProfile): "urban" | "suburban" | "rural" {
  const units = profile.housingUnits ?? Math.max(1, Math.round(profile.population / 2.4));
  const densityProxy = profile.population / Math.max(units, 1);
  const metroSuburbanSignal =
    (profile.medianHouseholdIncome ?? 0) > 85000 ||
    (profile.bachelorsOrHigherRate ?? 0) > 0.42 ||
    ["raleigh", "cary", "durham", "charlotte", "morrisville"].includes(profile.place?.city.toLowerCase() ?? "");
  if (profile.population > 65000 || units > 30000 || densityProxy < 1.7) return "urban";
  if (profile.population < 23000 && units < 11000 && !metroSuburbanSignal) return "rural";
  return "suburban";
}

export function estimateHouseholdSize(profile: DemographicProfile) {
  if (profile.housingUnits === null || profile.vacancyRate === null) return 2.4;
  const occupied = Math.max(1, profile.housingUnits * (1 - profile.vacancyRate));
  return profile.population / occupied;
}

function scoreNumber(actual: number | null, expected: number, weight: number) {
  if (actual === null) return weight * 0.54;
  const spread = Math.max(Math.abs(expected) * 0.9, 1);
  const closeness = Math.max(0, 1 - Math.abs(actual - expected) / spread);
  return closeness * weight;
}

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRadians = (value: number) => value * Math.PI / 180;
  const radius = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildMatchReason(profile: DemographicProfile, candidate: CandidateArea, distance: number | null) {
  const proximity = distance === null ? "regional comparability" : distance < 45 ? "nearby regional proximity" : distance < 140 ? "same-state / nearby-market context" : "out-of-market benchmark";
  const income = profile.medianHouseholdIncome === null ? "income field pending" : incomeBandLabel(profile.medianHouseholdIncome, candidate.incomeBand);
  return `${income}, ${candidate.note}, and ${proximity}.`;
}

function buildSimilarities(profile: DemographicProfile, candidate: CandidateArea, density: "urban" | "suburban" | "rural") {
  const similarities = [
    density === candidate.density ? `${candidate.density} density feel` : "adjacent density pattern",
    profile.bachelorsOrHigherRate === null ? "education comparison pending" : `${educationBandLabel(profile.bachelorsOrHigherRate, candidate.educationBand)} education depth`,
    profile.medianHomeValue === null ? "housing value comparison pending" : `${homeBandLabel(profile.medianHomeValue, candidate.homeValueBand)} housing value range`,
  ];
  return similarities;
}

function buildDifference(profile: DemographicProfile, candidate: CandidateArea) {
  if (profile.population > candidate.populationBand * 1.45) return "Smaller comparable population base.";
  if (profile.population * 1.45 < candidate.populationBand) return "Larger comparable population base.";
  if (profile.medianHouseholdIncome !== null && profile.medianHouseholdIncome > candidate.incomeBand * 1.25) return "Comparable area has a lower income band.";
  if (profile.medianHouseholdIncome !== null && profile.medianHouseholdIncome * 1.25 < candidate.incomeBand) return "Comparable area has a higher income band.";
  return "Different local economy and commute mix.";
}

function incomeBandLabel(actual: number, expected: number) {
  const delta = Math.abs(actual - expected) / Math.max(expected, 1);
  if (delta < 0.14) return "similar income band";
  return actual > expected ? "higher-income source profile" : "lower-income source profile";
}

function educationBandLabel(actual: number, expected: number) {
  const delta = Math.abs(actual - expected);
  if (delta < 0.08) return "similar";
  return actual > expected ? "higher" : "lower";
}

function homeBandLabel(actual: number, expected: number) {
  const delta = Math.abs(actual - expected) / Math.max(expected, 1);
  if (delta < 0.16) return "similar";
  return actual > expected ? "higher" : "lower";
}
