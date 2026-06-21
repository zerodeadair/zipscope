const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function oddsNumber(game) {
  return Number(String(game.overallOdds || "").match(/[\d.]+$/)?.[0] || 99);
}

function researchBasket(games, budget) {
  const ranked = [...games]
    .filter((game) => game.intelligence.topPrizesRemaining > 0 && game.price <= budget)
    .sort((a, b) => {
      const aEfficiency = a.intelligence.bestBuyScore + a.intelligence.valueScore * .35 - a.intelligence.riskScore * .15;
      const bEfficiency = b.intelligence.bestBuyScore + b.intelligence.valueScore * .35 - b.intelligence.riskScore * .15;
      return bEfficiency - aEfficiency || a.price - b.price;
    });
  const basket = [];
  let total = 0;
  for (const game of ranked) {
    if (basket.length >= 4) break;
    if (total + game.price > budget) continue;
    basket.push(game);
    total += game.price;
  }
  if (!basket.length && ranked[0]) {
    basket.push(ranked[0]);
    total = ranked[0].price;
  }
  return { games: basket, total };
}

function metric(label, value, tone = "") {
  return `<span class="${tone}"><small>${label}</small><strong>${value}</strong><i><b style="width:${value}%"></b></i></span>`;
}

export function ValueOpportunityBoard(games, selectedBudget = 20, watchlistIds = []) {
  const budget = [10, 20, 30, 50].includes(Number(selectedBudget)) ? Number(selectedBudget) : 20;
  const eligible = games.filter((game) => game.intelligence.topPrizesRemaining > 0);
  const leader = [...eligible].sort((a, b) => b.intelligence.bestBuyScore - a.intelligence.bestBuyScore)[0] || games[0];
  const bestOdds = [...eligible].sort((a, b) => oddsNumber(a) - oddsNumber(b))[0] || leader;
  const healthiest = [...eligible].sort((a, b) => b.intelligence.prizeHealthScore - a.intelligence.prizeHealthScore)[0] || leader;
  const lowerRisk = [...eligible].sort((a, b) => a.intelligence.riskScore - b.intelligence.riskScore)[0] || leader;
  const basket = researchBasket(games, budget);
  const ids = basket.games.map((game) => game.id).join(",");
  return `<section class="valueOpportunityBoard" aria-labelledby="value-lens-title">
    <header class="valueBoardHeader">
      <div><span>Value lens</span><h2 id="value-lens-title">Turn scores into a research shortlist.</h2></div>
      <p>Price-aware public-data comparisons only. This does not improve lottery odds.</p>
    </header>
    <div class="valueBoardGrid">
      <article class="valueLead" data-open-detail="${leader.id}">
        <div class="valueLeadArt">
          <img src="${leader.imageUrl}" alt="${leader.name} scratch-off ticket">
          <b>$${leader.price}</b>
          <span>${leader.intelligence.bestBuyScore}<small>Best Buy</small></span>
        </div>
        <div class="valueLeadCopy">
          <em>Best balanced profile</em>
          <h3>${leader.name}</h3>
          <p>${leader.intelligence.topPrizesRemaining}/${leader.intelligence.originalTopPrizes} top prizes visible, ${leader.overallOdds} overall odds, and ${leader.intelligence.confidenceScore}% data confidence.</p>
          <div class="valueMetricGrid">
            ${metric("Value", leader.intelligence.valueScore, "value")}
            ${metric("Prize health", leader.intelligence.prizeHealthScore, "health")}
            ${metric("Lower risk", 100 - leader.intelligence.riskScore, "risk")}
          </div>
          <button type="button" data-open-detail="${leader.id}">Inspect full profile</button>
        </div>
      </article>
      <section class="researchBasket" aria-labelledby="research-basket-title">
        <div class="basketTop">
          <div><span>Budget sandbox</span><h3 id="research-basket-title">${money.format(budget)} research basket</h3></div>
          <div class="budgetTabs" role="group" aria-label="Research basket budget">
            ${[10, 20, 30, 50].map((value) => `<button type="button" class="${budget === value ? "active" : ""}" data-value-budget="${value}" aria-pressed="${budget === value}">$${value}</button>`).join("")}
          </div>
        </div>
        <div class="basketGames">
          ${basket.games.map((game) => `<button type="button" data-open-detail="${game.id}">
            <img src="${game.imageUrl}" alt="">
            <span><strong>${game.name}</strong><small>$${game.price} &middot; Buy ${game.intelligence.bestBuyScore} &middot; Health ${game.intelligence.prizeHealthScore}</small></span>
            <b>${game.intelligence.score}</b>
          </button>`).join("")}
        </div>
        <div class="basketFooter">
          <span><strong>${money.format(basket.total)}</strong> of ${money.format(budget)} represented</span>
          <button type="button" data-value-compare-all="${ids}" ${basket.games.length ? "" : "disabled"}>Compare basket</button>
        </div>
      </section>
    </div>
    <div class="valueSignalStrip">
      <button type="button" data-open-detail="${bestOdds.id}"><span>Best displayed odds</span><strong>${bestOdds.name}</strong><small>${bestOdds.overallOdds}</small></button>
      <button type="button" data-open-detail="${healthiest.id}"><span>Prize depth leader</span><strong>${healthiest.name}</strong><small>${healthiest.intelligence.prizeHealthScore}/100 health</small></button>
      <button type="button" data-open-detail="${lowerRisk.id}"><span>Lowest modeled risk</span><strong>${lowerRisk.name}</strong><small>${lowerRisk.intelligence.riskScore}/100 risk index</small></button>
      <article><span>Your watchlist</span><strong>${watchlistIds.length} ticket${watchlistIds.length === 1 ? "" : "s"}</strong><small>Private and stored locally</small></article>
    </div>
  </section>`;
}
