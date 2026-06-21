import { mockOdds } from "../data/mockOdds";

export type OddsMarket = "moneyline" | "spread" | "totals";

export type OddsQuote = {
  eventId: string;
  provider: string;
  market: OddsMarket;
  homeOdds?: number;
  awayOdds?: number;
  drawOdds?: number;
  overOdds?: number;
  underOdds?: number;
  spread?: number;
  total?: number;
  lastUpdated: string;
};

export async function fetchOdds(): Promise<{ odds: OddsQuote[]; mode: "real" | "mock"; lastUpdated: string; source: string }> {
  const key = import.meta.env.VITE_ODDS_API_KEY;
  if (!key) {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    return {
      odds: mockOdds,
      mode: "mock",
      source: "Mock public odds provider adapter",
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    odds: mockOdds,
    mode: "mock",
    source: "Odds API key detected; adapter ready for real sportsbook normalization",
    lastUpdated: new Date().toISOString(),
  };
}
