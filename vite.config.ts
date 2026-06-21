import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const censusFields = [
  "NAME",
  "DP05_0001E",
  "DP05_0018E",
  "DP05_0002E",
  "DP05_0003E",
  "DP05_0037PE",
  "DP05_0038PE",
  "DP05_0039PE",
  "DP05_0044PE",
  "DP05_0052PE",
  "DP05_0071PE",
  "DP03_0062E",
  "DP03_0128PE",
  "DP02_0067PE",
  "DP02_0068PE",
  "DP03_0025E",
  "DP04_0001E",
  "DP04_0003PE",
  "DP04_0046PE",
  "DP04_0089E",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const censusApiKey = env.CENSUS_API_KEY || env.VITE_CENSUS_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: "zipscope-demographics-api",
        configureServer(server) {
          server.middlewares.use("/api/demographics", async (request, response) => {
            const requestUrl = new URL(request.url ?? "", "http://localhost");
            const zip = requestUrl.searchParams.get("zip")?.trim() ?? "";

            response.setHeader("Content-Type", "application/json");

            if (!/^\d{5}$/.test(zip)) {
              response.statusCode = 400;
              response.end(JSON.stringify({ ok: false, code: "invalid_zip", message: "Enter a valid 5-digit U.S. ZIP code." }));
              return;
            }

            if (!censusApiKey) {
              const fallback = await fetchCensusReporterFallback(zip);
              if (fallback) {
                response.end(JSON.stringify({ ok: true, data: fallback, provider: "Census Reporter cached ACS profile" }));
              } else {
                response.statusCode = 401;
                response.end(JSON.stringify({
                  ok: false,
                  code: "missing_api_key",
                  message: "Live demographic data unavailable. Add Census API key or try again.",
                  fix: "Create `.env.local` from `.env.local.example`, set CENSUS_API_KEY, then restart `npm run dev`.",
                }));
              }
              return;
            }

            const url = new URL("https://api.census.gov/data/2024/acs/acs5/profile");
            url.searchParams.set("get", censusFields.join(","));
            url.searchParams.set("for", `zip code tabulation area:${zip}`);
            url.searchParams.set("key", censusApiKey);

            try {
              const censusResponse = await fetch(url);
              if (censusResponse.status === 204 || censusResponse.status === 404) {
                response.statusCode = 404;
                response.end(JSON.stringify({ ok: false, code: "no_zcta_data", message: "No demographic data found for this ZIP/ZCTA." }));
                return;
              }

              if (!censusResponse.ok) {
                response.statusCode = censusResponse.status === 429 ? 429 : 502;
                response.end(JSON.stringify({
                  ok: false,
                  code: censusResponse.status === 429 ? "network_failure" : "census_api_failure",
                  message: "Live demographic data unavailable. Add Census API key or try again.",
                  fix: "The Census API returned an error. Verify the key and try again.",
                }));
                return;
              }

              const rows = await censusResponse.json();
              if (!Array.isArray(rows) || rows.length < 2) {
                response.statusCode = 404;
                response.end(JSON.stringify({ ok: false, code: "no_zcta_data", message: "No demographic data found for this ZIP/ZCTA." }));
                return;
              }

              const [headers, values] = rows;
              const record = Object.fromEntries(headers.map((header: string, index: number) => [header, values[index]]));
              response.end(JSON.stringify({ ok: true, data: mapCensusRecord(record, zip) }));
            } catch {
              response.statusCode = 503;
              response.end(JSON.stringify({
                ok: false,
                code: "network_failure",
                message: "Live demographic data unavailable. Add Census API key or try again.",
                fix: "Network access to the Census API failed. Try again after connectivity is restored.",
              }));
            }
          });
        },
      },
    ],
  };
});

function mapCensusRecord(record: Record<string, string>, zip: string) {
  return {
    population: parseCensusNumber(record.DP05_0001E) ?? 0,
    medianAge: parseCensusNumber(record.DP05_0018E),
    malePopulation: parseCensusNumber(record.DP05_0002E),
    femalePopulation: parseCensusNumber(record.DP05_0003E),
    raceEthnicity: [
      { label: "White", value: parseCensusNumber(record.DP05_0037PE) ?? 0 },
      { label: "Black", value: parseCensusNumber(record.DP05_0038PE) ?? 0 },
      { label: "Native", value: parseCensusNumber(record.DP05_0039PE) ?? 0 },
      { label: "Asian", value: parseCensusNumber(record.DP05_0044PE) ?? 0 },
      { label: "Other", value: parseCensusNumber(record.DP05_0052PE) ?? 0 },
      { label: "Hispanic", value: parseCensusNumber(record.DP05_0071PE) ?? 0 },
    ],
    medianHouseholdIncome: parseCensusNumber(record.DP03_0062E),
    povertyRate: percentToRatio(record.DP03_0128PE),
    highSchoolGradRate: percentToRatio(record.DP02_0067PE),
    bachelorsOrHigherRate: percentToRatio(record.DP02_0068PE),
    housingUnits: parseCensusNumber(record.DP04_0001E),
    medianHomeValue: parseCensusNumber(record.DP04_0089E),
    ownerOccupiedRate: percentToRatio(record.DP04_0046PE),
    vacancyRate: percentToRatio(record.DP04_0003PE),
    averageCommuteMinutes: parseCensusNumber(record.DP03_0025E),
    sourceYear: "2024",
    sourceName: "U.S. Census ACS 2024 5-year Profile",
    zcta: zip,
    name: record.NAME ?? `ZCTA5 ${zip}`,
    lastUpdated: new Date().toISOString(),
  };
}

function parseCensusNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function percentToRatio(value: string | undefined) {
  const parsed = parseCensusNumber(value);
  return parsed === null ? null : parsed / 100;
}

async function fetchCensusReporterFallback(zip: string) {
  try {
    const response = await fetch(`http://censusreporter.org/profiles/86000US${zip}-${zip}/`);
    if (!response.ok) return null;
    const html = await response.text();
    const profileData = parseCensusReporterProfileData(html);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const population = readNumber(text, /([\d,]+)\s+Population/i) ?? readStatNumber(html, "Population");
    if (!population) return null;

    return {
      population,
      medianAge: profileData?.demographics?.age?.median_age?.total?.values?.this ?? readStatNumber(html, "Median age"),
      malePopulation: profileData?.demographics?.sex?.percent_male?.numerators?.this ?? null,
      femalePopulation: profileData?.demographics?.sex?.percent_female?.numerators?.this ?? null,
      raceEthnicity: profileData ? readRaceEthnicity(profileData) : [],
      medianHouseholdIncome: readStatNumber(html, "Median household income"),
      povertyRate: readStatPercent(html, "Persons below poverty line"),
      highSchoolGradRate: readStatPercent(html, "High school grad or higher"),
      bachelorsOrHigherRate: readStatPercent(html, "Bachelor&#x27;s degree or higher"),
      housingUnits: readStatNumber(html, "Number of housing units"),
      medianHomeValue: readStatNumber(html, "Median value of owner-occupied housing units"),
      ownerOccupiedRate: readProfileRatio(profileData, ["housing", "ownership", "distribution", "owner", "values", "this"]),
      vacancyRate: readProfileRatio(profileData, ["housing", "units", "occupancy_distribution", "vacant", "values", "this"]),
      averageCommuteMinutes: readProfileNumber(profileData, ["economics", "employment", "mean_travel_time", "values", "this"]) ?? readStatNumber(html, "Mean travel time to work"),
      sourceYear: "2024",
      sourceName: "Census Reporter cached ACS 2024 5-year profile (U.S. Census Bureau data)",
      zcta: zip,
      name: `ZCTA5 ${zip}`,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function readRaceEthnicity(profileData: any) {
  const race = profileData?.demographics?.race;
  if (!race) return [];
  return Object.values(race)
    .filter((entry: any) => entry?.values?.this !== undefined && entry?.name && !entry.metadata)
    .map((entry: any) => ({ label: String(entry.name), value: Number(entry.values.this) }))
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0)
    .slice(0, 6);
}

function parseCensusReporterProfileData(html: string): any | null {
  const assignment = "profileData =";
  const start = html.indexOf(assignment);
  if (start === -1) return null;
  const valueStart = start + assignment.length;
  const end = html.indexOf("window.profileData", valueStart);
  if (end === -1) return null;
  const raw = html.slice(valueStart, end).trim().replace(/;\s*$/, "").replace(/,\s*$/, "");
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readNumber(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function readPercent(text: string, pattern: RegExp) {
  const parsed = readNumber(text, pattern);
  return parsed === null ? null : parsed / 100;
}

function readStatNumber(html: string, label: string) {
  const valueText = readStatValueText(html, label);
  if (!valueText) return null;
  const match = valueText.match(/\$?([\d,]+(?:\.\d+)?)%?/);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function readStatPercent(html: string, label: string) {
  const parsed = readStatNumber(html, label);
  return parsed === null ? null : parsed / 100;
}

function readProfileNumber(profileData: any, path: string[]) {
  const value = path.reduce((current, key) => current?.[key], profileData);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readProfileRatio(profileData: any, path: string[]) {
  const value = readProfileNumber(profileData, path);
  return value === null ? null : value / 100;
}

function readStatValueText(html: string, label: string) {
  const labelIndex = html.indexOf(label);
  if (labelIndex === -1) return null;
  const start = html.lastIndexOf('<span class="value"', labelIndex);
  if (start === -1) return null;
  const block = html.slice(start, labelIndex);
  return block
    .replace(/<span class="context[\s\S]*?<\/span>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&plusmn;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
