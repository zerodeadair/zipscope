import { DemographicProfile } from "../providers/demographicsProvider";

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(Math.round(value));

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number) =>
  `${(value * 100).toFixed(value < 0.1 ? 1 : 0)}%`;

export const formatOptionalCurrency = (value: number | null) =>
  value === null ? "-" : formatCurrency(value);

export const formatOptionalNumber = (value: number | null) =>
  value === null ? "-" : formatNumber(value);

export const formatOptionalPercent = (value: number | null) =>
  value === null ? "-" : formatPercent(value);

export function localMarketScore(profile: DemographicProfile) {
  const populationScore = Math.min(profile.population / 80000, 1) * 25;
  const incomeScore = Math.min((profile.medianHouseholdIncome ?? 0) / 120000, 1) * 35;
  const educationScore = Math.min((profile.bachelorsOrHigherRate ?? 0) / 0.65, 1) * 25;
  const housingScore = Math.min((profile.housingUnits ?? 0) / 40000, 1) * 15;
  return Math.round(populationScore + incomeScore + educationScore + housingScore);
}
