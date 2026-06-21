const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function oddsValue(game) {
  return Number(String(game.overallOdds || "").match(/[\d.]+$/)?.[0] || 99);
}

function priceBands(games) {
  return [
    ["Micro", (game) => game.price <= 2],
    ["Core", (game) => game.price >= 3 && game.price <= 10],
    ["Premium", (game) => game.price > 10],
  ].map(([label, predicate]) => {
    const items = games.filter(predicate);
    const average = items.length ? Math.round(items.reduce((sum, game) => sum + game.intelligence.score, 0) / items.length) : 0;
    const top = [...items].sort((a, b) => b.intelligence.score - a.intelligence.score)[0];
    return { label, count: items.length, average, top };
  });
}

function scatterPlot(games) {
  const maxPrice = Math.max(...games.map((game) => game.price), 1);
  return `<svg class="analyticsScatter" viewBox="0 0 640 310" role="img" aria-label="Ticket score by price scatter plot">
    <defs><linearGradient id="scatter-bg" x1="0" x2="1"><stop stop-color="#daf4f7"/><stop offset="1" stop-color="#fff1d4"/></linearGradient></defs>
    <rect x="42" y="18" width="574" height="252" rx="22" fill="url(#scatter-bg)" opacity=".48"/>
    ${[50, 60, 70, 80, 90].map((score) => {
      const y = 270 - ((score - 40) / 60) * 235;
      return `<path d="M52 ${y}H606" stroke="currentColor" opacity=".09"/><text x="18" y="${y + 4}" fill="currentColor" opacity=".45" font-size="10">${score}</text>`;
    }).join("")}
    ${games.map((game) => {
      const x = 60 + (game.price / maxPrice) * 525;
      const y = 270 - ((game.intelligence.score - 40) / 60) * 235;
      const radius = Math.max(7, Math.min(18, 7 + game.intelligence.topPrizesRemaining));
      return `<g class="scatterPoint" data-analytics-game="${game.id}" tabindex="0" role="button" aria-label="${game.name}, score ${game.intelligence.score}, price $${game.price}">
        <circle cx="${x}" cy="${y}" r="${radius + 5}" fill="rgba(255,255,255,.75)"/>
        <circle cx="${x}" cy="${y}" r="${radius}" fill="${game.intelligence.trend === "Rising" ? "#13a7a3" : game.intelligence.trend === "Cooling" ? "#d28d45" : "#258bac"}"/>
        <text x="${x}" y="${y + 3}" text-anchor="middle" fill="white" font-size="8" font-weight="800">${game.intelligence.score}</text>
        <title>${game.name}: score ${game.intelligence.score}, $${game.price}</title>
      </g>`;
    }).join("")}
    <text x="285" y="300" fill="currentColor" opacity=".5" font-size="10">Ticket price →</text>
  </svg>`;
}

