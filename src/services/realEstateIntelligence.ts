import type { DemographicProfile } from "../types/demographics";

export type OwnershipEntityType =
  | "Individual"
  | "Trust"
  | "LLC"
  | "Corporation"
  | "REIT"
  | "Private Equity"
  | "Government";

export type PropertyTransaction = {
  id: string;
  saleDate: string;
  salePrice: number;
  buyerName: string;
  sellerName: string;
  deedType: string;
  transferAmount: number;
  appreciationSincePreviousSale: number | null;
  yearsHeld: number | null;
};

export type ComparableProperty = {
  id: string;
  streetAddress: string;
  yearBuilt: number;
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  lotSizeSqFt: number;
  estimatedMarketValue: number;
  assessedValue: number;
  annualPropertyTaxes: number;
  taxPerSquareFoot: number;
  ownerName: string;
  ownerMailingAddress: string;
  entityType: OwnershipEntityType;
  ownerOccupied: boolean;
  institutionalOwner: boolean;
  privateEquityOwner: boolean;
  institutionalBrand?: string;
  institutionalTooltip?: string;
};

export type OwnershipDistributionDatum = {
  label: OwnershipEntityType | "Institutional" | "Known PE";
  count: number;
  percent: number;
};

export type MedianHomeValueTrend = {
  year: number;
  value: number;
};

export type ZipHomeValuePeer = {
  zip: string;
  medianHomeValue: number;
  percentile: number;
};

export type TaxHeatDatum = {
  label: string;
  taxBurden: number;
  effectiveTaxRate: number;
};

export type NeighborhoodInvestmentLabel =
  | "Highly Stable"
  | "Stable"
  | "Transitional"
  | "Investor Heavy"
  | "Highly Speculative";

export type RealEstateIntelligence = {
  zip: string;
  medianHomeValue: number | null;
  medianHomeValuePercentile: number | null;
  surroundingZips: ZipHomeValuePeer[];
  historicalTrends: MedianHomeValueTrend[];
  ownerOccupiedProperties: number | null;
  renterOccupiedProperties: number | null;
  medianPropertyTaxAmount: number | null;
  estimatedEffectiveTaxRate: number | null;
  comparableProperties: ComparableProperty[];
  ownershipDistribution: OwnershipDistributionDatum[];
  individualOwnershipPercent: number;
  llcOwnershipPercent: number;
  corporationOwnershipPercent: number;
  trustOwnershipPercent: number;
  institutionalOwnershipPercent: number;
  privateEquityOwnershipPercent: number;
  neighborhoodInvestmentScore: number;
  neighborhoodInvestmentLabel: NeighborhoodInvestmentLabel;
  recentAppreciationRate: number;
  transactionActivity: number;
  averageYearsHeld: number;
  taxHeatMap: TaxHeatDatum[];
  aiObservation: string;
  dataCoverageNote: string;
};

const zipCache = new Map<string, RealEstateIntelligence>();
const transactionCache = new Map<string, PropertyTransaction[]>();

const institutionalOwners = [
  {
    brand: "Invitation Homes",
    entityType: "REIT" as OwnershipEntityType,
    tooltip: "Invitation Homes is a large publicly traded single-family rental owner and operator.",
  },
  {
    brand: "Progress Residential",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Progress Residential is widely associated with institutional single-family rental ownership.",
  },
  {
    brand: "Tricon Residential",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Tricon Residential is an institutional single-family rental platform acquired by Blackstone.",
  },
  {
    brand: "American Homes 4 Rent",
    entityType: "REIT" as OwnershipEntityType,
    tooltip: "American Homes 4 Rent is a large publicly traded single-family rental REIT.",
  },
  {
    brand: "Pretium Partners",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Pretium Partners is an investment manager known for single-family rental exposure.",
  },
  {
    brand: "Blackstone",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Blackstone is a global alternative asset manager with real-estate investment platforms.",
  },
  {
    brand: "Brookfield",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Brookfield is a large institutional alternative asset manager with real-estate holdings.",
  },
  {
    brand: "Starwood",
    entityType: "Private Equity" as OwnershipEntityType,
    tooltip: "Starwood Capital is a private investment firm with major real-estate holdings.",
  },
  {
    brand: "Greystar",
    entityType: "Corporation" as OwnershipEntityType,
    tooltip: "Greystar is a large institutional rental housing owner, operator, and manager.",
  },
  {
    brand: "Equity Residential",
    entityType: "REIT" as OwnershipEntityType,
    tooltip: "Equity Residential is a publicly traded apartment REIT.",
  },
];

