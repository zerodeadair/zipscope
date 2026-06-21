import { DataFreshnessBadge } from "./DataFreshnessBadge.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function normalizedName(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function escapeText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function latestMatchedWinner(game, winners) {
  const gameName = normalizedName(game.name);
  return [...winners]
    .filter((winner) => normalizedName(winner.game || winner.gameName) === gameName)
    .sort((a, b) => new Date(b.date || b.claimDate || 0) - new Date(a.date || a.claimDate || 0))[0];
}

export function GameDetailDrawer(game, watched = false, favorite = false, selected = false, winners = [], games = [], note = "") {
  if (!game) return "";
  const topRemaining = game.intelligence.topPrizesRemaining;
  const topTotal = game.intelligence.originalTopPrizes;
  const displayedRemaining = game.prizeTiers.reduce((sum, tier) => sum + tier.remaining, 0);
  const claimedTiers = game.prizeTiers.filter((tier) => tier.total > tier.remaining);
  const largestClaimedTier = claimedTiers.sort((a, b) => b.amount - a.amount)[0];
  const latestWinner = latestMatchedWinner(game, winners);
  const odds = Number(game.overallOdds.match(/[\d.]+$/)?.[0] || 99);
  const reward = Math.min(100, Math.round(Math.log10(game.topPrizeAmount || 1) * 14));
  const risk = Math.min(100, Math.round((odds / 6) * 100));
  const similar = games
    .filter((item) => item.id !== game.id)
    .sort((a, b) => {
      const aDistance = Math.abs(a.price - game.price) * 4 + Math.abs(a.intelligence.score - game.intelligence.score);
      const bDistance = Math.abs(b.price - game.price) * 4 + Math.abs(b.intelligence.score - game.intelligence.score);
      return aDistance - bDistance;
    })
    .slice(0, 3);
  return `<div class="drawerBackdrop" data-close>
    <section class="drawer" data-stop role="dialog" aria-modal="true" aria-labelledby="ticket-detail-title">
      <header class="drawerHeader">
        <div><p>Game #${game.number} &middot; ${game.dataState}</p><h2 id="ticket-detail-title">${game.name}</h2></div>
        <button class="iconBtn" data-close aria-label="Close ticket details">&times;</button>
      </header>
      <section class="detailAtGlance" aria-label="Ticket facts at a glance">
        <article class="fact-price"><span>Ticket Price</span><strong>${money.format(game.price)}</strong><small>Per ticket</small></article>
        <article class="fact-top-left"><span>Top Prizes Left</span><strong>${topRemaining}<i>/ ${topTotal}</i></strong><b class="factMeter"><u style="width:${Math.round(game.intelligence.topRatio * 100)}%"></u></b><small>${Math.round(game.intelligence.topRatio * 100)}% visible</small></article>
        <article class="fact-inventory"><span>Displayed Prizes Left</span><strong>${displayedRemaining.toLocaleString()}</strong><small>Across ${game.prizeTiers.length} cached tiers</small></article>
        <article class="fact-odds"><span>Overall Odds</span><strong>${game.overallOdds.replace("1 in ", "1:")}</strong><small>Published game odds</small></article>
        <article class="fact-winner ${latestWinner ? "has-winner" : ""}">
          <span>${latestWinner ? "Latest Matched Win" : "Largest Prize Claimed"}</span>
          <strong>${latestWinner ? money.format(latestWinner.prize || latestWinner.prizeAmount || 0) : largestClaimedTier ? money.format(largestClaimedTier.amount) : "None visible"}</strong>
          <small>${latestWinner ? `${latestWinner.date || latestWinner.claimDate} &middot; ${latestWinner.city || latestWinner.retailerCity || "NC"}` : largestClaimedTier ? `${(largestClaimedTier.total - largestClaimedTier.remaining).toLocaleString()} claimed in cached table` : "No claimed tier visible yet"}</small>
          ${latestWinner?.sourceUrl ? `<a href="${latestWinner.sourceUrl}" target="_blank" rel="noreferrer" data-official-link>Winner report</a>` : ""}
        </article>
      </section>
      ${latestWinner ? "" : `<div class="winnerDataNote"><strong>Winner history:</strong> No exact sourced winner article is linked to ${game.name} in the current cache.</div>`}
      <div class="detailGrid">
        <div class="largeTicket imageFace"><img src="${game.imageUrl}" alt="${game.name} scratch-off ticket"><span>$${game.price}</span><strong>${money.format(game.topPrizeAmount)}</strong><small>Official ticket artwork</small></div>
        <div class="scorePanel"><strong>${game.intelligence.score}</strong><span>${game.intelligence.label}</span>${DataFreshnessBadge(game.dataState)}<em>${game.intelligence.confidenceScore}% confidence</em><em>${topRemaining}/${topTotal} top prizes visible</em></div>
      </div>
      <div class="detailSignalRail">
        <span>${game.status || "Active"}</span>
        <span>${game.intelligence.trend} trend</span>
        <span>${game.intelligence.valueRating} value</span>
        <span>${topRemaining > 0 ? "Top prize visible" : "Verify top prize"}</span>
      </div>
      <section class="decisionBrief" aria-label="AI decision brief">
        <article><span>Why it is interesting</span><p>${game.intelligence.summary}</p></article>
        <article><span>Prize depth</span><p>${game.intelligence.prizeHealthScore}/100 across displayed cached tiers. This is a relative inventory signal, not expected value.</p></article>
        <article class="${game.intelligence.confidenceScore < 85 ? "warning" : ""}"><span>Freshness check</span><p>${game.dataState} with ${game.intelligence.confidenceScore}% confidence. Verify the official table before spending.</p></article>
      </section>
      <section class="detailNarrative">
        <div>
          <span>AI commentary</span>
          <h3>Why this game appears here</h3>
          <p>${game.intelligence.summary} The score reflects cached prize depth, ticket cost, published odds, and data quality. It is not a prediction of a winning ticket.</p>
        </div>
        <div class="movementRibbon" aria-label="Historical movement visualization">
          ${game.prizeTiers.slice(0, 7).map((tier, index) => {
            const remaining = tier.total ? Math.round((tier.remaining / tier.total) * 100) : 0;
            return `<i style="--movement:${remaining}%;--delay:${index}" title="${money.format(tier.amount)}: ${remaining}% remaining"><b></b></i>`;
          }).join("")}
        </div>
        <small>Visible prize-layer health from highest to lower cached tiers</small>
      </section>
      <div class="researchBox"><h3>Signal summary</h3><p>${game.intelligence.summary}</p></div>
      <section class="riskRewardPanel" aria-label="Risk versus reward preview">
        <div><span>Risk proxy</span><strong>${risk}</strong><i><b style="width:${risk}%"></b></i><small>Published overall odds and ticket cost</small></div>
        <div><span>Reward scale</span><strong>${reward}</strong><i><b style="width:${reward}%"></b></i><small>Advertised top prize and visible inventory</small></div>
      </section>
      <section class="intelligenceMetrics" aria-labelledby="metric-title">
        <div class="metricHeading"><div><span>Intelligence model</span><h3 id="metric-title">Ticket signal dashboard</h3></div><small>Relative research indices, not win probabilities</small></div>
        <div class="metricGrid">${game.intelligence.metrics.map((metric) => `<article class="metricCard metric-${metric.tone}">
          <div class="metricRing" style="--metric:${metric.value}"><strong>${metric.value}</strong></div>
          <div><span>${metric.label}</span><small>${metric.inverse ? "Lower is generally safer" : "Higher is a stronger cached-data signal"}</small></div>
        </article>`).join("")}</div>
        <p class="metricDisclosure">EV Proxy is a comparative index built from displayed prize tiers, ticket cost, odds, and remaining inventory. It is not a true expected-value calculation because the cached table may omit lower prize tiers.</p>
      </section>
      <details class="detailDisclosure" open>
        <summary>Why this score?</summary>
        <div class="explainBox">${game.intelligence.reasons.map((reason) => `<p>${reason}</p>`).join("")}</div>
      </details>
      <section class="prizeQualityPanel" aria-label="Displayed prize quality">
        <div><span>Profit prizes remaining*</span><strong>${game.intelligence.displayedProfitPrizes.toLocaleString()}</strong><small>${game.intelligence.displayedProfitTierCount} displayed tiers above the $${game.price} ticket cost</small></div>
        <div><span>Break-even prizes*</span><strong>${game.intelligence.displayedBreakEvenPrizes.toLocaleString()}</strong><small>${game.intelligence.displayedBreakEvenTierCount} displayed tiers equal to ticket cost</small></div>
        <div><span>Profit share*</span><strong>${Math.round(game.intelligence.displayedProfitShare * 100)}%</strong><small>Share of remaining prizes in the displayed table that exceed ticket cost</small></div>
      </section>
      <section class="prizeDepthEngine" aria-label="Prize depth engine">
        <div class="metricHeading"><div><span>Prize depth engine</span><h3>Remaining prize layers</h3></div><small>Cached displayed tiers</small></div>
        <div class="prizeDepthStack">${game.prizeTiers.map((tier) => {
          const remaining = tier.total ? Math.round((tier.remaining / tier.total) * 100) : 0;
          const health = remaining >= 70 ? "healthy" : remaining >= 35 ? "watch" : "thin";
          return `<article class="${health}"><div><strong>${money.format(tier.amount)}</strong><span>${tier.remaining.toLocaleString()} of ${tier.total.toLocaleString()} visible</span></div><i><b style="width:${remaining}%"></b></i><em>${remaining}%</em></article>`;
        }).join("")}</div>
      </section>
      <details class="detailDisclosure">
        <summary>Prize ladder</summary>
        <table class="prizeTable">
          <thead><tr><th>Prize Tier</th><th>Original</th><th>Remaining</th></tr></thead>
          <tbody>${game.prizeTiers.map((tier) => `<tr><td>${money.format(tier.amount)}</td><td>${tier.total}</td><td>${tier.remaining}</td></tr>`).join("")}</tbody>
        </table>
      </details>
      <p class="displayedTierDisclosure">*Displayed-tier analysis is not the game's complete payout percentage or expected value. Lower prize tiers may be absent from the cached table.</p>
      <div class="guardrailBox">Lottery outcomes are random. This view organizes public-data fields only and does not predict or improve odds. Verify the official NC Lottery page before buying.</div>
      ${similar.length ? `<section class="similarGames"><div class="metricHeading"><div><span>Similar games</span><h3>Continue exploring</h3></div></div>${similar.map((item) => `<button type="button" data-open-detail="${item.id}"><strong>${item.name}</strong><span>$${item.price} · Score ${item.intelligence.score}</span></button>`).join("")}</section>` : ""}
      <section class="ticketNotes" aria-labelledby="ticket-note-title">
        <div class="metricHeading"><div><span>Private workspace</span><h3 id="ticket-note-title">Research note</h3></div><small>Stored only on this device</small></div>
        <textarea data-ticket-note="${game.id}" maxlength="600" placeholder="Add a reminder, question, or official detail to verify...">${escapeText(note)}</textarea>
        <div><span>${note ? "Note saved locally" : "No note saved yet"}</span><button type="button" data-save-ticket-note="${game.id}">Save Note</button></div>
      </section>
      <div class="drawerActions">
        <button class="secondaryBtn ${favorite ? "active" : ""}" type="button" data-favorite-ticket="${game.id}">${favorite ? "Pinned" : "Pin Favorite"}</button>
        <button class="secondaryBtn ${watched ? "active" : ""}" type="button" data-watch-ticket="${game.id}">${watched ? "On Watchlist" : "Add to Watchlist"}</button>
        <button class="secondaryBtn ${selected ? "active" : ""}" type="button" data-compare="${game.id}">${selected ? "Remove Compare" : "Compare"}</button>
        <button class="secondaryBtn" type="button" data-section-jump=".similarGames">Show Similar</button>
        <button class="primaryBtn aiExplainButton" type="button" data-ai-explain="${game.id}">Explain Score</button>
        <a class="primaryBtn" href="${game.sourceUrl}" target="_blank" rel="noreferrer">Verify Official</a>
      </div>
    </section>
  </div>`;
}
