import { drawDataHealth, drawGameSources, drawGames } from "../data/drawGamesData.js";

const compactMoney = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function oddsDenominator(odds) {
  const text = String(odds || "").toLowerCase().replace(/,/g, "");
  const match = text.match(/1\s+in\s+([\d.]+)\s*([mk])?/);
  if (!match) return 9999999;
  const scale = match[2] === "m" ? 1000000 : match[2] === "k" ? 1000 : 1;
  return Number(match[1]) * scale;
}

function heatLabel(score) {
  if (score >= 92) return "Historic";
  if (score >= 78) return "Massive";
  if (score >= 62) return "Hot";
  if (score >= 42) return "Warming Up";
  return "Cold";
}

export function scoreDrawGame(game) {
  const range = game.historicalRange || { low: 0, high: game.jackpotAmount || 1 };
  const rangeScore = range.high === range.low ? 0.65 : (game.jackpotAmount - range.low) / Math.max(1, range.high - range.low);
  const endedPenalty = game.status === "ended" ? -58 : 0;
  const topPrizeWeight = game.isJackpotGame ? 1 : 0.72;
  const jackpotScore = clamp((Math.min(1, Math.log10(game.jackpotAmount + 1) / 9.35) * 70 + rangeScore * 30) * topPrizeWeight + endedPenalty);
  const oddsScore = clamp(100 - Math.log10(oddsDenominator(game.oddsJackpot)) * 8 + Math.max(0, 18 - game.ticketPrice * 3));
  const frequencyScore = clamp((game.drawDays?.includes("Every 4 minutes") ? 92 : game.drawDays?.includes("Daily") || game.drawDays?.includes("Twice daily") ? 78 : 48) + Math.min(18, game.rolloverCount * 2) + endedPenalty);
  const valueScore = clamp((jackpotScore * 0.48) + (oddsScore * 0.24) + (100 / Math.max(1, game.ticketPrice) * 0.28));
  const excitementScore = clamp(jackpotScore * 0.58 + Math.min(100, game.rolloverCount * 9) * 0.25 + frequencyScore * 0.17);
  const overallWatchScore = clamp(jackpotScore * 0.26 + oddsScore * 0.2 + frequencyScore * 0.16 + valueScore * 0.18 + excitementScore * 0.2);
  return {
    jackpotScore,
    oddsScore,
    frequencyScore,
    valueScore,
    excitementScore,
    overallWatchScore,
    heatLabel: heatLabel(excitementScore),
    jackpotDisplay: game.jackpotLabel || `$${compactMoney.format(game.jackpotAmount)}`,
    cashDisplay: game.cashValue ? `$${compactMoney.format(game.cashValue)}` : "N/A",
    bestRealisticPrizeZone: game.prizeTiers?.[1]?.prize || game.prizeTiers?.[0]?.prize || "Prize tiers vary",
    entertainmentRating: clamp(valueScore * 0.52 + frequencyScore * 0.28 + oddsScore * 0.2),
  };
}

export function getDrawSnapshot() {
  const unavailableGames = drawGames.filter((game) => game.dataAvailability === "unavailable");
  const games = drawGames
    .filter((game) => game.status !== "ended" && game.dataAvailability !== "unavailable")
    .map((game) => ({ ...game, intelligence: scoreDrawGame(game) }))
    .sort((a, b) => b.intelligence.overallWatchScore - a.intelligence.overallWatchScore);
  const jackpotGames = games.filter((game) => game.status !== "ended" && game.isJackpotGame);
  return {
    dataHealth: drawDataHealth,
    officialSources: drawGameSources,
    games,
    unavailableGames,
    stats: {
      trackedGames: games.length,
      biggestJackpot: Math.max(...jackpotGames.map((game) => game.jackpotAmount)),
      bestWatchScore: Math.max(...games.map((game) => game.intelligence.overallWatchScore)),
      drawTonight: games.filter((game) => game.status !== "ended" && game.nextDrawDate && new Date(game.nextDrawDate).toDateString() === new Date().toDateString()).length,
    },
  };
}

function numberPool(game) {
  const max = game.maxNumber || (game.gameId.includes("pick-3") ? 9 : game.gameId.includes("pick-4") ? 9 : 69);
  return Array.from({ length: max + (max === 9 ? 1 : 0) }, (_, index) => max === 9 ? index : index + 1);
}

function randomIndex(max) {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0] % max;
  }
  console.warn("Secure random values unavailable; using Math.random for entertainment quick pick.");
  return Math.floor(Math.random() * max);
}

function randomPick(pool, count) {
  const selected = [];
  const working = [...pool];
  while (selected.length < count && working.length) {
    selected.push(working.splice(randomIndex(working.length), 1)[0]);
  }
  return selected.sort((a, b) => a - b);
}

function spreadPick(pool, count) {
  const selected = [];
  const size = Math.ceil(pool.length / count);
  for (let index = 0; index < count; index += 1) {
    const band = pool.slice(index * size, Math.min(pool.length, (index + 1) * size)).filter((number) => !selected.includes(number));
    if (band.length) selected.push(band[randomIndex(band.length)]);
  }
  if (selected.length < count) {
    const remaining = pool.filter((number) => !selected.includes(number));
    selected.push(...randomPick(remaining, count - selected.length));
  }
  return selected.sort((a, b) => a - b);
}

function balancedPick(pool, count) {
  const midpoint = (pool[0] + pool[pool.length - 1]) / 2;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const candidate = randomPick(pool, count);
    const lows = candidate.filter((number) => number <= midpoint).length;
    const odds = candidate.filter((number) => number % 2).length;
    const lowTarget = Math.floor(count / 2);
    if (Math.abs(lows - lowTarget) <= 1 && Math.abs(odds - lowTarget) <= 1) return candidate;
  }
  return randomPick(pool, count);
}

export function generateSmartPick(game, requestedMode = "random") {
  const pickCount = game.pickCount || (game.gameId.includes("pick-3") ? 3 : game.gameId.includes("pick-4") ? 4 : 5);
  const generatedAt = Date.now();
  const mode = ["balanced", "spread", "random"].includes(requestedMode) ? requestedMode : "random";
  const pool = numberPool(game);
  const numbers = mode === "spread" ? spreadPick(pool, pickCount) : mode === "balanced" ? balancedPick(pool, pickCount) : randomPick(pool, pickCount);
  const bonusMax = game.gameId === "powerball" ? 26 : game.gameId === "mega-millions" ? 24 : game.gameId === "millionaire-for-life" ? 5 : 0;
  const bonusNumber = bonusMax ? randomPick(Array.from({ length: bonusMax }, (_, index) => index + 1), 1)[0] : null;
  const note = mode === "spread"
    ? "Wide-spread number shape. For entertainment only; it does not improve odds."
    : mode === "balanced"
      ? "Balanced low/high and odd/even shape. For entertainment only; it does not improve odds."
      : "Pure random quick pick. For entertainment only.";
  return {
    id: `${game.gameId}-${mode}-${generatedAt}`,
    gameId: game.gameId,
    gameName: game.gameName,
    mode,
    numbers,
    bonusNumber,
    drawDate: game.nextDrawDate,
    notes: note,
    savedAt: new Date().toISOString(),
    favorite: false,
  };
}
