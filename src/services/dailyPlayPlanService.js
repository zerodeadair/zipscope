function oddsNumber(game) {
  return Number(String(game.overallOdds || "").match(/[\d.]+$/)?.[0] || 99);
}

function uniqueGames(games) {
  const seen = new Set();
  return games.filter((game) => {
    if (!game || seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  });
}

function bestGame(games, predicate, sorter) {
  return [...games].filter(predicate).sort(sorter)[0];
}

function addLine(lines, game, reason) {
  const existing = lines.find((line) => line.game.id === game.id);
  if (existing) existing.quantity += 1;
  else lines.push({ game, quantity: 1, reason });
}

function scratchPlan(target, games) {
  const available = games.filter((game) => game.status !== "ended" && game.intelligence.topPrizesRemaining > 0);
  const byScore = (a, b) => b.intelligence.score - a.intelligence.score;
  const seeds = uniqueGames([
    bestGame(available, (game) => game.price >= 20, byScore),
    bestGame(available, () => true, byScore),
    bestGame(available, (game) => game.price === 5, (a, b) => oddsNumber(a) - oddsNumber(b)),
    bestGame(available, (game) => game.price === 5, byScore),
    bestGame(available, (game) => game.price === 2, byScore),
    bestGame(available, (game) => game.price === 1, byScore),
  ]);
  const lines = [];
  let total = 0;

  seeds.forEach((game, index) => {
    if (total + game.price > target) return;
    const reasons = [
      "Higher-price anchor with visible top-prize inventory",
      "Highest blended ScratchScope score",
      "Strong overall-odds option at the $5 level",
      "Alternative $5 research pick for variety",
      "Lower-cost ticket with visible prize depth",
      "Smallest-cost ticket in the mix",
    ];
    addLine(lines, game, reasons[index] || game.intelligence.label);
    total += game.price;
  });

  const fillPool = [...available].sort((a, b) => b.intelligence.score - a.intelligence.score || a.price - b.price);
  while (total < target) {
    const remaining = target - total;
    const game = fillPool.find((item) => item.price <= remaining);
    if (!game) break;
    addLine(lines, game, "Fills the remaining scratch-off allocation without exceeding the limit");
    total += game.price;
  }

  return {
    budget: target,
    total,
    ticketCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines: lines.map((line) => ({ ...line, subtotal: line.quantity * line.game.price })),
  };
}

function scheduledToday(game, date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  return (game.drawDays || []).some((day) => day === weekday || day === "Daily" || day === "Twice daily");
}

function addDrawLine(lines, game, reason) {
  const existing = lines.find((line) => line.game.gameId === game.gameId);
  if (existing) existing.quantity += 1;
  else lines.push({ game, quantity: 1, reason });
}

function drawPlan(target, games, date) {
  const scheduled = games.filter((game) => game.status !== "ended" && scheduledToday(game, date));
  const byWatchScore = (a, b) => b.intelligence.overallWatchScore - a.intelligence.overallWatchScore;
  const seeds = [];
  const largestJackpot = bestGame(scheduled, (game) => game.isJackpotGame, (a, b) => b.jackpotAmount - a.jackpotAmount);
  const lifePrize = bestGame(scheduled, (game) => game.gameId === "millionaire-for-life", byWatchScore);
  const localJackpot = bestGame(scheduled, (game) => game.state === "NC" && game.gameId === "cash-5", byWatchScore);
  const pick4 = bestGame(scheduled, (game) => game.gameId === "pick-4", byWatchScore);
  const pick3 = bestGame(scheduled, (game) => game.gameId === "pick-3", byWatchScore);
  [largestJackpot, lifePrize, localJackpot, pick4, pick3].filter(Boolean).forEach((game) => seeds.push(game));

  const lines = [];
  let total = 0;
  uniqueDrawGames(seeds).forEach((game) => {
    if (total + game.ticketPrice > target) return;
    addDrawLine(lines, game, game.bestFor || "Scheduled draw-game variety");
    total += game.ticketPrice;
  });

  const repeatOrder = ["cash-5", "pick-3", "pick-4"];
  const fillPool = [...scheduled].sort((a, b) => {
    const indexA = repeatOrder.indexOf(a.gameId);
    const indexB = repeatOrder.indexOf(b.gameId);
    if (indexA !== -1 || indexB !== -1) return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    return a.ticketPrice - b.ticketPrice || byWatchScore(a, b);
  });
  while (total < target) {
    const remaining = target - total;
    const game = fillPool
      .filter((item) => item.ticketPrice <= remaining)
      .sort((a, b) => {
        const quantityA = lines.find((line) => line.game.gameId === a.gameId)?.quantity || 0;
        const quantityB = lines.find((line) => line.game.gameId === b.gameId)?.quantity || 0;
        return quantityA - quantityB || fillPool.indexOf(a) - fillPool.indexOf(b);
      })[0];
    if (!game) break;
    addDrawLine(lines, game, "Additional play to complete the draw-game allocation");
    total += game.ticketPrice;
  }

  return {
    budget: target,
    total,
    playCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    lines: lines.map((line) => ({ ...line, subtotal: line.quantity * line.game.ticketPrice })),
  };
}

function uniqueDrawGames(games) {
  const seen = new Set();
  return games.filter((game) => {
    if (!game || seen.has(game.gameId)) return false;
    seen.add(game.gameId);
    return true;
  });
}

export function buildDailyPlayPlan({ budget = 60, zip, date = new Date() }, scratchGames, drawGames, locations) {
  const dailyBudget = Math.max(10, Math.floor(Number(budget) || 60));
  const drawBudget = Math.min(15, Math.max(5, Math.round(dailyBudget * .25)));
  const scratchBudget = dailyBudget - drawBudget;
  const scratch = scratchPlan(scratchBudget, scratchGames);
  const draws = drawPlan(drawBudget, drawGames, date);
  const nearbyLocations = [...locations]
    .sort((a, b) => {
      if (a.distance === null || a.distance === undefined) return 1;
      if (b.distance === null || b.distance === undefined) return -1;
      return a.distance - b.distance || b.wins - a.wins;
    })
    .slice(0, 3);
  const total = scratch.total + draws.total;

  return {
    budget: dailyBudget,
    total,
    remaining: dailyBudget - total,
    zip,
    scratch,
    draws,
    locations: nearbyLocations,
    dateLabel: new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date),
    warning: "Treat this as a hard entertainment limit. Lottery outcomes are random; stop at $60 and never chase losses.",
  };
}
