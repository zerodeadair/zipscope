import { getSeedPlace } from "./zipLookup";
import { isValidZip } from "../utils/zipValidation";

export function runDevelopmentValidationChecks() {
  if (!import.meta.env.DEV) return;

  const mountAiry = getSeedPlace("27030");
  console.assert(mountAiry?.city === "Mount Airy", "ZIP 27030 should resolve to Mount Airy.");
  console.assert(mountAiry?.county === "Surry County", "ZIP 27030 should resolve to Surry County.");
  console.assert(mountAiry?.stateCode === "NC", "ZIP 27030 should resolve to North Carolina.");
  console.assert(mountAiry?.county !== "Fulton County", "ZIP 27030 must not display Fulton County, GA.");
  console.assert(isValidZip("27030"), "27030 should pass ZIP validation.");
  console.assert(!isValidZip(""), "Empty ZIP should be rejected.");
  console.assert(!isValidZip("abcde"), "Letters should be rejected.");
  console.assert(!isValidZip("27030-1234"), "ZIP+4 should be rejected until supported.");
}
