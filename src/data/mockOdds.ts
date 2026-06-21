import { OddsQuote } from "../providers/oddsProvider";

export const mockOdds: OddsQuote[] = [
  { eventId: "evt-atl-nba-1", provider: "DemoBook Alpha", market: "moneyline", homeOdds: -125, awayOdds: 105, lastUpdated: new Date().toISOString() },
  { eventId: "evt-atl-nba-1", provider: "DemoBook Beta", market: "spread", homeOdds: -110, awayOdds: -110, spread: -2.5, lastUpdated: new Date().toISOString() },
  { eventId: "evt-atl-nba-1", provider: "DemoBook Gamma", market: "totals", overOdds: -108, underOdds: -112, total: 224.5, lastUpdated: new Date().toISOString() },
  { eventId: "evt-mlb-1", provider: "DemoBook Alpha", market: "moneyline", homeOdds: -138, awayOdds: 118, lastUpdated: new Date().toISOString() },
  { eventId: "evt-mlb-1", provider: "DemoBook Beta", market: "spread", homeOdds: 102, awayOdds: -122, spread: -1.5, lastUpdated: new Date().toISOString() },
  { eventId: "evt-mls-1", provider: "DemoBook Alpha", market: "moneyline", homeOdds: 145, awayOdds: 185, drawOdds: 220, lastUpdated: new Date().toISOString() },
  { eventId: "evt-cfb-1", provider: "DemoBook Gamma", market: "totals", overOdds: -110, underOdds: -110, total: 51.5, lastUpdated: new Date().toISOString() }
];
