function commandIcon(icon) {
  const paths = {
    search: "M11 19a8 8 0 1 1 5.7-2.4L21 21",
    refresh: "M20 7v5h-5M4 17v-5h5M6.1 9a7 7 0 0 1 11.2-2.1L20 12M4 12l2.7 5.1A7 7 0 0 0 17.9 15",
    spark: "M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z",
    save: "M5 4h14v16l-7-4-7 4V4Z",
    export: "M12 3v12m-4-4 4 4 4-4M5 19h14",
    gauge: "M5 19a9 9 0 1 1 14 0M12 12l4-4",
    ticket: "M4 7a3 3 0 0 0 3-3h10a3 3 0 0 0 3 3v10a3 3 0 0 0-3 3H7a3 3 0 0 0-3-3V7Z",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[icon] || paths.spark}"/></svg>`;
}

export const commandItems = [
  { id: "show-all", label: "Show All Games", hint: "Clear temporary views and open the complete library", icon: "ticket", keys: "G" },
  { id: "active-scratch", label: "Show Active Scratch-Offs", hint: "Open the complete scratch-off directory", icon: "ticket", keys: "C" },
  { id: "draws", label: "Show Draw Games", hint: "Open the dedicated draw games center", icon: "ticket", keys: "D" },
  { id: "lottery-hub", label: "Open Lottery Hub", hint: "Universal game access dashboard", icon: "gauge", keys: "U" },
  { id: "search-games", label: "Search any game", hint: "Scratch-offs and draw games", icon: "search", keys: "/" },
  { id: "hot-games", label: "View hot games", hint: "Open trending intelligence", icon: "spark", keys: "H" },
  { id: "new-games", label: "View new games", hint: "Newest NC releases", icon: "ticket", keys: "N" },
  { id: "ending-games", label: "View ending games", hint: "Tickets nearing close", icon: "ticket", keys: "E" },
  { id: "value-lens", label: "Open Value Lens", hint: "Budget-aware research basket", icon: "gauge", keys: "V" },
  { id: "refresh", label: "Refresh data", hint: "Check cached official snapshot", icon: "refresh", keys: "R" },
  { id: "watchlist", label: "Open watchlist", hint: "Saved tickets and draws", icon: "save", keys: "W" },
  { id: "favorites", label: "Open favorites", hint: "Pinned research", icon: "save", keys: "F" },
  { id: "nearby", label: "Open nearby intelligence", hint: "Winner archive by ZIP", icon: "spark", keys: "L" },
  { id: "statistics", label: "Open statistics", hint: "Compare and source center", icon: "spark", keys: "S" },
  { id: "assistant", label: "Open AI assistant", hint: "Explain current signals", icon: "spark", keys: "A" },
  { id: "export", label: "Export dashboard", hint: "PNG, CSV, JSON or print", icon: "export", keys: "X" },
  { id: "gauge", label: "Toggle build gauge", hint: "Engineering estimate", icon: "gauge", keys: "B" },
  { id: "activity", label: "Open activity center", hint: "Recent local research actions", icon: "spark", keys: "Y" },
  { id: "settings", label: "Display and accessibility", hint: "Density, type, contrast, and motion", icon: "gauge", keys: "," },
];

function resultRows(query, games, recentIds, drawGames) {
  const normalized = query.trim().toLowerCase();
  const commands = commandItems.filter((item) => !normalized || `${item.label} ${item.hint}`.toLowerCase().includes(normalized));
  const recent = recentIds
    .map((id) => games.find((game) => game.id === id))
    .filter(Boolean)
    .slice(0, 4);
  const matchedGames = games
    .filter((game) => normalized && `${game.name} ${game.number} ${game.price} ${game.topPrizeText} ${game.status}`.toLowerCase().includes(normalized))
    .slice(0, 6);
  const matchedDraws = drawGames
    .filter((game) => normalized && `${game.gameName} ${game.ticketPrice} ${game.jackpotLabel || game.jackpotAmount} ${game.status}`.toLowerCase().includes(normalized))
    .slice(0, 5);

  return `
    ${!normalized && recent.length ? `<div class="commandGroup"><span>Recently viewed</span>${recent.map((game) => `
      <button type="button" class="commandResult gameResult" data-command-game="${game.id}">
        <img src="${game.imageUrl}" alt="">
        <span><strong>${game.name}</strong><small>$${game.price} · Score ${game.intelligence.score}</small></span>
        <kbd>Open</kbd>
      </button>`).join("")}</div>` : ""}
    ${commands.length ? `<div class="commandGroup"><span>Commands</span>${commands.map((item) => `
      <button type="button" class="commandResult" data-command-action="${item.id}">
        <i>${commandIcon(item.icon)}</i>
        <span><strong>${item.label}</strong><small>${item.hint}</small></span>
        <kbd>${item.keys}</kbd>
      </button>`).join("")}</div>` : ""}
    ${matchedGames.length ? `<div class="commandGroup"><span>Games</span>${matchedGames.map((game) => `
      <button type="button" class="commandResult gameResult" data-command-game="${game.id}">
        <img src="${game.imageUrl}" alt="">
        <span><strong>${game.name}</strong><small>$${game.price} · ${game.overallOdds} · ${game.intelligence.topPrizesRemaining} top prizes</small></span>
        <kbd>Open</kbd>
      </button>`).join("")}</div>` : ""}
    ${matchedDraws.length ? `<div class="commandGroup"><span>Draw Games</span>${matchedDraws.map((game) => `
      <button type="button" class="commandResult" data-command-draw="${game.gameId}">
        <i>${commandIcon("ticket")}</i>
        <span><strong>${game.gameName}</strong><small>${game.intelligence.jackpotDisplay} &middot; $${game.ticketPrice} ticket</small></span>
        <kbd>Open</kbd>
      </button>`).join("")}</div>` : ""}
    ${!commands.length && !matchedGames.length && !matchedDraws.length ? `<div class="commandEmpty"><strong>No exact match.</strong><span>Try a game name, number, price, prize, status, or draw game.</span></div>` : ""}`;
}