function releaseTimeline(games) {
  return [...games]
    .filter((game) => game.launchDate)
    .sort((a, b) => String(b.launchDate).localeCompare(String(a.launchDate)))
    .slice(0, 8)
    .map((game) => `<button type="button" data-analytics-game="${game.id}">
      <time>${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${game.launchDate}T00:00:00`))}</time>
      <i></i>
      <span><strong>${game.name}</strong><small>$${game.price} · Score ${game.intelligence.score}</small></span>
    </button>`).join("");
}

export function AnalyticsWorkbench(games, watchlistIds = [], winners = [], drawSnapshot = {}) {
  const watched = games.filter((game) => watchlistIds.includes(game.id));
  const strongest = [...games].sort((a, b) => b.intelligence.score - a.intelligence.score)[0];
  const healthiest = [...games].sort((a, b) => b.intelligence.prizeHealthScore - a.intelligence.prizeHealthScore).slice(0, 5);
  const averageScore = Math.round(games.reduce((sum, game) => sum + game.intelligence.score, 0) / Math.max(1, games.length));
  const averageOdds = games.reduce((sum, game) => sum + oddsValue(game), 0) / Math.max(1, games.length);
  const confidence = Math.round(games.reduce((sum, game) => sum + game.intelligence.confidenceScore, 0) / Math.max(1, games.length));
  const bands = priceBands(games);
  const frontier = [...games]
    .filter((game) => game.intelligence.topPrizesRemaining > 0)
    .sort((a, b) => b.intelligence.bestBuyScore - a.intelligence.bestBuyScore)
    .slice(0, 4);
  const watchedValue = watched.reduce((sum, game) => sum + game.price, 0);
  return `<section class="analyticsWorkbench" aria-labelledby="analytics-workbench-title">
    <header class="analyticsHero">
      <div><span>Intelligence workbench</span><h1 id="analytics-workbench-title">See the whole field.</h1><p>Explore relative score, price, prize health, freshness, and your saved research without implying predictive advantage.</p></div>
      <div class="analyticsHeroStats">
        <article><strong>${averageScore}</strong><span>Average score</span></article>
        <article><strong>1:${averageOdds.toFixed(2)}</strong><span>Average odds</span></article>
        <article><strong>${confidence}%</strong><span>Data confidence</span></article>
        <article><strong>${drawSnapshot.stats?.trackedGames || 0}</strong><span>Draw games</span></article>
      </div>
    </header>
    <div class="analyticsDashboardGrid">
      <section class="analyticsPanel scatterPanel">
        <div class="analyticsPanelHead"><div><span>Market map</span><h2>Score × ticket price</h2></div><small>Tap any point to inspect</small></div>
        ${scatterPlot(games)}
      </section>
      <section class="analyticsPanel priceBandPanel">
        <div class="analyticsPanelHead"><div><span>Value frontier</span><h2>Balanced opportunities</h2></div><small>Relative indices</small></div>
        <div class="frontierGrid">${frontier.map((game, index) => `<button type="button" data-analytics-game="${game.id}">
          <img src="${game.imageUrl}" alt="">
          <span><small>${String(index + 1).padStart(2, "0")} &middot; $${game.price}</small><strong>${game.name}</strong><i><b style="width:${game.intelligence.bestBuyScore}%"></b></i></span>
          <em>${game.intelligence.bestBuyScore}</em>
        </button>`).join("")}</div>
        <div class="priceBandChips">${bands.map((band) => `<span><b>${band.average}</b>${band.label} avg</span>`).join("")}</div>
      </section>
      <section class="analyticsPanel healthPanel">
        <div class="analyticsPanelHead"><div><span>Prize depth</span><h2>Health leaderboard</h2></div><small>Displayed tiers only</small></div>
        <div class="healthLeaderboard">${healthiest.map((game, index) => `<button type="button" data-analytics-game="${game.id}">
          <b>${String(index + 1).padStart(2, "0")}</b>
          <span><strong>${game.name}</strong><small>${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes</small></span>
          <i><u style="width:${game.intelligence.prizeHealthScore}%"></u></i>
          <em>${game.intelligence.prizeHealthScore}</em>
        </button>`).join("")}</div>
      </section>
      <section class="analyticsPanel portfolioPanel">
        <div class="analyticsPanelHead"><div><span>Saved portfolio</span><h2>Your research exposure</h2></div><button type="button" data-nav="saved">Open saved</button></div>
        <div class="portfolioVisual" style="--portfolio:${Math.min(100, watched.length * 16)}%">
          <div><strong>${watched.length}</strong><span>watched tickets</span></div>
          <article><span>Ticket face value</span><strong>${money.format(watchedValue)}</strong></article>
          <article><span>Strongest saved</span><strong>${watched.sort((a, b) => b.intelligence.score - a.intelligence.score)[0]?.name || "None yet"}</strong></article>
          <article><span>Field leader</span><strong>${strongest?.name || "Unavailable"}</strong></article>
        </div>
      </section>
      <section class="analyticsPanel timelinePanel">
        <div class="analyticsPanelHead"><div><span>Release ribbon</span><h2>Newest cached games</h2></div></div>
        <div class="releaseTimeline">${releaseTimeline(games)}</div>
      </section>
      <section class="analyticsPanel qualityPanel">
        <div class="analyticsPanelHead"><div><span>Source coverage</span><h2>Data quality matrix</h2></div><small>${winners.length} winner records</small></div>
        <div class="qualityMatrix">
          ${[
            ["Official game links", games.filter((game) => game.sourceUrl).length / games.length * 100],
            ["Launch dates", games.filter((game) => game.launchDate).length / games.length * 100],
            ["Prize ladders", games.filter((game) => game.prizeTiers?.length).length / games.length * 100],
            ["High confidence", games.filter((game) => game.intelligence.confidenceScore >= 85).length / games.length * 100],
          ].map(([label, value]) => `<article><div><span>${label}</span><strong>${Math.round(value)}%</strong></div><i><b style="width:${value}%"></b></i></article>`).join("")}
        </div>
      </section>
    </div>
  </section>`;
}
