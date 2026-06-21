import https from "node:https";

const HCPA_SEARCH_BASE = "https://gis.hcpafl.org/CommonServices/property/search";
const HCPA_REFERER = "https://gis.hcpafl.org/PropertySearch/";
const hcpaAgent = new https.Agent({ rejectUnauthorized: false });

const knownInstitutionalOwners = [
  { pattern: /INVITATION\s+HOMES/i, label: "Invitation Homes" },
  { pattern: /PROGRESS\s+RESIDENTIAL/i, label: "Progress Residential" },
  { pattern: /TRICON/i, label: "Tricon Residential" },
  { pattern: /AMERICAN\s+HOMES\s+4\s+RENT|AMH\s/i, label: "American Homes 4 Rent" },
  { pattern: /PRETIUM/i, label: "Pretium Partners" },
  { pattern: /BLACKSTONE/i, label: "Blackstone" },
  { pattern: /STARWOOD/i, label: "Starwood" },
  { pattern: /FIRSTKEY/i, label: "FirstKey Homes" },
  { pattern: /MAIN\s+STREET\s+RENEWAL/i, label: "Main Street Renewal" },
  { pattern: /HOME\s+PARTNERS\s+OF\s+AMERICA/i, label: "Home Partners of America" },
  { pattern: /AMHERST/i, label: "Amherst" },
  { pattern: /SFR|SINGLE\s+FAMILY\s+RENTAL/i, label: "Single-family rental operator" },
];

export default async function handler(request, response) {
  const zip = String(request.query.zip ?? "").replace(/\D/g, "");
  const medianHomeValue = Number(request.query.medianHomeValue);

  if (!/^\d{5}$/.test(zip)) {
    return response.status(400).json({ ok: false, error: "A valid 5-digit ZIP code is required." });
  }

  const baseValue = Number.isFinite(medianHomeValue) && medianHomeValue > 0 ? medianHomeValue : 500000;
  const low = Math.round(baseValue * 0.85);
  const high = Math.round(baseValue * 1.15);

  try {
    const searchRows = await fetchHillsboroughRows(zip, low, high);
    const residentialRows = searchRows
      .filter((row) => isResidentialLandUse(row.landUse))
      .slice(0, 16);
    const details = await Promise.all(residentialRows.map((row) => fetchHillsboroughParcel(row, baseValue)));
    const records = details
      .filter(Boolean)
      .sort((a, b) => Math.abs(a.marketValue - baseValue) - Math.abs(b.marketValue - baseValue))
      .slice(0, 12);

    return response.status(200).json({
      ok: true,
      zip,
      sourceName: "Hillsborough County Property Appraiser public records",
      sourceUrl: "https://gis.hcpafl.org/PropertySearch/",
      medianHomeValue: baseValue,
      valueBand: { low, high },
      records,
      note: records.length
        ? "Records are public parcel records matched by ZIP and market-value band. Sales history comes from the county parcel card when available."
        : "No Hillsborough County parcel records were returned for this ZIP/value band. This ZIP may be outside Hillsborough County or need another county adapter.",
    });
  } catch (error) {
    return response.status(200).json({
      ok: false,
      zip,
      sourceName: "Hillsborough County Property Appraiser public records",
      sourceUrl: "https://gis.hcpafl.org/PropertySearch/",
      records: [],
      error: error instanceof Error ? error.message : "Unable to retrieve public records.",
    });
  }
}

async function fetchHillsboroughRows(zip, low, high) {
  const params = new URLSearchParams({
    zip,
    mvlow: String(low),
    mvhigh: String(high),
    pagesize: "40",
    page: "1",
  });
  const payload = await fetchJson(`${HCPA_SEARCH_BASE}/AdvancedSearch?${params.toString()}`);
  return Array.isArray(payload) ? payload : [];
}

async function fetchHillsboroughParcel(row, medianHomeValue) {
  const payload = await fetchJson(`${HCPA_SEARCH_BASE}/ParcelData?pin=${encodeURIComponent(row.pin)}`);
  const valueSummary = Array.isArray(payload.valueSummary) ? payload.valueSummary[0] : null;
  const building = Array.isArray(payload.buildings) ? payload.buildings.find((entry) => !entry.noData) ?? payload.buildings[0] : null;
  const marketValue = Number(valueSummary?.marketVal ?? row.salePrice ?? medianHomeValue);
  const assessedValue = Number(valueSummary?.assessedVal ?? 0);
  const taxableValue = Number(valueSummary?.taxableVal ?? 0);
  const ownerName = cleanText(payload.owner ?? row.owner ?? "");
  const ownerClassification = classifyOwner(ownerName);
  const siteAddress = cleanText(payload.siteAddress ?? row.address ?? "");
  const mailingAddress = formatMailingAddress(payload.mailingAddress);
  const transactions = Array.isArray(payload.salesHistory)
    ? payload.salesHistory.map((sale, index, sales) => buildTransaction(row.pin, sale, index, sales))
    : [];

  return {
    id: row.pin,
    pin: row.pin,
    folio: payload.propertyCard?.displayFolio ?? row.displayFolio ?? row.folio,
    streetAddress: siteAddress || cleanText(row.address),
    ownerName,
    ownerMailingAddress: mailingAddress,
    entityType: ownerClassification.entityType,
    ownerOccupied: String(row.homestead ?? payload.propertyCard?.homestead ?? "").toUpperCase() === "YES",
    institutionalOwner: ownerClassification.institutionalOwner,
    privateEquityOwner: ownerClassification.privateEquityOwner,
    institutionalBrand: ownerClassification.institutionalBrand,
    institutionalTooltip: ownerClassification.tooltip,
    marketValue,
    assessedValue,
    taxableValue,
    saleDate: row.saleDate ?? payload.propertyCard?.topSaleDate ?? null,
    salePrice: Number(row.salePrice ?? payload.propertyCard?.topSalePrice ?? 0),
    yearBuilt: Number(building?.yearBuilt ?? 0),
    squareFeet: Number(building?.heatedArea ?? building?.grossArea ?? 0),
    grossSquareFeet: Number(building?.grossArea ?? 0),
    bedrooms: Number(building?.bedrooms ?? 0),
    bathrooms: Number(building?.bathrooms ?? 0),
    landUse: payload.landUse?.description ?? row.landUse,
    propertyUseCode: row.landUse,
    sourceName: "Hillsborough County Property Appraiser",
    sourceUrl: `https://gis.hcpafl.org/PropertySearch/#/parcel/advanced/${row.pin}`,
    taxCollectorUrl: payload.propertyCard?.folio ? `https://hillsborough.county-taxes.com/public/real_estate/parcels/A${payload.propertyCard.folio}` : null,
    transactions,
  };
}

