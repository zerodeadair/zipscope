function oddsNumber(odds) {
  const match = String(odds || "").match(/([\d.]+)\s*$/);
  return match ? Number(match[1]) : 5;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysSince(dateText) {
  if (!dateText) return 0;
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

export function scoreGame(game) {
  const topTier = game.prizeTiers?.[0] || { total: game.originalTopPrizes || 0, remaining: game.topPrizesRemaining || 0 };
  const topRatio = topTier.total ? topTier.remaining / topTier.total : 0;
  const topPrizesRemaining = topTier.remaining || 0;
  const originalTopPrizes = topTier.total || 0;
  const midTierDepth = (game.prizeTiers || []).slice(1).reduce((sum, tier) => sum + (tier.remaining || 0), 0);
  const originalVisiblePrizes = (game.prizeTiers || []).reduce((sum, tier) => sum + (tier.total || 0), 0);
  const remainingVisiblePrizes = (game.prizeTiers || []).reduce((sum, tier) => sum + (tier.remaining || 0), 0);
  const displayedProfitTiers = (game.prizeTiers || []).filter((tier) => tier.amount > game.price);
  const displayedBreakEvenTiers = (game.prizeTiers || []).filter((tier) => tier.amount === game.price);
  const displayedProfitPrizes = displayedProfitTiers.reduce((sum, tier) => sum + (tier.remaining || 0), 0);
  const displayedBreakEvenPrizes = displayedBreakEvenTiers.reduce((sum, tier) => sum + (tier.remaining || 0), 0);
  const displayedProfitShare = remainingVisiblePrizes ? displayedProfitPrizes / remainingVisiblePrizes : 0;
  const largestRemainingTier = (game.prizeTiers || []).find((tier) => (tier.remaining || 0) > 0) || null;
  const inventoryRate = originalVisiblePrizes ? remainingVisiblePrizes / originalVisiblePrizes : 0;
  const claimRate = 1 - inventoryRate;
  const oddsQuality = Math.max(0, 1 - (oddsNumber(game.overallOdds) - 2.5) / 3);
  const costDiscipline = Math.max(0, 1 - game.price / 60);
  const prizeScale = Math.min(1, Math.log10(game.topPrizeAmount || 1) / 7);
  const valuePerDollar = Math.min(1, (game.topPrizeAmount || 0) / Math.max(1, game.price) / 120000);
  const freshness = game.dataState === "Official cached" || game.dataState === "Fresh" ? 1 : game.dataState === "Stale" ? 0.45 : 0.35;
  const ageDays = daysSince(game.launchDate);
  const newness = Math.max(0, 1 - ageDays / 180);
  const endingPenalty = game.status === "ending soon" ? -8 : 0;
  const topGonePenalty = topPrizesRemaining === 0 ? -42 : 0;
  const scoreFactors = [
    { id: "top-inventory", label: "Top-prize inventory", points: topRatio * 34, max: 34, detail: `${topPrizesRemaining} of ${originalTopPrizes} top prizes remain visible.` },
    { id: "odds", label: "Overall odds", points: oddsQuality * 14, max: 14, detail: `${game.overallOdds} compared with the active-ticket range.` },
    { id: "cost", label: "Cost discipline", points: costDiscipline * 8, max: 8, detail: `$${game.price} ticket cost; lower prices retain more points.` },
    { id: "prize", label: "Top-prize scale", points: prizeScale * 12, max: 12, detail: `${game.topPrizeText || game.topPrizeAmount} advertised top prize.` },
    { id: "value", label: "Prize-to-price value", points: valuePerDollar * 16, max: 16, detail: `${valueRatingForScore(valuePerDollar)} relative top-prize value per ticket dollar.` },
    { id: "depth", label: "Visible prize depth", points: Math.min(14, Math.log10(midTierDepth + 1) * 4), max: 14, detail: `${midTierDepth.toLocaleString()} non-top prizes remain in displayed tiers.` },
    { id: "data", label: "Data confidence", points: freshness * 12, max: 12, detail: `${game.dataState} with an official verification link.` },
  ];
  if (endingPenalty) scoreFactors.push({ id: "ending", label: "Ending-soon adjustment", points: endingPenalty, max: 0, detail: "Older or ending games receive a caution penalty." });
  if (topGonePenalty) scoreFactors.push({ id: "top-gone", label: "Top-prize-gone adjustment", points: topGonePenalty, max: 0, detail: "Games without visible top prizes receive a major penalty." });
  const score = clamp(
    scoreFactors.reduce((sum, factor) => sum + factor.points, 0)
  );
  const confidenceScore = Math.min(92, clamp(freshness * 54 + Math.min(18, (game.prizeTiers?.length || 0) * 3.6) + (game.sourceUrl ? 12 : 0) + (game.launchDate ? 8 : 0)));
  const trendScore = clamp(inventoryRate * 42 + topRatio * 28 + newness * 18 + oddsQuality * 12);
  const valueScore = clamp(valuePerDollar * 46 + oddsQuality * 24 + displayedProfitShare * 18 + costDiscipline * 12);
  const riskScore = clamp((game.price / 50) * 42 + (1 - topRatio) * 28 + (1 - freshness) * 18 + (game.status === "ending soon" ? 12 : 0));
  const prizeHealthScore = clamp(inventoryRate * 46 + topRatio * 34 + Math.min(20, Math.log10(midTierDepth + 1) * 5));
  const remainingPrizeStrength = clamp(inventoryRate * 55 + topRatio * 30 + Math.min(15, Math.log10(remainingVisiblePrizes + 1) * 3));
  const expectedValueIndex = clamp(displayedProfitShare * 42 + valuePerDollar * 28 + inventoryRate * 18 + oddsQuality * 12);
  const topPrizeAvailability = clamp(topRatio * 100);
  const midTierAvailability = clamp(inventoryRate * 72 + Math.min(28, Math.log10(midTierDepth + 1) * 7));
  const longevityScore = clamp(inventoryRate * 55 + (1 - newness) * 18 + topRatio * 27);
  const urgencyScore = clamp(claimRate * 48 + (1 - topRatio) * 34 + (game.status === "ending soon" ? 18 : 0));
  const momentumScore = trendScore;
  const bestBuyScore = clamp(score * .46 + valueScore * .24 + prizeHealthScore * .2 + (100 - riskScore) * .1);
  const metrics = [
    { id: "best-buy", label: "Best Buy", value: bestBuyScore, tone: "brand" },
    { id: "value", label: "Value", value: valueScore, tone: "success" },
    { id: "risk", label: "Risk", value: riskScore, tone: "risk", inverse: true },
    { id: "prize-health", label: "Prize Health", value: prizeHealthScore, tone: "brand" },
    { id: "remaining-strength", label: "Remaining Strength", value: remainingPrizeStrength, tone: "success" },
    { id: "ev-index", label: "EV Proxy", value: expectedValueIndex, tone: "gold" },
    { id: "top-prize", label: "Top Prize Availability", value: topPrizeAvailability, tone: "gold" },
    { id: "mid-tier", label: "Mid-Tier Availability", value: midTierAvailability, tone: "brand" },
    { id: "longevity", label: "Longevity", value: longevityScore, tone: "success" },
    { id: "urgency", label: "Urgency", value: urgencyScore, tone: "risk" },
    { id: "momentum", label: "Momentum", value: momentumScore, tone: "brand" },
  ];
  const valueRating = score >= 82 ? "Excellent" : score >= 72 ? "Strong" : score >= 60 ? "Good" : score >= 45 ? "Watch" : "Low";
  const trend = trendScore >= 78 ? "Rising" : trendScore >= 58 ? "Steady" : "Cooling";
  const badges = [
    game.isCurrentRelease ? "New" : "",
    score >= 82 ? "Best Value" : "",
    oddsNumber(game.overallOdds) <= 3.8 ? "Best Odds" : "",
    topPrizesRemaining > 0 && topRatio >= 0.9 ? "Top Prize Left" : "",
    score >= 72 && game.price <= 5 ? "Hidden Gem" : "",
    trendScore >= 76 ? "Hot" : "",
    game.status === "ending soon" ? "Ending Soon" : "",
    game.price >= 20 ? "High Risk" : "",
  ].filter(Boolean);
  return {
    score,
    confidence: game.dataState === "Official cached" ? "Medium" : game.confidence || "Low",
    confidenceScore,
    category: categoryFor(game, score),
    risk: game.price >= 20 ? "High ticket cost" : topPrizesRemaining === 0 ? "Verify first" : game.price <= 5 ? "Lower cost" : "Moderate",
    topRatio,
    topPrizesRemaining,
    originalTopPrizes,
    midTierDepth,
    originalVisiblePrizes,
    remainingVisiblePrizes,
    displayedProfitPrizes,
    displayedBreakEvenPrizes,
    displayedProfitTierCount: displayedProfitTiers.length,
    displayedBreakEvenTierCount: displayedBreakEvenTiers.length,
    displayedProfitShare,
    largestRemainingTier,
    inventoryRate,
    claimRate,
    ageDays,
    trend,
    trendScore,
    bestBuyScore,
    valueScore,
    riskScore,
    prizeHealthScore,
    remainingPrizeStrength,
    expectedValueIndex,
    topPrizeAvailability,
    midTierAvailability,
    longevityScore,
    urgencyScore,
    momentumScore,
    metrics,
    valueRating,
    badges,
    scoreFactors: scoreFactors.map((factor) => ({ ...factor, points: Math.round(factor.points * 10) / 10 })),
    valuePerDollar,
    label: score >= 90 ? "Elite Research Pick" : score >= 80 ? "Strong Public-Data Pick" : score >= 65 ? "Balanced Pick" : score >= 50 ? "Risky or Incomplete" : score >= 25 ? "Verify First" : "Avoid or Top Prizes Gone",
    summary: `Recommended because ${topPrizesRemaining} of ${originalTopPrizes} top prizes remain visible, the ticket has ${game.overallOdds} overall odds, and ${Math.round(inventoryRate * 100)}% of the displayed prize inventory remains.`,
    reasons: [
      `${topPrizesRemaining} of ${originalTopPrizes} top prizes are visible in the cached source table`,
      `${midTierDepth.toLocaleString()} visible prizes remain across cached non-top tiers`,
      `${game.overallOdds} overall odds field`,
      `${game.dataState} data state with official verification link`,
    ],
  };
}

function valueRatingForScore(value) {
  if (value >= .8) return "Excellent";
  if (value >= .6) return "Strong";
  if (value >= .35) return "Moderate";
  return "Limited";
}

export function categoryFor(game, score) {
  const topRemaining = game.prizeTiers?.[0]?.remaining ?? game.topPrizesRemaining ?? 0;
  if (topRemaining === 0) return "Top Prizes Gone";
  if (game.dataState !== "Fresh" && score < 55) return "Avoid / Verify First";
  if (game.price <= 5 && score >= 60) return "Best Low-Cost Play";
  if (game.topPrizeAmount >= 1000000 && topRemaining > 0) return "Best Jackpot Chase";
  if (game.price <= 10 && score >= 70) return "Best Value Play";
  return "Best Balanced Play";
}

export function rankedGames(games) {
  return games.map((game) => ({ ...game, intelligence: scoreGame(game) })).sort((a, b) => b.intelligence.score - a.intelligence.score);
}
