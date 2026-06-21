const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function HotZonePanel(zones) {
  return `<section class="panel">
    <div class="panelHead"><div><p>Sourced public winner articles</p><h2>Location History</h2></div><span>Not predictive</span></div>
    <div class="zoneGrid">
      ${zones.cities.slice(0, 4).map((zone) => `<article><strong>${zone.name}</strong><span>${zone.count} visible cluster record</span><small>Largest ${money.format(zone.largestPrize)}</small></article>`).join("")}
    </div>
    <p class="fine">These are public winner-density patterns only. They do not mean a location is more likely to produce future winners.</p>
  </section>`;
}
