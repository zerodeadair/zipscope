import { CalendarDays, Filter, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { OddsMarket, OddsQuote } from "../providers/oddsProvider";
import { SportsEvent } from "../providers/sportsEventsProvider";
import OddsTable from "./OddsTable";
import SportsContextPanel from "./SportsContextPanel";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL", "NCAA Football", "NCAA Basketball", "Soccer", "UFC"];
const markets: ("all" | OddsMarket)[] = ["all", "moneyline", "spread", "totals"];

export default function SportsDashboard({ events, odds }: { events: SportsEvent[]; odds: OddsQuote[] }) {
  const [league, setLeague] = useState("All");
  const [market, setMarket] = useState<"all" | OddsMarket>("all");
  const [team, setTeam] = useState("");
  const [days, setDays] = useState("120");

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    const until = now + Number(days) * 24 * 60 * 60 * 1000;
    return events.filter((event) => {
      const eventTime = new Date(event.startsAt).getTime();
      const teamMatch = `${event.homeTeam} ${event.awayTeam}`.toLowerCase().includes(team.toLowerCase());
      return (league === "All" || event.league === league) && teamMatch && eventTime >= now && eventTime <= until;
    });
  }, [days, events, league, team]);

  const filteredIds = new Set(filteredEvents.map((event) => event.id));
  const filteredOdds = odds.filter((quote) => filteredIds.has(quote.eventId) && (market === "all" || quote.market === market));

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Secondary Sports Intelligence</span>
        <h2>Upcoming events and public odds</h2>
      </div>
      <div className="filters">
        <label><Filter size={15} /> League<select value={league} onChange={(event) => setLeague(event.target.value)}>{leagues.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Market<select value={market} onChange={(event) => setMarket(event.target.value as "all" | OddsMarket)}>{markets.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Date range<select value={days} onChange={(event) => setDays(event.target.value)}><option value="14">Next 14 days</option><option value="30">Next 30 days</option><option value="120">Next 120 days</option><option value="240">Next 240 days</option></select></label>
        <label>Team<input value={team} onChange={(event) => setTeam(event.target.value)} placeholder="Filter team" /></label>
      </div>
      <div className="event-grid">
        {filteredEvents.map((event) => (
          <article className="event-card" key={event.id}>
            <span>{event.league} | {event.eventType}</span>
            <h3>{event.awayTeam} at {event.homeTeam}</h3>
            <p><CalendarDays size={15} /> {new Date(event.startsAt).toLocaleString()}</p>
            <p><MapPin size={15} /> {event.venue}, {event.location}</p>
          </article>
        ))}
      </div>
      <SportsContextPanel events={filteredEvents} odds={filteredOdds} />
      <OddsTable events={filteredEvents} odds={filteredOdds} />
      <div className="responsible-note">Public odds are shown for informational analysis only. ZipScope does not provide betting advice.</div>
    </section>
  );
}