export function getRealEstateIntelligence(profile: DemographicProfile): RealEstateIntelligence {
  const cached = zipCache.get(profile.zip);
  if (cached) return cached;

  const rng = createRng(profile.zip);
  const medianHomeValue = profile.medianHomeValue;
  const effectiveTaxRate = buildEffectiveTaxRate(profile, rng);
  const occupiedUnits = getOccupiedUnits(profile);
  const ownerOccupiedProperties = occupiedUnits !== null && profile.ownerOccupiedRate !== null
    ? Math.round(occupiedUnits * profile.ownerOccupiedRate)
    : null;
  const renterOccupiedProperties = occupiedUnits !== null && profile.ownerOccupiedRate !== null
    ? Math.max(0, occupiedUnits - ownerOccupiedProperties!)
    : null;
  const recentAppreciationRate = buildRecentAppreciationRate(profile, rng);
  const surroundingZips = buildSurroundingZips(profile, rng);
  const percentile = medianHomeValue === null ? null : buildPercentile(medianHomeValue, surroundingZips.map((peer) => peer.medianHomeValue));
  const comparableProperties = buildComparableProperties(profile, rng, effectiveTaxRate, recentAppreciationRate);
  const ownershipDistribution = buildOwnershipDistribution(comparableProperties);
  const averageYearsHeld = average(comparableProperties.map((property) => buildAverageHoldYears(property, profile.zip)));
  const transactionActivity = Math.round(comparableProperties.filter((property) => buildAverageHoldYears(property, profile.zip) < 7).length / comparableProperties.length * 100);
  const institutionalOwnershipPercent = percentOf(comparableProperties, (property) => property.institutionalOwner);
  const privateEquityOwnershipPercent = percentOf(comparableProperties, (property) => property.privateEquityOwner);
  const medianPropertyTaxAmount = medianHomeValue === null ? null : Math.round(medianHomeValue * effectiveTaxRate);
  const neighborhoodInvestmentScore = buildNeighborhoodInvestmentScore({
    medianHomeValue,
    income: profile.medianHouseholdIncome,
    effectiveTaxRate,
    ownerOccupiedRate: profile.ownerOccupiedRate,
    institutionalOwnershipPercent,
    privateEquityOwnershipPercent,
    recentAppreciationRate,
    transactionActivity,
    averageYearsHeld,
  });
  const intelligence: RealEstateIntelligence = {
    zip: profile.zip,
    medianHomeValue,
    medianHomeValuePercentile: percentile,
    surroundingZips,
    historicalTrends: buildHistoricalTrends(medianHomeValue, recentAppreciationRate, rng),
    ownerOccupiedProperties,
    renterOccupiedProperties,
    medianPropertyTaxAmount,
    estimatedEffectiveTaxRate: effectiveTaxRate,
    comparableProperties,
    ownershipDistribution,
    individualOwnershipPercent: percentOf(comparableProperties, (property) => property.entityType === "Individual"),
    llcOwnershipPercent: percentOf(comparableProperties, (property) => property.entityType === "LLC"),
    corporationOwnershipPercent: percentOf(comparableProperties, (property) => property.entityType === "Corporation" || property.entityType === "REIT"),
    trustOwnershipPercent: percentOf(comparableProperties, (property) => property.entityType === "Trust"),
    institutionalOwnershipPercent,
    privateEquityOwnershipPercent,
    neighborhoodInvestmentScore,
    neighborhoodInvestmentLabel: labelNeighborhoodInvestment(neighborhoodInvestmentScore),
    recentAppreciationRate,
    transactionActivity,
    averageYearsHeld,
    taxHeatMap: buildTaxHeatMap(comparableProperties),
    aiObservation: buildAiObservation(profile, comparableProperties, effectiveTaxRate, recentAppreciationRate),
    dataCoverageNote: "Current build uses ACS 2024 ZIP/ZCTA housing anchors plus modeled parcel-level comparables. County assessor, tax, deed, ATTOM, Zillow, Realtor.com, Redfin, FHFA, and parcel feeds can replace modeled records as live adapters are added.",
  };

  zipCache.set(profile.zip, intelligence);
  return intelligence;
}

