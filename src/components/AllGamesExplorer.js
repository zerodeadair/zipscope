const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function searchText(game, type) {
  if (type === "draw") {
    return `${game.gameName} draw game ${game.ticketPrice} ${game.jackpotLabel || game.jackpotAmount} ${game.status} ${game.drawDays?.join(" ")}`.toLowerCase();
  }
  return `${game.name} ${game.number} ${game.price} ${game.topPrizeText} ${game.topPrizeAmount} ${game.status} ${game.intelligence.trend} ${game.dataState}`.toLowerCase();
}

function filterScratch(game, filter, watchlist, favorites, recent) {
  if (filter.startsWith("price-")) return game.price === Number(filter.replace("price-", ""));
  if (filter === "new") return game.isCurrentRelease;
  if (filter === "hot") return game.intelligence.trendScore >= 65;
  if (filter === "ending") return game.status === "ending soon";
  if (filter === "top-prizes") return game.intelligence.topPrizesRemaining > 0;
  if (filter === "prize-depth") return game.intelligence.prizeHealthScore >= 80;
  if (filter === "top-left") return game.intelligence.topPrizesRemaining >= 2;
  if (filter === "updated") return game.intelligence.confidenceScore >= 85;
  if (filter === "watched") return watchlist.includes(game.id);
  if (filter === "favorites") return favorites.includes(game.id);
  if (filter === "recent") return recent.includes(game.id);
  return true;
}

function scratchTile(game, watched, favorite) {
  return `<article class="libraryScratchCard" data-open-detail="${game.id}">
    <div class="libraryArt">
      <img src="${game.imageUrl}" alt="${game.name} scratch-off ticket">
      <b>$${game.price}</b><em>${game.intelligence.score}</em>
      ${game.isCurrentRelease ? "<span>New</span>" : ""}
    </div>
    <div class="libraryCardCopy">
      <small>Game #${game.number} &middot; ${game.intelligence.trend}</small>
      <h3>${game.name}</h3>
      <div><span>Top prize<strong>${money.format(game.topPrizeAmount)}</strong></span><span>Top left<strong>${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes}</strong></span><span>Odds<strong>${game.overallOdds}</strong></span></div>
      <i><b style="width:${game.intelligence.prizeHealthScore}%"></b></i>
      <footer>
        <button type="button" class="${watched ? "active" : ""}" data-watch-ticket="${game.id}">${watched ? "Watching" : "Watch"}</button>
        <button type="button" data-compare="${game.id}">Compare</button>
        <button type="button" class="${favorite ? "active" : ""}" data-favorite-ticket="${game.id}">${favorite ? "Pinned" : "Pin"}</button>
        <button type="button" data-open-detail="${game.id}">Details</button>
      </footer>
    </div>
  </article>`;
}

function drawTile(game, watched) {
  return `<article class="libraryDrawCard" data-all-draw="${game.gameId}">
    <header><span>Draw game</span><b>${game.intelligence.overallWatchScore}</b></header>
    <div class="drawOrb"><strong>${game.intelligence.jackpotDisplay}</strong><span>${game.gameName}</span></div>
    <div class="libraryDrawFacts"><span>Ticket<strong>${money.format(game.ticketPrice)}</strong></span><span>Next draw<strong>${game.nextDrawDate ? dateFormat.format(new Date(game.nextDrawDate)) : "Verify"}</strong></span><span>Top odds<strong>${game.oddsJackpot}</strong></span></div>
    <footer><button type="button" class="${watched ? "active" : ""}" data-watch-draw="${game.gameId}">${watched ? "Watching" : "Watch"}</button><button type="button" data-all-draw="${game.gameId}">Open Center</button></footer>
  </article>`;
}