function buildTransaction(pin, sale, index, sales) {
  const previous = sales[index + 1];
  const salePrice = Number(sale.salePrice ?? 0);
  const previousPrice = Number(previous?.salePrice ?? 0);
  return {
    id: `${pin}-official-sale-${sale.sequence ?? index}`,
    saleDate: sale.saleDate,
    salePrice,
    buyerName: "Current owner on parcel card",
    sellerName: "See official instrument",
    deedType: cleanText(sale.deedType) || "Recorded sale",
    transferAmount: salePrice,
    appreciationSincePreviousSale: previousPrice > 0 ? (salePrice - previousPrice) / previousPrice : null,
    yearsHeld: previous?.saleDate ? yearsBetween(previous.saleDate, sale.saleDate) : null,
    documentNumber: cleanText(sale.docnum),
    qualified: cleanText(sale.qualified),
    vacantOrImproved: cleanText(sale.vacOrImp),
  };
}

async function fetchJson(url) {
  const text = await new Promise((resolve, reject) => {
    const request = https.get(url, {
      agent: hcpaAgent,
      headers: {
        Accept: "application/json,text/javascript,*/*;q=0.01",
        Referer: HCPA_REFERER,
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 ZipScope public-records research adapter",
      },
    }, (result) => {
      let body = "";
      result.setEncoding("utf8");
      result.on("data", (chunk) => {
        body += chunk;
      });
      result.on("end", () => {
        if (!result.statusCode || result.statusCode < 200 || result.statusCode >= 300) {
          reject(new Error(`Public records request failed: ${result.statusCode}`));
          return;
        }
        resolve(body);
      });
    });
    request.on("error", reject);
    request.setTimeout(12000, () => {
      request.destroy(new Error("Public records request timed out."));
    });
  });
  return JSON.parse(text);
}

function isResidentialLandUse(landUse) {
  return /^(0100|0106|0200|0300|0400|0800)$/.test(String(landUse ?? "").trim());
}

function classifyOwner(ownerName) {
  const owner = ownerName.toUpperCase();
  const known = knownInstitutionalOwners.find((entry) => entry.pattern.test(ownerName));
  if (known) {
    return {
      entityType: /INVITATION|AMERICAN\s+HOMES|AMH/i.test(known.label) ? "REIT" : "Private Equity",
      institutionalOwner: true,
      privateEquityOwner: !/Invitation Homes|American Homes 4 Rent/i.test(known.label),
      institutionalBrand: known.label,
      tooltip: `${known.label} matched by public owner-name heuristic.`,
    };
  }
  if (/\bTRUST\b/.test(owner)) return { entityType: "Trust", institutionalOwner: false, privateEquityOwner: false };
  if (/\bLLC\b|L\.L\.C\.|LIMITED\s+LIABILITY/.test(owner)) return { entityType: "LLC", institutionalOwner: false, privateEquityOwner: false };
  if (/\bINC\b|\bCORP\b|CORPORATION|COMPANY|CO\./.test(owner)) return { entityType: "Corporation", institutionalOwner: false, privateEquityOwner: false };
  if (/COUNTY|CITY\s+OF|STATE\s+OF|UNITED\s+STATES|SCHOOL\s+BOARD/.test(owner)) return { entityType: "Government", institutionalOwner: false, privateEquityOwner: false };
  return { entityType: "Individual", institutionalOwner: false, privateEquityOwner: false };
}

function formatMailingAddress(address) {
  if (!address) return "";
  return [address.addr1, address.addr2, [address.city, address.state, address.zip].filter(Boolean).join(", ")]
    .filter(Boolean)
    .map(cleanText)
    .join(" ");
}

function cleanText(value) {
  return String(value ?? "").replace(/\s*;\s*/g, "; ").replace(/\s+/g, " ").trim();
}

function yearsBetween(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.max(0, Number(((endDate.getTime() - startDate.getTime()) / 31557600000).toFixed(1)));
}