export async function fetchPropertyTransactions(property: ComparableProperty, zip: string): Promise<PropertyTransaction[]> {
  const cached = transactionCache.get(property.id);
  if (cached) return cached;

  await new Promise((resolve) => window.setTimeout(resolve, 260));
  const rng = createRng(`${zip}-${property.id}-transactions`);
  const transactions = buildTransactions(property, rng);
  transactionCache.set(property.id, transactions);
  return transactions;
}

function buildComparableProperties(
  profile: DemographicProfile,
  rng: () => number,
  effectiveTaxRate: number,
  appreciationRate: number,
) {
  const medianHomeValue = profile.medianHomeValue ?? Math.max(140000, Math.round((profile.medianHouseholdIncome ?? 68000) * 3.45));
  const ownerRate = profile.ownerOccupiedRate ?? 0.62;
  const properties: ComparableProperty[] = Array.from({ length: 25 }, (_, index) => {
    const distanceFromMedian = (index - 12) * medianHomeValue * 0.006 + (rng() - 0.5) * medianHomeValue * 0.018;
    const estimatedMarketValue = roundToNearest(medianHomeValue + distanceFromMedian, 500);
    const squareFeet = Math.round(clamp(1350 + rng() * 1900 + (estimatedMarketValue / medianHomeValue - 1) * 700, 850, 5200));
    const annualPropertyTaxes = Math.round(estimatedMarketValue * effectiveTaxRate * (0.92 + rng() * 0.18));
    const ownerPattern = pickOwnerPattern(index, rng, ownerRate, profile);
    const bedrooms = Math.round(clamp(squareFeet / 650 + rng() * 1.4, 2, 6));
    const bathrooms = Number(clamp(bedrooms - 1 + rng() * 1.7, 1, 5.5).toFixed(rng() > 0.62 ? 1 : 0));
    const lotSizeSqFt = Math.round(clamp(3200 + rng() * 21000 - squareFeet * 0.8, 1600, 43560));

    return {
      id: `${profile.zip}-median-comp-${index + 1}`,
      streetAddress: `${100 + Math.floor(rng() * 8900)} ${pick(streetNames, rng)} ${pick(streetSuffixes, rng)}`,
      yearBuilt: Math.round(clamp(1952 + rng() * 68 + (appreciationRate - 0.34) * 16, 1908, 2025)),
      squareFeet,
      bedrooms,
      bathrooms,
      lotSizeSqFt,
      estimatedMarketValue,
      assessedValue: Math.round(estimatedMarketValue * (0.74 + rng() * 0.18)),
      annualPropertyTaxes,
      taxPerSquareFoot: annualPropertyTaxes / squareFeet,
      ownerName: ownerPattern.ownerName,
      ownerMailingAddress: ownerPattern.ownerMailingAddress,
      entityType: ownerPattern.entityType,
      ownerOccupied: ownerPattern.ownerOccupied,
      institutionalOwner: ownerPattern.institutionalOwner,
      privateEquityOwner: ownerPattern.privateEquityOwner,
      institutionalBrand: ownerPattern.institutionalBrand,
      institutionalTooltip: ownerPattern.institutionalTooltip,
    };
  });

  return properties.sort((a, b) => Math.abs(a.estimatedMarketValue - medianHomeValue) - Math.abs(b.estimatedMarketValue - medianHomeValue));
}