export function AllGamesExplorer({ scratchGames = [], drawGames = [], query = "", filter = "all", watchlist = [], favorites = [], recent = [], drawWatchlist = [] }) {
  const normalized = query.trim().toLowerCase();
  const scratch = scratchGames.filter((game) => filterScratch(game, filter, watchlist, favorites, recent) && (!normalized || searchText(game, "scratch").includes(normalized)));
  const includeDraws = !["new", "hot", "ending", "top-prizes", "prize-depth", "top-left", "updated", "watched", "favorites", "recent"].includes(filter) && !filter.startsWith("price-");
  const draws = includeDraws ? drawGames.filter((game) => !normalized || searchText(game, "draw").includes(normalized)) : [];
  const total = scratch.length + draws.length;
  const chips = [
    ["all", "All"], ["new", "New"], ["hot", "Hot"], ["ending", "Ending Soon"],
    ["price-1", "$1"], ["price-2", "$2"], ["price-3", "$3"], ["price-5", "$5"], ["price-10", "$10"],
    ["price-20", "$20"], ["price-30", "$30"], ["price-50", "$50"], ["top-prizes", "Top Prizes"],
    ["prize-depth", "Best Prize Depth"], ["top-left", "Most Top Prizes"], ["updated", "Recently Updated"],
    ["watched", "Most Watched"], ["favorites", "Most Favorited"], ["recent", "Recently Viewed"],
  ];
  return `<section class="allGamesExplorer" aria-labelledby="all-games-title">
    <header class="allGamesHero">
      <div><span>Complete lottery library</span><h1 id="all-games-title">All Games</h1><p>Browse every active scratch-off and supported draw game without hidden pagination.</p></div>
      <div class="allGamesCounts"><article><strong>${scratchGames.length}</strong><span>Scratch-offs</span></article><article><strong>${drawGames.length}</strong><span>Draw games</span></article><article><strong>${total}</strong><span>Showing now</span></article></div>
      <button type="button" class="showAllHero" data-show-all>Show All</button>
    </header>
    <div class="libraryControls">
      <label><span>Search every game</span><input data-library-query value="${query}" placeholder="Name, game #, price, prize, status, or draw game" autocomplete="off"></label>
      <button type="button" data-show-all>Clear everything &middot; Show all</button>
    </div>
    <div class="libraryFilterRail" role="group" aria-label="All games filters">${chips.map(([value, label]) => `<button type="button" class="${filter === value ? "active" : ""}" data-library-filter="${value}" aria-pressed="${filter === value}">${label}</button>`).join("")}</div>
    ${total ? `<div class="gameLibraryGrid">
      ${scratch.map((game) => scratchTile(game, watchlist.includes(game.id), favorites.includes(game.id))).join("")}
      ${draws.map((game) => drawTile(game, drawWatchlist.includes(game.gameId))).join("")}
    </div>` : `<div class="libraryEmpty"><strong>No games match this view.</strong><span>Your saved games are untouched. Clear the temporary search and filters to restore the complete library.</span><button type="button" data-show-all>Show All Games</button></div>`}
  </section>`;
}

export function ActiveScratchDirectory(games = [], watchlist = [], favorites = []) {
  return `<section class="activeScratchDirectory" aria-labelledby="active-directory-title">
    <header><div><span>Master directory</span><h2 id="active-directory-title">Active Scratch-Offs</h2><p>Every active ticket in the cached official snapshot, independent of discovery filters.</p></div><button type="button" data-show-all>All Games</button></header>
    <div class="scratchDirectoryGrid">${games.map((game) => `<article data-open-detail="${game.id}">
      <img src="${game.imageUrl}" alt="${game.name} scratch-off ticket">
      <div class="directoryIdentity"><small>#${game.number} &middot; ${game.launchDate ? dateFormat.format(new Date(`${game.launchDate}T00:00:00`)) : "Launch pending"}</small><strong>${game.name}</strong><span>$${game.price} &middot; ${game.dataState} &middot; ${game.intelligence.trend}</span></div>
      <div class="directoryFacts"><span>Top Prize<b>${money.format(game.topPrizeAmount)}</b></span><span>Top Left<b>${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes}</b></span><span>Odds<b>${game.overallOdds}</b></span><span>Prize Depth<b>${game.intelligence.prizeHealthScore}</b></span></div>
      <div class="directoryActions"><button type="button" class="${watchlist.includes(game.id) ? "active" : ""}" data-watch-ticket="${game.id}">${watchlist.includes(game.id) ? "Watching" : "Watch"}</button><button type="button" data-compare="${game.id}">Compare</button><button type="button" class="${favorites.includes(game.id) ? "active" : ""}" data-favorite-ticket="${game.id}">${favorites.includes(game.id) ? "Pinned" : "Pin"}</button><button type="button" data-open-detail="${game.id}">Quick Details</button></div>
    </article>`).join("")}</div>
  </section>`;
}
