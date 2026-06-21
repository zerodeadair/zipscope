const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function CompareGames(games) {
  if (!games.length) {
    return `<section class="panel emptyPanel"><h2>Compare Mode</h2><p>Select up to 5 games from the table to compare price, top prizes, odds, score, and verification state.</p></section>`;
  }
  const best = [...games].sort((a, b) => b.intelligence.score - a.intelligence.score)[0];
  return `<section class="panel comparePanel">
    <div class="panelHead"><div><p>Side-by-side research</p><h2>Compare Mode</h2></div><button type="button" data-clear-compare>Clear</button></div>
    <div class="compareGrid">${games.map((game) => `<article class="compareCard">
      <div class="compareTicket"><img src="${game.imageUrl}" alt="${game.name} ticket"><b>${game.intelligence.score}</b></div>
      <h3>${game.name}</h3>
      <p>${game.intelligence.label}</p>
      <div class="compareHeroStats">
        <div><span>Ticket</span><strong>$${game.price}</strong></div>
        <div><span>Odds</span><strong>${game.overallOdds}</strong></div>
        <div><span>Top Prize</span><strong>${money.format(game.topPrizeAmount)}</strong></div>
      </div>
      <div class="compareRatio"><i style="width:${Math.round(game.intelligence.topRatio * 100)}%"></i><span>${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes visible</span></div>
      <div class="compareRows">
        <div><span>Value signal</span><strong>${Math.round(game.intelligence.valuePerDollar * 100)}</strong></div>
        <div><span>Mid-tier depth</span><strong>${game.intelligence.midTierDepth.toLocaleString()}</strong></div>
        <div><span>Risk level</span><strong>${game.intelligence.risk}</strong></div>
        <div><span>Data state</span><strong>${game.dataState}</strong></div>
      </div>
      <a class="officialCompare" href="${game.sourceUrl}" target="_blank" rel="noreferrer">Official source</a>
    </article>`).join("")}</div>
    <div class="aiSummary"><strong>Score summary:</strong> ${best.name} currently has the strongest cached public-data score. Verify all compared games against the official NC Lottery prize table first.</div>
  </section>`;
}