function pickOwnerPattern(index: number, rng: () => number, ownerRate: number, profile: DemographicProfile) {
  const institutionalPressure = clamp(0.05 + (1 - ownerRate) * 0.16 + ((profile.vacancyRate ?? 0.08) * 0.4), 0.04, 0.26);
  const forcedInstitutional = index % 13 === 8 && ownerRate < 0.82;
  const isInstitutional = rng() < institutionalPressure || forcedInstitutional;
  if (isInstitutional) {
    const owner = forcedInstitutional ? institutionalOwners[1] : pick(institutionalOwners, rng);
    return {
      ownerName: `${owner.brand} Residential Holdings ${String.fromCharCode(65 + Math.floor(rng() * 20))}, LLC`,
      ownerMailingAddress: `${1000 + Math.floor(rng() * 8000)} Capital Center Dr, Suite ${100 + Math.floor(rng() * 800)}`,
      entityType: owner.entityType,
      ownerOccupied: false,
      institutionalOwner: true,
      privateEquityOwner: owner.entityType === "Private Equity",
      institutionalBrand: owner.brand,
      institutionalTooltip: owner.tooltip,
    };
  }

  const entityRoll = rng();
  if (entityRoll < 0.12) {
    return {
      ownerName: `${pick(lastNames, rng)} Family Trust`,
      ownerMailingAddress: `${100 + Math.floor(rng() * 8900)} ${pick(streetNames, rng)} ${pick(streetSuffixes, rng)}`,
      entityType: "Trust" as OwnershipEntityType,
      ownerOccupied: rng() < 0.72,
      institutionalOwner: false,
      privateEquityOwner: false,
    };
  }
  if (entityRoll < 0.28) {
    return {
      ownerName: `${pick(streetNames, rng)} Property Group LLC`,
      ownerMailingAddress: `${100 + Math.floor(rng() * 8900)} ${pick(streetNames, rng)} ${pick(streetSuffixes, rng)}`,
      entityType: "LLC" as OwnershipEntityType,
      ownerOccupied: false,
      institutionalOwner: false,
      privateEquityOwner: false,
    };
  }
  if (entityRoll < 0.35) {
    return {
      ownerName: `${pick(lastNames, rng)} Residential Corp.`,
      ownerMailingAddress: `${100 + Math.floor(rng() * 8900)} ${pick(streetNames, rng)} ${pick(streetSuffixes, rng)}`,
      entityType: "Corporation" as OwnershipEntityType,
      ownerOccupied: false,
      institutionalOwner: false,
      privateEquityOwner: false,
    };
  }

  const first = pick(firstNames, rng);
  const last = pick(lastNames, rng);
  return {
    ownerName: `${first} ${last}`,
    ownerMailingAddress: rng() < ownerRate ? "Same as property address" : `${100 + Math.floor(rng() * 8900)} ${pick(streetNames, rng)} ${pick(streetSuffixes, rng)}`,
    entityType: "Individual" as OwnershipEntityType,
    ownerOccupied: rng() < ownerRate,
    institutionalOwner: false,
    privateEquityOwner: false,
  };
}

function buildTransactions(property: ComparableProperty, rng: () => number): PropertyTransaction[] {
  const count = 3 + Math.floor(rng() * 3);
  const currentYear = 2026;
  let latestPrice = property.estimatedMarketValue * (0.88 + rng() * 0.08);
  let year = currentYear - (1 + Math.floor(rng() * 4));
  const transactions: PropertyTransaction[] = [];

  for (let index = 0; index < count; index += 1) {
    const yearsHeld = index === 0 ? currentYear - year : 3 + Math.floor(rng() * 8);
    const previousPrice = latestPrice / (1.12 + rng() * 0.46);
    const salePrice = roundToNearest(latestPrice, 1000);
    const previousRounded = roundToNearest(previousPrice, 1000);

    transactions.push({
      id: `${property.id}-tx-${index + 1}`,
      saleDate: `${year}-${String(1 + Math.floor(rng() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rng() * 27)).padStart(2, "0")}`,
      salePrice,
      buyerName: index === 0 ? property.ownerName : buildTransactionParty(rng),
      sellerName: buildTransactionParty(rng),
      deedType: pick(["Warranty Deed", "Special Warranty Deed", "Grant Deed", "Quitclaim Deed"], rng),
      transferAmount: salePrice,
      appreciationSincePreviousSale: index === count - 1 ? null : (salePrice - previousRounded) / previousRounded,
      yearsHeld: index === count - 1 ? null : yearsHeld,
    });

    latestPrice = previousPrice;
    year -= yearsHeld;
  }

  return transactions.slice(0, 5);
}

function buildTransactionParty(rng: () => number) {
  if (rng() < 0.22) return `${pick(streetNames, rng)} Holdings LLC`;
  if (rng() < 0.12) return `${pick(lastNames, rng)} Family Trust`;
  return `${pick(firstNames, rng)} ${pick(lastNames, rng)}`;
}

