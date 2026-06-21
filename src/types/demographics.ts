export type DemographicErrorCode =
  | "invalid_zip"
  | "missing_api_key"
  | "no_zcta_data"
  | "census_api_failure"
  | "network_failure";

export type PlaceLookup = {
  zip: string;
  city: string;
  state: string;
  stateCode: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  source: "Zippopotam.us" | "local place seed" | "Zippopotam.us + local place seed";
};

export type CensusDemographics = {
  population: number;
  medianHouseholdIncome: number | null;
  medianAge: number | null;
  malePopulation: number | null;
  femalePopulation: number | null;
  raceEthnicity: Array<{ label: string; value: number }>;
  povertyRate: number | null;
  highSchoolGradRate: number | null;
  bachelorsOrHigherRate: number | null;
  housingUnits: number | null;
  medianHomeValue: number | null;
  ownerOccupiedRate: number | null;
  vacancyRate: number | null;
  averageCommuteMinutes: number | null;
  sourceYear: "2024";
  sourceName: string;
  zcta: string;
  name: string;
  lastUpdated: string;
};

export type DemographicProfile = CensusDemographics & {
  zip: string;
  place: PlaceLookup | null;
  displayName: string;
  geographicSummary: string;
  sourceLinks: Array<{ label: string; href: string }>;
  providersUsed: string[];
};

export type SourceStatus = {
  name: string;
  role: string;
  status: "active" | "needs_key" | "reference" | "fallback" | "unavailable";
  detail: string;
  href?: string;
};

export type DemographicsResult =
  | { ok: true; profile: DemographicProfile }
  | {
      ok: false;
      code: DemographicErrorCode;
      message: string;
      fix: string;
      zip: string;
      place: PlaceLookup | null;
      providersUsed: string[];
      sourceLinks: Array<{ label: string; href: string }>;
      sourceStack: SourceStatus[];
    };
