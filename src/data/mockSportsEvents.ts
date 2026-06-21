import { SportsEvent } from "../providers/sportsEventsProvider";

export const mockSportsEvents: SportsEvent[] = [
  {
    id: "evt-atl-nba-1",
    league: "NBA",
    eventType: "Regular Season",
    homeTeam: "Atlanta Hawks",
    awayTeam: "Boston Celtics",
    startsAt: "2026-06-03T23:30:00.000Z",
    venue: "State Farm Arena",
    location: "Atlanta, GA",
  },
  {
    id: "evt-mlb-1",
    league: "MLB",
    eventType: "Regular Season",
    homeTeam: "Atlanta Braves",
    awayTeam: "New York Mets",
    startsAt: "2026-06-04T23:20:00.000Z",
    venue: "Truist Park",
    location: "Atlanta, GA",
  },
  {
    id: "evt-mls-1",
    league: "Soccer",
    eventType: "League Match",
    homeTeam: "Atlanta United",
    awayTeam: "Inter Miami",
    startsAt: "2026-06-07T00:00:00.000Z",
    venue: "Mercedes-Benz Stadium",
    location: "Atlanta, GA",
  },
  {
    id: "evt-cfb-1",
    league: "NCAA Football",
    eventType: "Season Opener",
    homeTeam: "Georgia Tech",
    awayTeam: "Clemson",
    startsAt: "2026-09-05T19:30:00.000Z",
    venue: "Bobby Dodd Stadium",
    location: "Atlanta, GA",
  }
];