function buildSurroundingZips(profile: DemographicProfile, rng: () => number): ZipHomeValuePeer[] {
  const zipNumber = Number(profile.zip);
  const baseValue = profile.medianHomeValue ?? Math.max(140000, (profile.medianHouseholdIncome ?? 68000) * 3.45);
  const peers = Array.from({ length: 12 }, (_, index) => {
    const offset = index - 6 >= 0 ? index - 5 : index - 6;
    const peerZip = String(clamp(zipNumber + offset, 501, 99950)).padStart(5, "0");
    const medianHomeValue = roundToNearest(baseValue * (0.76 + rng() * 0.52), 1000);
    return { zip: peerZip, medianHomeValue, percentile: 0 };
  });
  const allValues = peers.map((peer) => peer.medianHomeValue).concat(baseValue);
  return peers.map((peer) => ({ ...peer, percentile: buildPercentile(peer.medianHomeValue, allValues) }));
}

function buildHistoricalTrends(medianHomeValue: number | null, appreciationRate: number, rng: () => number): MedianHomeValueTrend[] {
  const currentValue = medianHomeValue ?? 285000;
  return Array.from({ length: 10 }, (_, index) => {
    const year = 2017 + index;
    const yearsBack = 2026 - year;
    const slope = Math.pow(1 + appreciationRate / 9, yearsBack);
    const noise = 0.98 + rng() * 0.04;
    return { year, value: roundToNearest(currentValue / slope * noise, 1000) };
  });
}

function buildTaxHeatMap(properties: ComparableProperty[]) {
  return properties.slice(0, 12).map((property) => ({
    label: property.streetAddress.split(" ").slice(0, 2).join(" "),
    taxBurden: property.annualPropertyTaxes,
    effectiveTaxRate: property.annualPropertyTaxes / property.estimatedMarketValue,
  }));
}

function buildOwnershipDistribution(properties: ComparableProperty[]): OwnershipDistributionDatum[] {
  const entityTypes: OwnershipEntityType[] = ["Individual", "LLC", "Corporation", "Trust", "REIT", "Private Equity", "Government"];
  const base = entityTypes
    .map((entityType) => {
      const count = properties.filter((property) => property.entityType === entityType).length;
      return { label: entityType, count, percent: Math.round((count / properties.length) * 100) };
    })
    .filter((entry) => entry.count > 0);
  const institutional = properties.filter((property) => property.institutionalOwner).length;
  const pe = properties.filter((property) => property.privateEquityOwner).length;
  return [
    ...base,
    { label: "Institutional" as const, count: institutional, percent: Math.round((institutional / properties.length) * 100) },
    { label: "Known PE" as const, count: pe, percent: Math.round((pe / properties.length) * 100) },
  ].filter((entry) => entry.count > 0);
}

function buildAiObservation(
  profile: DemographicProfile,
  properties: ComparableProperty[],
  effectiveTaxRate: number,
  appreciationRate: number,
) {
  const averageTaxes = Math.round(average(properties.map((property) => property.annualPropertyTaxes)));
  const ownerOccupiedShare = percentOf(properties, (property) => property.ownerOccupied);
  const llcShare = percentOf(properties, (property) => property.entityType === "LLC");
  const institutionalShare = percentOf(properties, (property) => property.institutionalOwner);
  return `Median home value for ZIP ${profile.zip} is ${currency(profile.medianHomeValue)}. Of the 25 homes nearest the median, ${ownerOccupiedShare}% are owner occupied, ${llcShare}% are LLC-owned, and ${institutionalShare}% are held by known institutional investors. Average annual property taxes are ${currency(averageTaxes)}, with an estimated effective tax rate of ${(effectiveTaxRate * 100).toFixed(2)}%. Homes have appreciated ${Math.round(appreciationRate * 100)}% over the modeled ten-year trend.`;
}

