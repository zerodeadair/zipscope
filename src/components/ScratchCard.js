import { DataFreshnessBadge } from "./DataFreshnessBadge.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function releaseDate(game) {
  if (!game.launchDate) return "Release date pending";
  const date = new Date(`${game.launchDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Release date pending" : `Released ${dateFormat.format(date)}`;
}

export function ScratchCard(game, selected, watched = false, favorite = false) {
  const topRemaining = game.intelligence.topPrizesRemaining;
  const topTotal = game.intelligence.originalTopPrizes;
  const statusClass = game.isCurrentRelease ? "status-new" : `status-${String(game.status || "active").toLowerCase().replace(/\s+/g, "-")}`;
  const score = Number(game.intelligence.score) || 0;
  const freshness = game.dataState === "Official cached" || game.dataState === "Fresh" ? game.intelligence.confidenceScore : Math.round(game.intelligence.confidenceScore * .62);
  const value = game.intelligence.bestBuyScore;
  const health = game.intelligence.prizeHealthScore;
  const rarityClass = score >= 88 ? "rarity-jackpot" : score >= 78 ? "rarity-premium" : score >= 68 ? "rarity-strong" : "rarity-standard";
  const trendSymbol = game.intelligence.trend === "Rising" ? "&nearr;" : game.intelligence.trend === "Cooling" ? "&searr;" : "&rarr;";
  const labels = [
    game.isCurrentRelease ? "New Game" : "",
    score >= 82 ? "Hot Ticket" : "",
    topRemaining >= Math.max(2, Math.ceil(topTotal * .6)) ? "High Prize Left" : "",
    game.intelligence.valueRating === "High" || score >= 76 ? "Smart Pick" : "",
  ].filter(Boolean).slice(0, 3);
  return `<article class="scratchCard ${statusClass} ${rarityClass} ${selected ? "selected" : ""} ${watched ? "watched" : ""} ${favorite ? "favorite" : ""}" data-detail="${game.id}" tabindex="0" role="button" aria-label="Inspect ${game.name}, score ${score}, ${topRemaining} of ${topTotal} top prizes visible" style="--score:${score}">
    ${selected ? `<div class="selectedRibbon">Selected for compare</div>` : ""}
    ${watched ? `<div class="watchRibbon">Saved</div>` : ""}
    <button type="button" class="ticketPin ${favorite ? "active" : ""}" data-favorite-ticket="${game.id}" aria-pressed="${favorite}" aria-label="${favorite ? "Unpin" : "Pin"} ${game.name}" title="${favorite ? "Unpin favorite" : "Pin favorite"}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 6 0 1 6 3 3H5l3-3 1-6Zm3 9v7"/></svg>
    </button>
    <div class="ticketFace imageFace">
      ${game.isCurrentRelease ? `<b class="newTicketRibbon">New</b>` : ""}
      <img src="${game.imageUrl}" alt="${game.name} scratch-off ticket" loading="lazy">
      <span>$${game.price}</span>
      <em>#${game.number}</em>
    </div>
    <div class="scratchBody">
      <div class="cardTitle"><h3>${game.name}</h3>${DataFreshnessBadge(game.dataState)}</div>
      <div class="releaseLine"><span>${releaseDate(game)}</span>${game.isCurrentRelease ? "<b>Current release</b>" : ""}</div>
      <div class="badgeRail">${labels.map((badge) => `<span>${badge}</span>`).join("")}</div>
      <div class="scoreLine"><strong>${game.intelligence.score}</strong><span>${game.intelligence.label}</span><em>${game.intelligence.confidenceScore}% confidence</em></div>
      <div class="cardIntelligenceStrip" aria-label="Ticket intelligence indicators">
        <span><i style="--signal:${value}%"></i><b>${value}</b><small>Buy</small></span>
        <span><i style="--signal:${health}%"></i><b>${health}</b><small>Health</small></span>
        <span><i style="--signal:${freshness}%"></i><b>${freshness}</b><small>Data</small></span>
        <span class="trend-${game.intelligence.trend.toLowerCase()}"><b>${trendSymbol}</b><small>${game.intelligence.trend}</small></span>
      </div>
      <div class="miniStats">
        <div><span>Top Prize</span><strong>${money.format(game.topPrizeAmount)}</strong></div>
        <div><span>Top Left</span><strong>${topRemaining}/${topTotal}</strong></div>
        <div><span>Odds</span><strong>${game.overallOdds}</strong></div>
      </div>
      <div class="meter"><i style="width:${Math.round(game.intelligence.topRatio * 100)}%"></i><span>${Math.round(game.intelligence.topRatio * 100)}% top-prize visibility</span></div>
      <details class="ticketDetails" data-stop>
        <summary>Details</summary>
        <p class="recommendationReason">${game.intelligence.summary}</p>
        <div class="signalRow"><span><b>${game.intelligence.valueRating}</b> value</span><span><b>${trendSymbol} ${game.intelligence.trend}</b> trend</span><span><b>${game.intelligence.displayedProfitPrizes.toLocaleString()}</b> profit prizes*</span></div>
      </details>
      <div class="cardActions">
        <button type="button" class="aiExplainButton" data-ai-explain="${game.id}" aria-label="Explain ${game.name} score with ScratchScope AI">AI Explain</button>
        <button type="button" class="${watched ? "watchActive" : ""}" data-watch-ticket="${game.id}" aria-label="${watched ? "Remove" : "Save"} ${game.name} ${watched ? "from" : "to"} watchlist">${watched ? "Saved" : "Save"}</button>
        <button type="button" data-compare="${game.id}" aria-label="${selected ? "Remove" : "Add"} ${game.name} from comparison">${selected ? "Remove" : "Compare"}</button>
        <button type="button" class="expandTicket" data-open-detail="${game.id}" aria-label="Expand ${game.name} intelligence">Expand</button>
        <a href="${game.sourceUrl}" target="_blank" rel="noreferrer" data-official-link aria-label="Open official NC Lottery source for ${game.name}">Official</a>
      </div>
      <small class="displayedTierNote">*Displayed cached tiers only.</small>
    </div>
  </article>`;
}
