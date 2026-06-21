const zipCenters = {
  "27601": { city: "Raleigh", lat: 35.7796, lng: -78.6382 },
  "27617": { city: "Raleigh", lat: 35.9104, lng: -78.7833 },
  "27030": { city: "Mount Airy", lat: 36.4993, lng: -80.6073 },
  "28202": { city: "Charlotte", lat: 35.2271, lng: -80.8431 },
};

const zipPrefixes = {
  "270": { city: "Mount Airy area", lat: 36.4993, lng: -80.6073 },
  "271": { city: "Winston-Salem area", lat: 36.0999, lng: -80.2442 },
  "274": { city: "Greensboro area", lat: 36.0726, lng: -79.792 },
  "275": { city: "Triangle area", lat: 35.7796, lng: -78.6382 },
  "276": { city: "Raleigh area", lat: 35.7796, lng: -78.6382 },
  "277": { city: "Durham area", lat: 35.994, lng: -78.8986 },
  "280": { city: "Charlotte metro", lat: 35.2271, lng: -80.8431 },
  "281": { city: "Charlotte metro", lat: 35.2271, lng: -80.8431 },
  "282": { city: "Charlotte", lat: 35.2271, lng: -80.8431 },
  "283": { city: "Fayetteville area", lat: 35.0527, lng: -78.8784 },
  "284": { city: "Wilmington area", lat: 34.2104, lng: -77.8868 },
  "285": { city: "Eastern NC", lat: 35.1085, lng: -77.0441 },
  "286": { city: "Foothills area", lat: 35.7345, lng: -81.3445 },
  "287": { city: "Asheville area", lat: 35.5951, lng: -82.5515 },
  "288": { city: "Asheville", lat: 35.5951, lng: -82.5515 },
  "289": { city: "Western NC", lat: 35.0887, lng: -83.9582 },
};

export function getLocationProfile(zip) {
  const exact = zipCenters[zip];
  if (exact) return { ...exact, zip, precision: "ZIP center" };
  const regional = zipPrefixes[String(zip).slice(0, 3)];
  if (regional) return { ...regional, zip, precision: "Regional estimate" };
  return { city: "North Carolina", zip, precision: "Statewide view", lat: null, lng: null };
}

function milesBetween(a, b) {
  if (!a || !b) return null;
  const toRad = (value) => value * Math.PI / 180;
  const r = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * r * Math.asin(Math.sqrt(h)));
}

export function locationRecommendations(winners, zip) {
  const origin = getLocationProfile(zip);
  const byRetailer = new Map();
  for (const win of winners) {
    const key = `${win.retailer || win.retailerName}|${win.city || win.retailerCity}`;
    const item = byRetailer.get(key) || {
      name: win.retailer || win.retailerName,
      city: win.city || win.retailerCity,
      county: win.county,
      wins: 0,
      largestPrize: 0,
      recent: win.claimDate || win.date,
      address: win.address,
      sourceUrl: win.sourceUrl,
      lat: win.lat,
      lng: win.lng,
      games: new Set(),
    };
    item.wins += 1;
    item.largestPrize = Math.max(item.largestPrize, win.prizeAmount || win.prize || 0);
    item.games.add(win.gameName || win.game);
    byRetailer.set(key, item);
  }
  return [...byRetailer.values()].map((item) => ({
    ...item,
    games: [...item.games],
    distance: origin.lat && origin.lng ? milesBetween(origin, item) : null,
    confidence: item.lat && item.lng ? "Approximate" : "Low",
    why: "Appears in sourced public winner articles. Coordinates are approximate and past wins do not predict future results.",
  })).sort((a, b) => b.wins - a.wins || b.largestPrize - a.largestPrize);
}