export function CommandPalette(open, query, games, recentIds = [], drawGames = []) {
  if (!open) return "";
  return `<div class="commandBackdrop" data-command-close>
    <section class="commandPalette" data-command-stop role="dialog" aria-modal="true" aria-labelledby="command-title">
      <div class="commandSearch">
        ${commandIcon("search")}
        <input data-command-query value="${query}" placeholder="Search games, draws, views, or actions..." aria-label="Command palette search" autocomplete="off">
        <kbd>ESC</kbd>
      </div>
      <div class="commandHeader"><span id="command-title">ScratchScope Command Center</span><small>Navigate without leaving your train of thought</small></div>
      <div class="commandResults">${resultRows(query, games, recentIds, drawGames)}</div>
      <footer><span><kbd>↑↓</kbd> Browse</span><span><kbd>Enter</kbd> Open</span><span><kbd>Ctrl K</kbd> Toggle</span></footer>
    </section>
  </div>`;
}

export function FloatingCommandDock(counts = {}) {
  return `<aside class="floatingCommandDock" aria-label="Quick command center">
    <button type="button" class="dockAllGames" data-dock-action="show-all" data-tooltip="Show the complete game library and clear temporary filters." data-tooltip-side="top" aria-label="Show all games">${commandIcon("ticket")}<span>All Games</span></button>
    <button type="button" data-dock-action="active-scratch" data-tooltip="Open every active scratch-off in the current cached official snapshot." data-tooltip-side="top" aria-label="Show active scratch-offs">${commandIcon("ticket")}<span>Scratch-Offs</span></button>
    <button type="button" data-dock-action="draws" data-tooltip="Open draw schedules, jackpots, saved picks, and reminder information." data-tooltip-side="top" aria-label="Open draw games">${commandIcon("gauge")}<span>Draw Games</span></button>
    <button type="button" data-dock-action="watchlist" data-tooltip="Review tickets and draw games you are actively monitoring." data-tooltip-side="top" aria-label="Open watchlist">${commandIcon("save")}<span>Watchlist</span>${counts.watchlist ? `<b>${counts.watchlist}</b>` : ""}</button>
    <button type="button" data-dock-action="favorites" data-tooltip="Open your pinned ticket research and favorite game profiles." data-tooltip-side="top" aria-label="Open favorites">${commandIcon("save")}<span>Favorites</span>${counts.favorites ? `<b>${counts.favorites}</b>` : ""}</button>
    <button type="button" data-dock-action="assistant" data-tooltip="Ask for plain-English comparisons, freshness checks, odds explanations, and budget guidance." data-tooltip-side="top" aria-label="Open AI assistant">${commandIcon("spark")}<span>AI Insights</span></button>
    <button type="button" data-dock-action="gauge" data-tooltip="Open the project complexity, development-hours, confidence, and cost estimate." data-tooltip-side="top" aria-label="Open development hours gauge">${commandIcon("gauge")}<span>Dev Gauge</span></button>
    <button type="button" data-command-open data-tooltip="Search every ticket, draw game, view, and ScratchScope command." data-tooltip-side="top" aria-label="Search all games">${commandIcon("search")}<span>Search</span></button>
    <button type="button" data-dock-action="recent" data-tooltip="Return to the game profiles you viewed most recently." data-tooltip-side="top" aria-label="Open recently viewed games">${commandIcon("refresh")}<span>Recent</span>${counts.recent ? `<b>${counts.recent}</b>` : ""}</button>
  </aside>`;
}
