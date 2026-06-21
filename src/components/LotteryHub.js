export function LotteryHub({ scratchGames = [], drawGames = [], watchlist = [], favorites = [] }) {
  const newGames = scratchGames.filter((game) => game.isCurrentRelease).length;
  const endingSoon = scratchGames.filter((game) => game.status === "ending soon").length;
  return `<section class="lotteryHub" aria-labelledby="lottery-hub-title">
    <div class="lotteryHubLead">
      <span>Universal game access</span>
      <h2 id="lottery-hub-title">Lottery Hub</h2>
      <p>Every active scratch-off and supported draw game is one click away.</p>
      <button type="button" class="hubPrimary" data-show-all>${scratchGames.length + drawGames.length} games &middot; View all</button>
    </div>
    <div class="lotteryHubStats">
      <article><strong>${scratchGames.length}</strong><span>Active scratch-offs</span></article>
      <article><strong>${drawGames.length}</strong><span>Draw games</span></article>
      <article><strong>${newGames}</strong><span>New games</span></article>
      <article><strong>${endingSoon}</strong><span>Ending soon</span></article>
      <article><strong>${watchlist.length}</strong><span>Watched</span></article>
      <article><strong>${favorites.length}</strong><span>Favorites</span></article>
    </div>
    <div class="lotteryHubActions">
      <button type="button" data-show-all>View All Games</button>
      <button type="button" data-open-active-scratch>Active Scratch-Offs</button>
      <button type="button" data-nav="draws">Draw Games</button>
      <button type="button" data-library-preset="new">New Games</button>
      <button type="button" data-library-preset="ending">Ending Soon</button>
    </div>
  </section>`;
}
