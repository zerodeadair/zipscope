import { mockSportsEvents } from "../data/mockSportsEvents";

export type SportsEvent = {
  id: string;
  league: string;
  eventType: string;
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  venue: string;
  location: string;
};

export async function fetchSportsEvents(): Promise<{ events: SportsEvent[]; mode: "real" | "mock"; lastUpdated: string; source: string }> {
  const key = import.meta.env.VITE_SPORTS_API_KEY;
  if (!key) {
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    return {
      events: mockSportsEvents,
      mode: "mock",
      source: "Mock public sports-event adapter",
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    events: mockSportsEvents,
    mode: "mock",
    source: "Sports API key detected; adapter ready for provider mapping",
    lastUpdated: new Date().toISOString(),
  };
}
