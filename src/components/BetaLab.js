export const betaFeatures = [
  { id: "best-value-radar", name: "Best Value Radar", description: "Ranks tickets by cost, odds, top prizes, and remaining prize strength.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "BV", action: "best-value", actionLabel: "Open radar" },
  { id: "prize-heat-meter", name: "Prize Heat Meter", description: "Turns score, trend, and remaining inventory into a compact heat signal.", category: "Visual Tools", status: "Useful", dataStatus: "Preview Logic", icon: "PH", action: "heat", actionLabel: "View hot tickets" },
  { id: "new-game-pulse", name: "New Game Pulse", description: "Surfaces current-release games with a clean animated pulse.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "NP", action: "new-games", actionLabel: "See new games" },
  { id: "ending-soon-watch", name: "Ending Soon Watch", description: "Flags tickets marked near retirement or claim deadlines.", category: "Watchlist Tools", status: "Ready", dataStatus: "Live Data", icon: "ES", action: "ending-soon", actionLabel: "Review alerts" },
  { id: "top-prize-tracker", name: "Top Prize Tracker", description: "Shows visible top-prize inventory with progress bars and badges.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "TP", action: "top-prizes", actionLabel: "Track prizes" },
  { id: "odds-boost-view", name: "Odds Boost View", description: "Sorts active tickets by published overall odds.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "OB", action: "best-odds", actionLabel: "Rank by odds" },
  { id: "budget-picker", name: "Budget Picker", description: "Builds a responsible ticket mix inside a fixed spend limit.", category: "Budget Tools", status: "Connected", dataStatus: "Live Data", icon: "BP", action: "budget", actionLabel: "Open planner" },
  { id: "one-dollar-picks", name: "$1 Ticket Picks", description: "Filters the catalog to one-dollar tickets.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "$1", action: "price-1", actionLabel: "Show $1" },
  { id: "two-dollar-picks", name: "$2 Ticket Picks", description: "Filters the catalog to two-dollar tickets.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "$2", action: "price-2", actionLabel: "Show $2" },
  { id: "five-dollar-picks", name: "$5 Ticket Picks", description: "Filters the catalog to five-dollar tickets.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "$5", action: "price-5", actionLabel: "Show $5" },
  { id: "ten-dollar-picks", name: "$10 Ticket Picks", description: "Filters the catalog to ten-dollar tickets.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "10", action: "price-10", actionLabel: "Show $10" },
  { id: "premium-ticket-picks", name: "$20+ Ticket Picks", description: "Opens the premium-ticket research lane.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "20", action: "premium", actionLabel: "Show premium" },
  { id: "favorite-tickets", name: "Favorite Tickets", description: "Keeps a local shortlist of tickets you want to revisit.", category: "Watchlist Tools", status: "Connected", dataStatus: "Live Data", icon: "FT", action: "favorites", actionLabel: "Open favorites" },
  { id: "watchlist", name: "Watchlist", description: "Monitors saved scratch-offs and draw games on this device.", category: "Watchlist Tools", status: "Connected", dataStatus: "Live Data", icon: "WL", action: "favorites", actionLabel: "Open watchlist" },
  { id: "smart-compare", name: "Smart Compare", description: "Selects up to five tickets for side-by-side research.", category: "Ticket Intelligence", status: "Connected", dataStatus: "Live Data", icon: "SC", action: "compare", actionLabel: "Start comparing" },
  { id: "daily-pick-card", name: "Daily Pick Card", description: "Highlights one high-scoring cached-data research profile.", category: "Dashboard Widgets", status: "Ready", dataStatus: "Preview Logic", icon: "DP", action: "daily-pick", actionLabel: "View daily pick" },
  { id: "risk-reward-meter", name: "Risk vs Reward Meter", description: "Balances published odds, ticket price, and advertised prize scale.", category: "Visual Tools", status: "Experimental", dataStatus: "Preview Logic", icon: "RR" },
  { id: "prize-decay-meter", name: "Prize Decay Meter", description: "Estimates inventory decline from the current cached prize table.", category: "Data Quality", status: "Experimental", dataStatus: "Preview Logic", icon: "PD" },
  { id: "low-value-warning", name: "Low Value Warning", description: "Flags weak remaining-prize profiles for extra verification.", category: "Ticket Intelligence", status: "Useful", dataStatus: "Preview Logic", icon: "LV", action: "low-value", actionLabel: "Review warnings" },
  { id: "top-prize-alert", name: "Top Prize Alert", description: "Highlights games with multiple visible top prizes remaining.", category: "Watchlist Tools", status: "Ready", dataStatus: "Live Data", icon: "TA", action: "top-prizes", actionLabel: "View alerts" },
  { id: "ticket-mood-badge", name: "Ticket Mood Badge", description: "Adds quick labels such as Fresh, Hot, Risky, or Premium.", category: "Visual Tools", status: "Useful", dataStatus: "Preview Logic", icon: "TM", action: "heat", actionLabel: "See badges" },
  { id: "scratch-reveal", name: "Scratch Reveal Animation", description: "Adds a short reveal treatment to selected insights.", category: "Experimental Fun", status: "Visual Only", dataStatus: "Visual Only", icon: "SR" },
  { id: "jackpot-glow", name: "Jackpot Glow Banner", description: "Adds a restrained prize glow to large-jackpot features.", category: "Visual Tools", status: "Visual Only", dataStatus: "Visual Only", icon: "JG", action: "jackpot", actionLabel: "View jackpots" },
  { id: "recent-winners", name: "Recent Winners Panel", description: "Organizes sourced winner articles from the cached snapshot.", category: "Local Insights", status: "Connected", dataStatus: "Partial Data", icon: "RW", action: "winners", actionLabel: "Open winners" },
  { id: "county-winners-map", name: "County Winners Map Preview", description: "Maps sourced winner locations with approximate county context.", category: "Local Insights", status: "Preview", dataStatus: "Partial Data", icon: "CM", action: "winners", actionLabel: "Open map" },
  { id: "raleigh-hot-zone", name: "Raleigh Hot Zone", description: "Opens Raleigh-area public winner-location research.", category: "Local Insights", status: "Connected", dataStatus: "Partial Data", icon: "RH", action: "raleigh", actionLabel: "View Raleigh" },
  { id: "mount-airy-hot-zone", name: "Mount Airy Hot Zone", description: "Opens Mount Airy-area public winner-location research.", category: "Local Insights", status: "Connected", dataStatus: "Partial Data", icon: "MA", action: "mount-airy", actionLabel: "View Mount Airy" },
  { id: "prize-ladder", name: "Prize Ladder View", description: "Stacks visible prize tiers from top prize to lower displayed tiers.", category: "Visual Tools", status: "Ready", dataStatus: "Live Data", icon: "PL", action: "daily-pick-detail", actionLabel: "Open ladder" },
  { id: "ticket-timeline", name: "Ticket Timeline", description: "Shows release date, game age, and current lifecycle label.", category: "Ticket Intelligence", status: "Useful", dataStatus: "Partial Data", icon: "TL", action: "new-games", actionLabel: "View timeline" },
  { id: "pinned-dashboard-widgets", name: "Pinned Dashboard Widgets", description: "Places pinned Beta Lab tools on the home dashboard.", category: "Dashboard Widgets", status: "Connected", dataStatus: "Live Data", icon: "PW", action: "home", actionLabel: "Open dashboard" },
  { id: "data-confidence", name: "Data Confidence Badge", description: "Labels features as live, partial, preview, visual, or needs data.", category: "Data Quality", status: "Connected", dataStatus: "Live Data", icon: "DC", action: "sources", actionLabel: "View sources" },
  { id: "score-history", name: "Ticket Score History", description: "Will chart score changes after historical snapshots are stored.", category: "Data Quality", status: "Needs Data", dataStatus: "Needs Data", icon: "SH", enableable: false },
  { id: "draw-games-bridge", name: "Draw Games Bridge", description: "Connects scratch-off research with the draw-game center.", category: "Ticket Intelligence", status: "Connected", dataStatus: "Partial Data", icon: "DG", action: "draws", actionLabel: "Open draw center" },
  { id: "lucky-theme-effects", name: "Lucky Theme Effects", description: "Adds optional sparkle and glow accents without changing data.", category: "Experimental Fun", status: "Visual Only", dataStatus: "Visual Only", icon: "LT", action: "toggle-glow", actionLabel: "Toggle effects" },
  { id: "clean-pro-mode", name: "Clean Pro Mode", description: "Uses the analytics-first interface with reduced decorative glow.", category: "Visual Tools", status: "Ready", dataStatus: "Visual Only", icon: "CP", action: "clean-pro", actionLabel: "Use Pro mode" },
  { id: "best-under-ten", name: "Best Under $10", description: "Ranks active tickets priced below ten dollars by score.", category: "Budget Tools", status: "Ready", dataStatus: "Live Data", icon: "U10", action: "under-10", actionLabel: "View picks" },
  { id: "high-risk-reward", name: "Best High-Risk High-Reward", description: "Surfaces larger advertised prizes with clear risk framing.", category: "Ticket Intelligence", status: "Experimental", dataStatus: "Preview Logic", icon: "HR", action: "jackpot", actionLabel: "Explore" },
  { id: "balanced-ticket", name: "Most Balanced Ticket", description: "Finds a balanced score across value, odds, and prize visibility.", category: "Ticket Intelligence", status: "Experimental", dataStatus: "Preview Logic", icon: "MB", action: "best-value", actionLabel: "View balance" },
  { id: "top-prize-filter", name: "Top Prize Remaining Filter", description: "Requires at least one visible top prize in the cached table.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "TF", action: "top-prizes", actionLabel: "Apply filter" },
  { id: "local-store-notes", name: "Local Store Notes", description: "A future private notes layer for retailers and locations.", category: "Local Insights", status: "Needs Data", dataStatus: "Needs Data", icon: "LS", enableable: false },
  { id: "ticket-notes", name: "User Notes on Tickets", description: "Attaches private on-device notes to individual ticket profiles.", category: "Watchlist Tools", status: "Connected", dataStatus: "Live Data", icon: "UN", action: "favorites", actionLabel: "Open saved library" },
  { id: "comparison-tray", name: "Ticket Comparison Tray", description: "Keeps selected tickets visible while moving through the app.", category: "Watchlist Tools", status: "Connected", dataStatus: "Live Data", icon: "CT", action: "compare", actionLabel: "Open tray" },
  { id: "favorite-price-range", name: "Favorite Price Range", description: "Creates one-tap access to a preferred ticket price.", category: "Budget Tools", status: "Experimental", dataStatus: "Preview Logic", icon: "FP", action: "price-5", actionLabel: "Try $5 lane" },
  { id: "recently-viewed", name: "Recently Viewed Tickets", description: "Retains a private on-device history of opened ticket profiles.", category: "Watchlist Tools", status: "Connected", dataStatus: "Live Data", icon: "RV", action: "favorites", actionLabel: "Open recent research" },
  { id: "smart-sort-presets", name: "Smart Sort Presets", description: "Provides quick presets for value, odds, prize scale, and cost.", category: "Ticket Intelligence", status: "Ready", dataStatus: "Live Data", icon: "SS", action: "best-value", actionLabel: "Try presets" },
];

const categories = ["All", ...new Set(betaFeatures.map((feature) => feature.category))];

function featureCard(feature, beta) {
  const pinned = beta.pinned.includes(feature.id);
  const enabled = beta.enabled.includes(feature.id);
  const enableable = feature.enableable !== false;
  const visualTone = feature.dataStatus === "Needs Data" ? "needs" : feature.dataStatus === "Visual Only" ? "visual" : feature.dataStatus === "Preview Logic" ? "preview" : "live";
  return `<article class="betaFeatureCard ${pinned ? "pinned" : ""} ${enabled ? "enabled" : ""}" data-beta-card="${feature.id}">
    <div class="betaFeatureTop">
      <span class="betaFeatureIcon" aria-hidden="true">${feature.icon}</span>
      <div class="betaBadgeStack"><span class="betaStatus status-${feature.status.toLowerCase().replace(/\s+/g, "-")}">${feature.status}</span><span class="betaDataStatus">${feature.dataStatus}</span></div>
      <button type="button" class="betaPin ${pinned ? "active" : ""}" data-beta-pin="${feature.id}" aria-pressed="${pinned}" aria-label="${pinned ? "Unpin" : "Pin"} ${feature.name}" title="${pinned ? "Unpin" : "Pin"} ${feature.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 6 0 1 6 3 3H5l3-3 1-6Zm3 9v7"/></svg>
      </button>
    </div>
    <div class="betaFeaturePreview tone-${visualTone}" aria-hidden="true">
      <span class="betaPreviewOrb"><i></i></span>
      <span class="betaPreviewBars"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="betaPreviewPulse"><i></i><i></i><i></i></span>
    </div>
    <div class="betaFeatureCopy"><span>${feature.category}</span><h3>${feature.name}</h3><p>${feature.description}</p></div>
    <div class="betaFeatureActions">
      ${feature.action ? `<button type="button" class="betaOpen" data-beta-action="${feature.action}">${feature.actionLabel}</button>` : `<button type="button" class="betaOpen" data-beta-preview="${feature.id}">Preview</button>`}
      ${enableable
        ? `<button type="button" class="betaSwitch ${enabled ? "active" : ""}" role="switch" aria-checked="${enabled}" data-beta-toggle="${feature.id}"><i></i><span>${enabled ? "Enabled" : "Disabled"}</span></button>`
        : `<button type="button" class="betaSwitch unavailable" disabled><span>${feature.dataStatus}</span></button>`}
    </div>
  </article>`;
}

function filteredFeatures(beta) {
  const query = beta.query.trim().toLowerCase();
  return betaFeatures.filter((feature) => {
    const categoryMatch = beta.category === "All" || feature.category === beta.category;
    const queryMatch = !query || `${feature.name} ${feature.description} ${feature.category} ${feature.status} ${feature.dataStatus}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
}

export function BetaLab({ scratchCount, drawCount, savedScratch, savedPicks, unavailableCount, beta }) {
  const matches = filteredFeatures(beta);
  const pinned = matches.filter((feature) => beta.pinned.includes(feature.id));
  const available = matches.filter((feature) => !beta.pinned.includes(feature.id));
  return `<section class="betaLab" aria-labelledby="beta-title">
    <header class="betaHero">
      <div class="betaHeroCopy">
        <span class="betaBadge">Beta Lab</span>
        <p>Experimental command deck</p>
        <h1 id="beta-title">Build your own ScratchScope.</h1>
        <small>Pin useful tools, enable visual experiments, and keep data-limited ideas clearly labeled.</small>
        <div class="betaHeroActions"><button type="button" data-beta-clear>Reset view</button><span>${betaFeatures.length} experiments</span></div>
      </div>
      <div class="betaHeroStats">
        <article><strong>${beta.pinned.length}</strong><span>Pinned</span></article>
        <article><strong>${beta.enabled.length}</strong><span>Enabled</span></article>
        <article><strong>${scratchCount}</strong><span>Tickets</span></article>
        <article><strong>${savedScratch + savedPicks}</strong><span>Saved</span></article>
      </div>
    </header>

    <div class="betaNotice">
      <strong>Truthful by design</strong>
      <span>${drawCount} draw games connected. ${unavailableCount} connectors remain unavailable and are labeled instead of simulated.</span>
    </div>

    <section class="betaControls" aria-label="Filter Beta Lab features">
      <label class="betaSearch">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 19a8 8 0 1 1 5.7-2.4L21 21"/></svg>
        <input type="search" value="${beta.query}" data-beta-query placeholder="Search experiments" aria-label="Search beta features">
      </label>
      <div class="betaCategories" role="group" aria-label="Beta feature categories">
        ${categories.map((category) => `<button type="button" class="${beta.category === category ? "active" : ""}" data-beta-category="${category}" aria-pressed="${beta.category === category}">${category}</button>`).join("")}
      </div>
    </section>

    <section class="betaPinnedZone" aria-labelledby="beta-pinned-title">
      <div class="betaSectionHead"><div><span>Pinned deck</span><h2 id="beta-pinned-title">Your command shortcuts</h2></div><strong>${pinned.length} shown</strong></div>
      ${pinned.length ? `<div class="betaGrid betaPinnedGrid">${pinned.map((feature) => featureCard(feature, beta)).join("")}</div>` : `<div class="betaEmpty"><span>+</span><div><strong>No pinned tools in this view.</strong><p>Use the pin button on any feature to place it here and on the home dashboard.</p></div></div>`}
    </section>

    <section class="betaCatalog" aria-labelledby="beta-catalog-title">
      <div class="betaSectionHead"><div><span>Experiment catalog</span><h2 id="beta-catalog-title">${beta.category === "All" ? "All available tools" : beta.category}</h2></div><strong>${available.length} shown</strong></div>
      ${available.length ? `<div class="betaGrid">${available.map((feature) => featureCard(feature, beta)).join("")}</div>` : `<div class="betaEmpty"><span>0</span><div><strong>No additional matches.</strong><p>Clear the search or choose another category.</p></div></div>`}
    </section>
  </section>`;
}

export function PinnedBetaWidgets(beta) {
  const pinned = beta.pinned.map((id) => betaFeatures.find((feature) => feature.id === id)).filter(Boolean).slice(0, 6);
  if (!pinned.length) return `<section class="pinnedBetaDashboard emptyPinnedBeta">
    <div class="betaSectionHead"><div><span>Beta widgets</span><h2>Shape your dashboard</h2></div><button type="button" data-nav="beta">Open Beta Lab</button></div>
    <p>Pin experiments in Beta Lab to create a personal command row here.</p>
  </section>`;
  return `<section class="pinnedBetaDashboard" aria-labelledby="pinned-dashboard-title">
    <div class="betaSectionHead"><div><span>Beta widgets</span><h2 id="pinned-dashboard-title">Pinned command row</h2></div><button type="button" data-nav="beta">Manage</button></div>
    <div class="pinnedWidgetGrid">${pinned.map((feature) => `<article class="${beta.enabled.includes(feature.id) ? "enabled" : ""}">
      <span class="betaFeatureIcon">${feature.icon}</span>
      <div><small>${feature.dataStatus}</small><strong>${feature.name}</strong></div>
      ${feature.action ? `<button type="button" data-beta-action="${feature.action}" aria-label="Open ${feature.name}">Open</button>` : `<button type="button" data-beta-preview="${feature.id}" aria-label="Preview ${feature.name}">Preview</button>`}
    </article>`).join("")}</div>
  </section>`;
}

export function BetaFeatureModal(featureId) {
  const feature = betaFeatures.find((item) => item.id === featureId);
  if (!feature) return "";
  const availability = feature.dataStatus === "Needs Data"
    ? "This concept needs a new local data model or connector before it can be enabled."
    : feature.dataStatus === "Visual Only"
      ? "This changes presentation only. It does not alter scores, odds, or lottery data."
      : "This preview uses the current ScratchScope dataset or clearly labeled preview logic.";
  return `<div class="drawerBackdrop betaModalBackdrop" data-beta-preview-close>
    <section class="featureModal betaPreviewModal" data-stop role="dialog" aria-modal="true" aria-labelledby="beta-preview-title">
      <header class="featureModalHeader">
        <div class="betaPreviewIdentity"><span class="betaFeatureIcon">${feature.icon}</span><div><p>${feature.category}</p><h2 id="beta-preview-title">${feature.name}</h2></div></div>
        <button type="button" class="iconBtn" data-beta-preview-close aria-label="Close beta feature preview">&times;</button>
      </header>
      <div class="betaPreviewBody">
        <div class="betaPreviewSignal"><span>${feature.status}</span><strong>${feature.dataStatus}</strong></div>
        <h3>What it adds</h3>
        <p>${feature.description}</p>
        <div class="betaAvailability"><strong>Availability</strong><span>${availability}</span></div>
      </div>
      <div class="drawerActions">
        ${feature.action ? `<button type="button" class="primaryBtn" data-beta-action="${feature.action}">${feature.actionLabel}</button>` : ""}
        <button type="button" class="secondaryBtn" data-beta-preview-close>Close preview</button>
      </div>
    </section>
  </div>`;
}
