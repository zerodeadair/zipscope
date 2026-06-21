function oddsNumber(game) {
  return Number(game.overallOdds?.match(/[\d.]+$/)?.[0] || 99);
}

export function budgetPlan({ budget, price, goal, pickCount = 5 }, games) {
  const dailyBudget = Math.max(0, Number(budget || 0));
  const maxTicketPrice = Math.max(1, Number(price || 1));
  const maxTickets = Math.max(0, Math.floor(dailyBudget / maxTicketPrice));
  const pool = games
    .filter((game) => game.price <= maxTicketPrice)
    .filter((game) => goal === "avoid-top-gone" ? game.intelligence.topPrizesRemaining > 0 : true)
    .sort((a, b) => {
      if (goal === "jackpot") return b.topPrizeAmount - a.topPrizeAmount;
      if (goal === "low-cost") return a.price - b.price || b.intelligence.score - a.intelligence.score;
      if (goal === "best-odds") return oddsNumber(a) - oddsNumber(b);
      if (goal === "variety") return a.price - b.price || b.intelligence.score - a.intelligence.score;
      return (b.intelligence.score + b.intelligence.valuePerDollar * 20 - oddsNumber(b)) - (a.intelligence.score + a.intelligence.valuePerDollar * 20 - oddsNumber(a));
    });
  const suggestions = [];
  let running = 0;
  for (const game of pool) {
    if (running + game.price <= dailyBudget) {
      running += game.price;
      suggestions.push({
        game,
        reason: `${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes visible, ${game.overallOdds} odds, ${game.intelligence.label}`,
      });
    }
    if (suggestions.length >= Number(pickCount || 5)) break;
  }
  return {
    dailyBudget,
    maxTickets,
    totalCost: running,
    games: suggestions.map((item) => item.game),
    suggestions,
    remaining: Math.max(0, dailyBudget - running),
    warning: "Set a daily limit, stop at budget, and do not chase losses. Lottery outcomes are random.",
  };
}
