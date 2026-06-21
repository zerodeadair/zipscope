import type { PlaceLookup } from "../types/demographics";
import { isValidZip } from "../utils/zipValidation";

const placeSeeds: Record<string, Omit<PlaceLookup, "source">> = {
  "27030": {
    zip: "27030",
    city: "Mount Airy",
    state: "North Carolina",
    stateCode: "NC",
    county: "Surry County",
    latitude: 36.4993,
    longitude: -80.6073,
  },
  "27617": {
    zip: "27617",
    city: "Raleigh",
    state: "North Carolina",
    stateCode: "NC",
    county: "Wake County",
    latitude: 35.9057,
    longitude: -78.7875,
  },
  "90210": {
    zip: "90210",
    city: "Beverly Hills",
    state: "California",
    stateCode: "CA",
    county: "Los Angeles County",
    latitude: 34.103,
    longitude: -118.4105,
  },
  "10001": {
    zip: "10001",
    city: "New York",
    state: "New York",
    stateCode: "NY",
    county: "New York County",
    latitude: 40.7506,
    longitude: -73.9972,
  },
};

export async function lookupZipPlace(zip: string): Promise<PlaceLookup | null> {
  if (!isValidZip(zip)) return null;

  const seed = placeSeeds[zip];
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) {
      return seed ? { ...seed, source: "local place seed" } : null;
    }

    const payload = await response.json();
    const firstPlace = payload.places?.[0];
    if (!firstPlace) {
      return seed ? { ...seed, source: "local place seed" } : null;
    }

    const place: PlaceLookup = {
      zip,
      city: firstPlace["place name"],
      state: firstPlace.state,
      stateCode: firstPlace["state abbreviation"],
      county: seed?.county,
      latitude: Number(firstPlace.latitude),
      longitude: Number(firstPlace.longitude),
      source: seed ? "Zippopotam.us + local place seed" : "Zippopotam.us",
    };

    return place;
  } catch {
    return seed ? { ...seed, source: "local place seed" } : null;
  }
}

export function getSeedPlace(zip: string): PlaceLookup | null {
  const seed = placeSeeds[zip];
  return seed ? { ...seed, source: "local place seed" } : null;
}
