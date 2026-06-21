const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function retailerLabel(winner) {
  return winner.retailer || winner.retailerName || "Retailer location pending";
}

function locationLabel(winner) {
  const city = winner.retailerCity || winner.city || winner.winnerCity || "NC";
  return `${city}${winner.county ? `, ${winner.county}` : ""}`;
}

export function WinningLocationsMap(winners) {
  const totalPrize = winners.reduce((sum, winner) => sum + (winner.prize || winner.prizeAmount || 0), 0);
  const topWinner = [...winners].sort((a, b) => (b.prize || b.prizeAmount || 0) - (a.prize || a.prizeAmount || 0))[0];
  const storeLevel = winners.filter((winner) => winner.geocodeLevel === "retailer" || winner.address).length;

  return `<section class="mapPanel">
    <div class="panelHead mapHead">
      <div><p>Retailer sold-location map</p><h2>Winning Locations</h2></div>
      <span>${storeLevel ? "Store-level signals" : "City/county level"}</span>
    </div>
    <div class="mapSummary">
      <article><span>Signals</span><strong>${winners.length}</strong></article>
      <article><span>Prize Volume</span><strong>${money.format(totalPrize)}</strong></article>
      <article><span>Largest Signal</span><strong>${topWinner ? retailerLabel(topWinner) : "N/A"}</strong></article>
    </div>
    <div id="winnerLeafletMap" class="realWinnerMap" data-map-state="loading">
      <div class="mapLoading">Loading live map tiles...</div>
    </div>
    <div class="winnerList realWinnerList">${winners.map((winner) => {
      const amount = winner.prize || winner.prizeAmount || 0;
      return `<article>
        <strong>${retailerLabel(winner)}</strong>
        <span>${money.format(amount)} - ${winner.game || "Scratch-off winner"}</span>
        <small>${winner.address || locationLabel(winner)}. ${winner.geocodeLevel === "retailer" ? "Approximate store-sold location." : "City/county signal only."}</small>
      </article>`;
    }).join("")}</div>
  </section>`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      if (window.L) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function ensureLeafletCss() {
  if (document.querySelector('link[data-leaflet-css="true"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  link.dataset.leafletCss = "true";
  document.head.appendChild(link);
}

function markerHtml(winner) {
  const amount = winner.prize || winner.prizeAmount || 0;
  return `<div class="storeMarker"><b>${money.format(amount)}</b></div>`;
}

export async function initWinningLocationsMap(winners) {
  const container = document.querySelector("#winnerLeafletMap");
  if (!container) return;
  if (container.dataset.initialized === "true") return;
  container.dataset.initialized = "true";

  try {
    ensureLeafletCss();
    await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
    const L = window.L;
    if (!L) throw new Error("Leaflet unavailable");

    const map = L.map(container, {
      attributionControl: true,
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([35.45, -79.55], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const bounds = [];
    winners.forEach((winner) => {
      if (!Number.isFinite(winner.lat) || !Number.isFinite(winner.lng)) return;
      const amount = winner.prize || winner.prizeAmount || 0;
      const icon = L.divIcon({
        className: "storeMarkerWrap",
        html: markerHtml(winner),
        iconSize: [54, 54],
        iconAnchor: [27, 27],
      });
      L.marker([winner.lat, winner.lng], { icon }).addTo(map).bindPopup(`
        <strong>${retailerLabel(winner)}</strong><br>
        ${winner.address || locationLabel(winner)}<br>
        ${money.format(amount)} - ${winner.game || "Scratch-off winner"}<br>
        <small>${winner.geocodeLevel === "retailer" ? "Approximate store-sold location" : "Approximate city/county location"}</small>
      `);
      bounds.push([winner.lat, winner.lng]);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [34, 34], maxZoom: 8 });
    container.dataset.mapState = "ready";
    setTimeout(() => map.invalidateSize(), 80);
  } catch {
    container.dataset.mapState = "failed";
    container.innerHTML = `<div class="mapLoading">Map tiles could not load. Store-sold location data is still listed below.</div>`;
  }
}
