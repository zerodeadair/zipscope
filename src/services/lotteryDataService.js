import { officialGames, officialSources, officialWinners, sourceHealth } from "../data/officialSnapshot.js";
import { rankedGames } from "./scoringService.js";

function firstTuesdayOfMonth(date = new Date()) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (2 - first.getDay() + 7) % 7;
  return new Date(date.getFullYear(), date.getMonth(), 1 + offset);
}

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withReleaseStatus(games) {
  const currentReleaseDate = firstTuesdayOfMonth();
  return games.map((game) => {
    const launchDate = game.launchDate ? new Date(`${game.launchDate}T00:00:00`) : null;
    const isCurrentRelease = Boolean(launchDate && sameDate(launchDate, currentReleaseDate));
    return {
      ...game,
      isCurrentRelease,
      releaseLabel: isCurrentRelease ? "New" : "",
      status: isCurrentRelease ? "new" : game.status === "new" ? "active" : game.status,
    };
  });
}

export function getLotterySnapshot() {
  const enrichedGames = rankedGames(withReleaseStatus(officialGames));
  return {
    dataHealth: {
      mode: "OFFICIAL CACHED",
      label: "Official ticket snapshot",
      status: sourceHealth.dataState,
      lastVerified: sourceHealth.lastUpdated,
      updatedAt: new Date().toISOString(),
      sourceUrl: officialSources.prizesRemaining,
      message: sourceHealth.note,
    },
    officialSources,
    games: enrichedGames,
    winners: officialWinners,
    stats: {
      activeGames: enrichedGames.filter((game) => game.status !== "ended").length,
      topPrizesLeft: enrichedGames.filter((game) => game.intelligence.topPrizesRemaining > 0).length,
      zeroTopPrizes: enrichedGames.filter((game) => game.intelligence.topPrizesRemaining === 0).length,
      newGames: enrichedGames.filter((game) => game.isCurrentRelease).length,
      endingSoon: enrichedGames.filter((game) => game.status === "ending soon").length,
      biggestTopPrize: Math.max(...enrichedGames.map((game) => game.topPrizeAmount)),
    },
  };
}

export function filterGames(games, filters) {
  const query = filters.query.trim().toLowerCase();
  return games.filter((game) => {
    const text = [
      game.name,
      game.number,
      game.price,
      game.topPrizeAmount,
      game.status,
      game.isCurrentRelease ? "new current release first tuesday" : "",
      game.intelligence.category,
      game.intelligence.topPrizesRemaining > 0 ? "top prizes left" : "top prizes gone",
      game.status === "ending soon" ? "ending soon" : "",
    ].join(" ").toLowerCase();
    const priceOk = filters.price === "all" || Number(filters.price) === game.price;
    const topOk = !filters.hideNoTop || game.intelligence.topPrizesRemaining > 0;
    const statusOk = filters.status === "all" || filters.status === game.status;
    const newOk = !filters.newOnly || game.isCurrentRelease;
    const endingOk = !filters.endingSoon || game.status === "ending soon";
    const prizeOk = !filters.minPrize || game.topPrizeAmount >= Number(filters.minPrize);
    const oddsOk = !filters.maxOdds || Number(game.overallOdds.match(/[\d.]+$/)?.[0] || 99) <= Number(filters.maxOdds);
    const remainingOk = !filters.minTopRemaining || game.intelligence.topPrizesRemaining >= Number(filters.minTopRemaining);
    const searchOk = !query || text.includes(query);
    return priceOk && topOk && statusOk && newOk && endingOk && prizeOk && oddsOk && remainingOk && searchOk;
  });
}
