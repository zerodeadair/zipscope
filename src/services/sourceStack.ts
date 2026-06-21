import type { PlaceLookup, SourceStatus } from "../types/demographics";
import { getZipAtlasReference } from "./providers/zipAtlasProvider";

export function buildSourceLinks(zip: string) {
  return [
    {
      label: "Census ACS 2024 Profile API",
      href: `https://api.census.gov/data/2024/acs/acs5/profile?get=NAME,DP05_0001E,DP05_0018E,DP05_0002E,DP05_0003E,DP05_0037PE,DP05_0038PE,DP05_0039PE,DP05_0044PE,DP05_0052PE,DP05_0071PE,DP03_0062E,DP03_0128PE,DP02_0067PE,DP02_0068PE,DP04_0001E,DP04_0089E&for=zip%20code%20tabulation%20area:${zip}`,
    },
    { label: "Census Reporter ACS profile", href: `https://censusreporter.org/profiles/86000US${zip}-${zip}/` },
    { label: "HUD-USPS ZIP Crosswalk API", href: "https://www.huduser.gov/portal/dataset/uspszip-api.html" },
    { label: "Zippopotam.us place lookup", href: `https://api.zippopotam.us/us/${zip}` },
    { label: "SimpleMaps ZIP database", href: "https://simplemaps.com/data/us-zips" },
    getZipAtlasReference(zip),
  ];
}

export function buildSourceStack(zip: string, place: PlaceLookup | null, hasCensusKey: boolean, hasHudToken: boolean): SourceStatus[] {
  return [
    {
      name: "U.S. Census ACS 2024 5-year Profile",
      role: "Demographic truth layer",
      status: hasCensusKey ? "active" : "needs_key",
      detail: hasCensusKey
        ? `Ready to fetch official ZCTA ${zip} population, income, poverty, education, and housing fields.`
        : "Needs CENSUS_API_KEY before official ZCTA demographic fields can be displayed.",
      href: "https://www.census.gov/data/developers/data-sets/acs-5year.html",
    },
    {
      name: "Census Reporter",
      role: "No-key ACS profile cache",
      status: "active",
      detail: "Used when the Census API key is missing. Census Reporter publishes current ACS profile data sourced from the U.S. Census Bureau.",
      href: `https://censusreporter.org/profiles/86000US${zip}-${zip}/`,
    },
    {
      name: "HUD-USPS ZIP Code Crosswalk",
      role: "ZIP-to-county/CBSA bridge",
      status: hasHudToken ? "active" : "needs_key",
      detail: hasHudToken
        ? "HUD token detected; ZIP crosswalk enrichment is available for server-side integration."
        : "Add HUD_USER_TOKEN later for residential/business ratio and county/CBSA crosswalk enrichment.",
      href: "https://www.huduser.gov/portal/dataset/uspszip-api.html",
    },
    {
      name: "Zippopotam.us",
      role: "Friendly city/state/coordinate label",
      status: place?.source.includes("Zippopotam.us") ? "active" : "unavailable",
      detail: place?.source.includes("Zippopotam.us")
        ? `Resolved ${zip} to ${place.city}, ${place.stateCode}.`
        : "No live place result returned for this ZIP.",
      href: `https://api.zippopotam.us/us/${zip}`,
    },
    {
      name: "Local ZIP seed",
      role: "Known test ZIP label guardrail",
      status: place?.source.includes("local place seed") ? "fallback" : "reference",
      detail: place?.county
        ? `County label supplied or confirmed as ${place.county}. Seed labels never provide demographic values.`
        : "Available for known acceptance-test ZIP labels only, not demographics.",
    },
    {
      name: "ZipAtlas",
      role: "Manual reference link",
      status: "reference",
      detail: "Included as a verification link only. The app does not scrape ZipAtlas.",
      href: `https://zipatlas.com/us/zip-code/${zip}.htm`,
    },
    {
      name: "County Assessor / Tax / Recorder feeds",
      role: "Parcel, tax, and deed records",
      status: "reference",
      detail: "Real-estate module is structured for county parcel, tax, and deed adapters. Current parcel rows remain modeled until jurisdiction-specific feeds are connected.",
    },
    {
      name: "ATTOM, Zillow, Realtor.com, Redfin, FHFA",
      role: "Market value, listing, and appreciation enrichment",
      status: "reference",
      detail: "External real-estate providers are represented in the source stack for future licensed enrichment; the app does not scrape restricted provider data.",
    },
  ];
}
