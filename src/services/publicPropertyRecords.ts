import type { OwnershipEntityType, PropertyTransaction } from "./realEstateIntelligence";

export type PublicPropertyRecord = {
  id: string;
  pin: string;
  folio: string;
  streetAddress: string;
  ownerName: string;
  ownerMailingAddress: string;
  entityType: OwnershipEntityType;
  ownerOccupied: boolean;
  institutionalOwner: boolean;
  privateEquityOwner: boolean;
  institutionalBrand?: string;
  institutionalTooltip?: string;
  marketValue: number;
  assessedValue: number;
  taxableValue: number;
  saleDate: string | null;
  salePrice: number;
  yearBuilt: number;
  squareFeet: number;
  grossSquareFeet: number;
  bedrooms: number;
  bathrooms: number;
  landUse: string;
  propertyUseCode: string;
  sourceName: string;
  sourceUrl: string;
  taxCollectorUrl: string | null;
  transactions: Array<PropertyTransaction & {
    documentNumber?: string;
    qualified?: string;
    vacantOrImproved?: string;
  }>;
};

export type PublicPropertyRecordsResult = {
  ok: boolean;
  zip: string;
  sourceName: string;
  sourceUrl: string;
  medianHomeValue?: number;
  valueBand?: {
    low: number;
    high: number;
  };
  records: PublicPropertyRecord[];
  note?: string;
  error?: string;
};

export async function fetchPublicPropertyRecords(zip: string, medianHomeValue: number | null): Promise<PublicPropertyRecordsResult> {
  const params = new URLSearchParams({ zip });
  if (medianHomeValue !== null) params.set("medianHomeValue", String(medianHomeValue));

  const response = await fetch(`/api/real-estate-records?${params.toString()}`);
  if (!response.ok) throw new Error("Unable to fetch public property records.");
  return response.json();
}
