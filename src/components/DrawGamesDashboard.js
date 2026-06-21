const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function fmtDate(value) {
  if (!value) return "Game ended";
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function countdown(value, game = {}) {
  if (game.status === "ended" || !value) return "Game ended";
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Verify next drawing";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const days = Math.floor(hours / 24);
  return days ? `${days}d ${hours % 24}h` : `${hours}h ${minutes}m`;
}

function balls(numbers = [], bonusNumber = null) {
  return `<div class="lotteryBalls">${numbers.map((number, index) => `<span style="--i:${index}">${number}</span>`).join("")}${bonusNumber === null || bonusNumber === undefined ? "" : `<span class="bonusBall">${bonusNumber}</span>`}</div>`;
}

function scoreBar(label, value) {
  return `<div class="scoreBar"><div><span>${label}</span><b>${value}</b></div><i><em style="width:${value}%"></em></i></div>`;
}

function nextDrawingCard(game, watched) {
  const cutoffDiff = game.cutoffTime ? new Date(game.cutoffTime).getTime() - Date.now() : 0;
  const cutoffLabel = game.status === "ended" ? "Sales ended" : cutoffDiff <= 0 ? "Cutoff near or passed" : `Cutoff ${fmtDate(game.cutoffTime)}`;
  return `<article class="drawCard nextDrawCard">
    <div class="drawCardTop"><span>${game.status === "ended" ? "Game Status" : "Next Drawing"}</span><button class="${watched ? "active" : ""}" data-watch-draw="${game.gameId}">${watched ? "Watching" : "Watch"}</button></div>
    <h3>${game.gameName}</h3>
    <strong>${game.intelligence.jackpotDisplay}</strong>
    <div class="countdownPulse" data-draw-countdown="${game.nextDrawDate || ""}" data-draw-status="${game.status || "active"}">${countdown(game.nextDrawDate, game)}</div>
    <div class="drawMiniGrid">
      <div><span>Draw</span><b>${game.drawDays?.join(", ") || fmtDate(game.nextDrawDate)}</b></div>
      <div><span>Cash</span><b>${game.intelligence.cashDisplay}</b></div>
      <div><span>Ticket</span><b>${money.format(game.ticketPrice)}</b></div>
      <div><span>Cutoff</span><b>${cutoffLabel}</b></div>
    </div>
    <button class="drawPrimary" data-compare-draw="${game.gameId}">Compare</button>
  </article>`;
}

function heatMeter(game) {
  const score = game.intelligence.excitementScore;
  return `<article class="drawCard">
    <div class="drawCardTop"><span>Jackpot Heat</span><b>${game.intelligence.heatLabel}</b></div>
    <div class="heatMeter"><i style="width:${score}%"></i><em>${score}</em></div>
    <div class="heatLabels"><span>Cold</span><span>Warming Up</span><span>Hot</span><span>Massive</span><span>Historic</span></div>
    ${scoreBar("Jackpot score", game.intelligence.jackpotScore)}
    ${scoreBar("Rollover energy", Math.min(100, game.rolloverCount * 10))}
    ${scoreBar("Excitement", game.intelligence.excitementScore)}
  </article>`;
}

function oddsReality(game) {
  return `<article class="drawCard oddsReality">
    <div class="drawCardTop"><span>Odds Reality</span><b>Official fields</b></div>
    <div class="drawMiniGrid">
      <div><span>Top prize odds</span><b>${game.oddsJackpot}</b></div>
      <div><span>Overall odds</span><b>${game.oddsOverall}</b></div>
      <div><span>Ticket</span><b>${money.format(game.ticketPrice)}</b></div>
      <div><span>Cached result</span><b>${game.lastResults?.[0]?.drawDate || "Unavailable"}</b></div>
    </div>
    <p>Values are cached and may be stale. Verify with the official lottery before play.</p>
  </article>`;
}

function numberIntelligence(game) {
  const rows = [
    ["Hot", game.hotNumbers],
    ["Cold", game.coldNumbers],
    ["Overdue", game.overdueNumbers],
    ["Recent", game.lastWinningNumbers],
    ["Bonus+", game.frequentBonusBalls],
    ["Bonus-", game.leastFrequentBonusBalls],
  ];
  return `<article class="drawCard numberIntel">
    <div class="drawCardTop"><span>Number Intelligence</span><b>Pattern tracker</b></div>
    <div class="numberRows">${rows.map(([label, nums]) => `<div><span>${label}</span>${balls(nums || [])}</div>`).join("")}</div>
    <div class="patternStrip">${(game.pairPatterns || []).map((item) => `<span>${item}</span>`).join("")}</div>
    <p>Historical behavior. For entertainment. Not a guarantee.</p>
  </article>`;
}

function smartPickGenerator(game, drawState) {
  const activeMode = ["balanced", "spread", "random"].includes(drawState.pickMode) ? drawState.pickMode : "random";
  const generated = drawState.generatedPick?.gameId === game.gameId ? drawState.generatedPick : null;
  return `<article class="drawCard smartPicker">
    <div class="drawCardTop"><span>Entertainment Quick Pick</span><b>${activeMode === "spread" ? "wide spread" : activeMode}</b></div>
    <div class="pickModeTabs" role="group" aria-label="Quick pick style">
      ${[["balanced", "Balanced"], ["spread", "Wide Spread"], ["random", "Pure Random"]].map(([value, label]) => `<button type="button" class="${activeMode === value ? "active" : ""}" data-pick-mode="${value}" aria-pressed="${activeMode === value}">${label}</button>`).join("")}
    </div>
    <button class="drawPrimary" data-generate-pick="${game.gameId}">Generate Set</button>
    ${generated ? `<div class="generatedPick">${balls(generated.numbers, generated.bonusNumber)}<p>${generated.notes}</p><div class="pickActions"><button data-save-pick="${generated.id}">Save</button><button data-copy-pick="${generated.id}">Copy</button></div></div>` : `<div class="emptyDrawState">Choose a number-shape style for entertainment. Every valid combination remains subject to the game's random odds.</div>`}
  </article>`;
}

function savedVault(savedPicks = []) {
  return `<section class="drawSection savedVault">
    <div class="sectionHead"><div><p>Saved Numbers Vault</p><h2>Saved sets and reminders</h2></div><strong>${savedPicks.length} saved</strong></div>
    <div class="vaultGrid">${savedPicks.length ? savedPicks.map((pick) => `<article>
      <div><span>${pick.gameName}</span><button class="${pick.favorite ? "active" : ""}" data-favorite-pick="${pick.id}">${pick.favorite ? "Fav" : "Star"}</button></div>
      ${balls(pick.numbers, pick.bonusNumber)}
      <small>Saved ${fmtDate(pick.savedAt)} | Draw ${fmtDate(pick.drawDate)}</small>
      <p>${pick.notes || "Compare to winning numbers later."}</p>
      <div class="pickActions"><button data-copy-saved="${pick.id}">Copy</button><button data-delete-pick="${pick.id}">Delete</button></div>
    </article>`).join("") : `<article class="emptyDrawState">Saved picks will appear here with notes, favorites, and future result checks.</article>`}</div>
  </section>`;
}

function winningNumbersFeed(games) {
  const results = games
    .flatMap((game) => (game.lastResults || []).filter((result) => result.numbers?.length).slice(0, 2).map((result) => ({ ...result, game })))
    .slice(0, 8);
  return `<section class="drawSection">
    <div class="sectionHead"><div><p>Cached Results</p><h2>Recent numbers in this snapshot</h2></div><strong>Verify official source</strong></div>
    <div class="resultsFeed">${results.length ? results.map((result) => `<article>
      <div><strong>${result.game.gameName}</strong><span>${result.drawDate}</span></div>
      ${balls(result.numbers, result.bonusNumber)}
      <small>${result.multiplier || "No multiplier"} | ${result.jackpotStatus} | Winners ${result.winners ?? "varies"}</small>
      <button data-check-saved="${result.game.gameId}">Check saved numbers</button>
    </article>`).join("") : `<article class="emptyDrawState">No verified result records are available in this snapshot.</article>`}</div>
  </section>`;
}

function comparisonPanel(games, selectedIds = []) {
  const selected = selectedIds.length ? games.filter((game) => selectedIds.includes(game.gameId)) : games.slice(0, 4);
  return `<section class="drawSection drawComparePanel">
    <div class="sectionHead"><div><p>Draw Game Comparison</p><h2>Side-by-side cached facts</h2></div><strong>${selected.length} games</strong></div>
    <div class="drawCompareGrid">${selected.map((game) => `<article>
      <h3>${game.gameName}</h3>
      <div><span>Jackpot</span><b>${game.intelligence.jackpotDisplay}</b></div>
      <div><span>Ticket</span><b>${money.format(game.ticketPrice)}</b></div>
      <div><span>Odds</span><b>${game.oddsJackpot}</b></div>
      <div><span>Next</span><b>${countdown(game.nextDrawDate, game)}</b></div>
      <div><span>Overall odds</span><b>${game.oddsOverall}</b></div>
      <div><span>Schedule</span><b>${game.drawDays?.join(", ")}</b></div>
      <em>Verify current values before play.</em>
    </article>`).join("")}</div>
  </section>`;
}

function unavailableGames(games = [], sources = {}) {
  if (!games.length) return "";
  return `<section class="drawSection unavailableGames">
    <div class="sectionHead"><div><p>Coming Soon</p><h2>Live connector required</h2></div><strong>${games.length} hidden</strong></div>
    <div class="retailerGrid">${games.map((game) => `<article>
      <span>${game.gameName}</span>
      <strong>Data unavailable in-app</strong>
      <small>${game.unavailableReason}</small>
      <a class="officialCompare" href="${game.gameId === "carolina-keno" ? sources.kenoResults : sources.cashPopResults}" target="_blank" rel="noreferrer">Open official results</a>
    </article>`).join("")}</div>
  </section>`;
}

export function DrawGamesDashboard(drawSnapshot, drawState) {
  const games = drawSnapshot.games;
  const focus = games.find((game) => game.gameId === drawState.focusGameId) || games.find((game) => game.status !== "ended") || games[0];
  const watched = drawState.watchlist?.includes(focus.gameId);
  return `<section class="drawGamesDashboard" id="draw-games">
    <div class="drawHero">
      <div>
        <p>Draw Games</p>
        <h1>Lottery command center</h1>
        <span>${drawSnapshot.dataHealth.status} | ${drawSnapshot.dataHealth.note}</span>
      </div>
      <div class="drawHeroStats">
        <article><strong>${drawSnapshot.stats.trackedGames}</strong><span>Ready games</span></article>
        <article><strong>$${compact.format(drawSnapshot.stats.biggestJackpot)}</strong><span>Biggest jackpot</span></article>
        <article><strong>${drawSnapshot.stats.drawTonight}</strong><span>Draw tonight</span></article>
        <article><strong>${drawSnapshot.unavailableGames.length}</strong><span>Connectors pending</span></article>
      </div>
    </div>
    <div class="drawGameTabs">${games.map((game) => `<button class="${focus.gameId === game.gameId ? "active" : ""}" data-focus-draw="${game.gameId}">${game.gameName}<span>${game.intelligence.jackpotDisplay}</span></button>`).join("")}</div>
    <div class="drawDashboardGrid">
      ${nextDrawingCard(focus, watched)}
      ${heatMeter(focus)}
      ${oddsReality(focus)}
      ${numberIntelligence(focus)}
      ${smartPickGenerator(focus, drawState)}
    </div>
    ${savedVault(drawState.savedPicks || [])}
    ${winningNumbersFeed(games)}
    ${comparisonPanel(games, drawState.compareDraws || [])}
    ${unavailableGames(drawSnapshot.unavailableGames, drawSnapshot.officialSources)}
  </section>`;
}

export function DrawCommandStrip(drawSnapshot, scratchGame, locationLabel) {
  const firstDraw = drawSnapshot.games[0];
  const biggest = [...drawSnapshot.games].filter((game) => game.isJackpotGame).sort((a, b) => b.jackpotAmount - a.jackpotAmount)[0] || firstDraw;
  return `<section class="todayBestPlays">
    <div class="sectionHead"><div><p>Research Shortcuts</p><h2>Cached lottery data at a glance</h2></div><strong>Verify before play</strong></div>
    <div class="todayPlayGrid">
      <article data-detail="${scratchGame.id}"><span>Scratch-Off Snapshot</span><strong>${scratchGame.name}</strong><small>Cached score ${scratchGame.intelligence.score}</small></article>
      <article data-nav="draws"><span>Draw Games</span><strong>${firstDraw.gameName}</strong><small>${drawSnapshot.stats.trackedGames} ready games</small></article>
      <article data-nav="draws"><span>Largest Cached Jackpot</span><strong>${biggest.gameName}</strong><small>${biggest.intelligence.jackpotDisplay}</small></article>
      <article data-nav="hotzones"><span>Winner Article Map</span><strong>${locationLabel}</strong><small>Historical records only</small></article>
    </div>
  </section>`;
}
