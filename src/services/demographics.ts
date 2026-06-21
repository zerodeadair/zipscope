import type { CensusDemographics, DemographicErrorCode, DemographicProfile, DemographicsResult } from "../types/demographics";
import { isValidZip } from "../utils/zipValidation";
import { buildSourceLinks, buildSourceStack } from "./sourceStack";
import { lookupZipPlace } from "./zipLookup";

export async function getDemographics(zip: string): Promise<DemographicsResult> {
  const cleanZip = zip.trim();
  if (!isValidZip(cleanZip)) {
    return toError("invalid_zip", cleanZip, null, ["ZIP validator"]);
  }

  const place = await lookupZipPlace(cleanZip);
  const providersUsed = place ? [place.source] : [];

  try {
    const response = await fetch(`/api/demographics?zip=${encodeURIComponent(cleanZip)}`);
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.ok) {
      const code = (payload?.code ?? "census_api_failure") as DemographicErrorCode;
      const error = toError(code, cleanZip, place, providersUsed);
      return {
        ...error,
        message: payload?.message ?? error.message,
        fix: payload?.fix ?? error.fix,
      };
    }

    const census = payload.data as CensusDemographics;
    const demographicsProvider = typeof payload.provider === "string" ? payload.provider : "Census ACS 2024";
    const profile = buildProfile(cleanZip, census, place, [...providersUsed, demographicsProvider]);
    debugProviders(profile.providersUsed);
    return { ok: true, profile };
  } catch {
    const error = toError("network_failure", cleanZip, place, providersUsed);
    debugProviders([...providersUsed, "Census ACS 2024 unavailable"]);
    return error;
  }
}

function buildProfile(zip: string, census: CensusDemographics, place: DemographicProfile["place"], providersUsed: string[]): DemographicProfile {
  const displayName = place
    ? `${place.city}, ${place.stateCode}${place.county ? ` / ${place.county}` : ""}`
    : census.name;
  const locationText = place
    ? `${place.city}, ${place.stateCode}${place.county ? ` in ${place.county}` : ""}`
    : `ZCTA ${census.zcta}`;

  return {
    ...census,
    zip,
    place,
    displayName,
    geographicSummary: `ZIP ${zip} is represented by Census ZCTA ${census.zcta}. Friendly place labeling resolves to ${locationText}; demographic values come from ${census.sourceName}.`,
    sourceLinks: buildSourceLinks(zip),
    providersUsed,
  };
}

function toError(code: DemographicErrorCode, zip: string, place: DemographicProfile["place"], providersUsed: string[]): Extract<DemographicsResult, { ok: false }> {
  const messages: Record<DemographicErrorCode, { message: string; fix: string }> = {
    invalid_zip: {
      message: "Enter a valid 5-digit U.S. ZIP code.",
      fix: "ZIP+4, letters, and blank searches are not supported yet.",
    },
    missing_api_key: {
      message: "Live demographic data unavailable. Add Census API key or try again.",
      fix: "Create `.env.local` from `.env.local.example`, set CENSUS_API_KEY, then restart `npm run dev`.",
    },
    no_zcta_data: {
      message: "No demographic data found for this ZIP/ZCTA.",
      fix: "Check the ZIP code or try a USPS ZIP that has a Census ZCTA profile.",
    },
    census_api_failure: {
      message: "Live demographic data unavailable. Add Census API key or try again.",
      fix: "The Census API returned an error. Verify the key and try again.",
    },
    network_failure: {
      message: "Live demographic data unavailable. Add Census API key or try again.",
      fix: "Network access to the Census API failed. Try again after connectivity is restored.",
    },
  };

  return {
    ok: false,
    code,
    zip,
    place,
    providersUsed,
    sourceLinks: buildSourceLinks(zip),
    sourceStack: buildSourceStack(zip, place, code !== "missing_api_key", false),
    ...messages[code],
  };
}

function debugProviders(providers: string[]) {
  if (import.meta.env.DEV) {
    console.debug("[ZipScope] Demographics providers:", providers.join(", "));
  }
}
