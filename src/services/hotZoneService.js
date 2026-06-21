export function hotZones(winners) {
  const cities = groupBy(winners, "retailerCity");
  const counties = groupBy(winners, "county");
  return {
    cities: rank(cities),
    counties: rank(counties),
    highValue: winners.filter((winner) => winner.prizeAmount >= 100000).sort((a, b) => b.prizeAmount - a.prizeAmount),
  };
}

function groupBy(items, key) {
  return items.reduce((map, item) => {
    const name = item[key] || "Unknown";
    const current = map.get(name) || { name, count: 0, totalPrize: 0, largestPrize: 0 };
    const prize = item.prizeAmount || item.prize || 0;
    current.count += 1;
    current.totalPrize += prize;
    current.largestPrize = Math.max(current.largestPrize, prize);
    map.set(name, current);
    return map;
  }, new Map());
}

function rank(map) {
  return [...map.values()].sort((a, b) => b.count - a.count || b.totalPrize - a.totalPrize);
}
