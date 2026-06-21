const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function SavedWorkspace({ favorites = [], watchlist = [], recent = [], notes = {}, savedPicks = [], watchedDraws = [] }) {
  const unique = [...new Map([...favorites, ...watchlist].map((game) => [game.id, game])).values()];
  const averageScore = unique.length ? Math.round(unique.reduce((sum, game) => sum + game.intelligence.score, 0) / unique.length) : 0;
  const totalFaceValue = unique.reduce((sum, game) => sum + game.price, 0);
  const noted = Object.values(notes).filter((value) => String(value).trim()).length;
  return `<section class="savedWorkspace" aria-labelledby="saved-workspace-title">
    <header>
      <div><span>Private local workspace</span><h1 id="saved-workspace-title">Your research library.</h1><p>Favorites, watched games, notes, recent views, and saved draw sets stay on this device.</p></div>
      <div class="savedWorkspaceScore"><strong>${averageScore || "—"}</strong><span>average saved score</span></div>
    </header>
    <div class="savedSummaryGrid">
      <article><span>Favorites</span><strong>${favorites.length}</strong><small>Pinned for fast access</small></article>
      <article><span>Watchlist</span><strong>${watchlist.length}</strong><small>Scratch-off profiles</small></article>
      <article><span>Draw Watch</span><strong>${watchedDraws.length}</strong><small>Tracked draw games</small></article>
      <article><span>Saved Sets</span><strong>${savedPicks.length}</strong><small>Entertainment picks</small></article>
      <article><span>Notes</span><strong>${noted}</strong><small>Private annotations</small></article>
      <article><span>Face Value</span><strong>${money.format(totalFaceValue)}</strong><small>One of each unique ticket</small></article>
    </div>
    <section class="recentResearch">
      <div class="savedSectionHead"><div><span>Continue where you left off</span><h2>Recent research</h2></div><button type="button" data-activity-open>View activity</button></div>
      <div class="recentResearchRail">${recent.length ? recent.slice(0, 6).map((game) => `<button type="button" data-open-detail="${game.id}">
        <img src="${game.imageUrl}" alt="">
        <span><strong>${game.name}</strong><small>$${game.price} · Score ${game.intelligence.score}</small></span>
        ${notes[game.id] ? "<b>Note</b>" : ""}
      </button>`).join("") : `<div class="emptySavedRail"><strong>No recent tickets yet.</strong><span>Open a ticket and it will appear here.</span></div>`}</div>
    </section>
  </section>`;
}