function buildNeighborhoodInvestmentScore(input: {
  medianHomeValue: number | null;
  income: number | null;
  effectiveTaxRate: number;
  ownerOccupiedRate: number | null;
  institutionalOwnershipPercent: number;
  privateEquityOwnershipPercent: number;
  recentAppreciationRate: number;
  transactionActivity: number;
  averageYearsHeld: number;
}) {
  const incomeRatio = input.medianHomeValue && input.income ? input.medianHomeValue / input.income : 3.5;
  const affordability = clamp(100 - Math.abs(incomeRatio - 3.2) * 12, 0, 100);
  const taxBurden = clamp(100 - input.effectiveTaxRate * 4200, 0, 100);
  const ownership = (input.ownerOccupiedRate ?? 0.58) * 100;
  const institutionalPenalty = input.institutionalOwnershipPercent * 0.9 + input.privateEquityOwnershipPercent * 0.7;
  const appreciation = clamp(input.recentAppreciationRate * 120, 0, 100);
  const turnover = clamp(100 - Math.abs(input.transactionActivity - 34) * 1.3, 0, 100);
  const hold = clamp(input.averageYearsHeld * 8, 0, 100);
  return Math.round(clamp(affordability * 0.16 + taxBurden * 0.13 + ownership * 0.2 + appreciation * 0.15 + turnover * 0.12 + hold * 0.14 + 18 - institutionalPenalty, 0, 100));
}

function buildEffectiveTaxRate(profile: DemographicProfile, rng: () => number) {
  const state = profile.place?.stateCode ?? "";
  const stateBase: Record<string, number> = {
    NJ: 0.021,
    IL: 0.019,
    TX: 0.018,
    NY: 0.016,
    CA: 0.0076,
    NC: 0.0084,
    FL: 0.0091,
    GA: 0.0092,
    VA: 0.0088,
    WA: 0.0094,
    CO: 0.0065,
    AZ: 0.0067,
  };
  return clamp((stateBase[state] ?? 0.0108) + (rng() - 0.5) * 0.0035, 0.0048, 0.024);
}

function buildRecentAppreciationRate(profile: DemographicProfile, rng: () => number) {
  const income = profile.medianHouseholdIncome ?? 68000;
  const value = profile.medianHomeValue ?? income * 3.4;
  const educationLift = (profile.bachelorsOrHigherRate ?? 0.28) * 0.22;
  const supplyTension = (1 - (profile.vacancyRate ?? 0.08)) * 0.24;
  const valueLift = clamp(value / 650000, 0.08, 0.78) * 0.24;
  return clamp(0.15 + educationLift + supplyTension + valueLift + (rng() - 0.5) * 0.12, 0.08, 0.92);
}

function getOccupiedUnits(profile: DemographicProfile) {
  if (profile.housingUnits === null || profile.vacancyRate === null) return null;
  return Math.round(profile.housingUnits * (1 - profile.vacancyRate));
}

function buildAverageHoldYears(property: ComparableProperty, zip: string) {
  const rng = createRng(`${zip}-${property.id}-hold`);
  if (property.institutionalOwner) return clamp(3.5 + rng() * 4.5, 2, 9);
  if (property.entityType === "Individual" && property.ownerOccupied) return clamp(7 + rng() * 13, 4, 22);
  return clamp(4 + rng() * 8, 2, 14);
}

function labelNeighborhoodInvestment(score: number): NeighborhoodInvestmentLabel {
  if (score >= 80) return "Highly Stable";
  if (score >= 60) return "Stable";
  if (score >= 40) return "Transitional";
  if (score >= 20) return "Investor Heavy";
  return "Highly Speculative";
}

function buildPercentile(value: number, values: number[]) {
  const sorted = [...values, value].sort((a, b) => a - b);
  const rank = sorted.filter((entry) => entry <= value).length - 1;
  return Math.round((rank / Math.max(1, sorted.length - 1)) * 100);
}

function percentOf<T>(items: T[], predicate: (item: T) => boolean) {
  if (!items.length) return 0;
  return Math.round((items.filter(predicate).length / items.length) * 100);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function roundToNearest(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function currency(value: number | null) {
  return value === null ? "unavailable" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function createRng(seedText: string) {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const streetNames = [
  "Oakview",
  "Maple Ridge",
  "Cedar Bend",
  "Heritage",
  "Lakewood",
  "Pine Hollow",
  "Stonebridge",
  "Meadow Run",
  "Brookhaven",
  "Summit",
  "Parkside",
  "Riverside",
  "Willow Creek",
  "Highland",
  "Magnolia",
];

const streetSuffixes = ["Dr", "Ln", "Ct", "Ave", "Way", "Rd", "Terrace", "Place"];
const firstNames = ["Avery", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Jamie", "Cameron", "Drew", "Quinn", "Reese", "Skyler"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Miller", "Davis", "Garcia", "Wilson", "Anderson", "Thomas", "Moore", "Martin"];
