import { getDemographics } from "../services/demographics";
import type { DemographicProfile } from "../types/demographics";

export type { DemographicProfile };

export async function fetchDemographics(zip: string): Promise<DemographicProfile> {
  const result = await getDemographics(zip);
  if (!result.ok) {
    throw result;
  }

  return result.profile;
}
