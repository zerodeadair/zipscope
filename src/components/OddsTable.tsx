import { OddsQuote } from "../providers/oddsProvider";
import { SportsEvent } from "../providers/sportsEventsProvider";
import { impliedProbability } from "../utils/impliedProbability";

export default function OddsTable({ events, odds }: { events: SportsEvent[]; odds: OddsQuote[] }) {
  const eventById = new Map(events.map((event) => [event.id, event]));

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Odds Comparison</span>
        <h2>Public provider analytics</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Provider</th>
              <th>Market</th>
              <th>Line</th>
              <th>Home</th>
              <th>Away</th>
              <th>Implied Home</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {odds.map((quote, index) => {
              const event = eventById.get(quote.eventId);
              return (
                <tr key={`${quote.eventId}-${quote.provider}-${quote.market}-${index}`}>
                  <td>{event ? `${event.awayTeam} at ${event.homeTeam}` : quote.eventId}</td>
                  <td>{quote.provider}</td>
                  <td>{quote.market}</td>
                  <td>{quote.spread ? `Spread ${quote.spread}` : quote.total ? `Total ${quote.total}` : quote.drawOdds ? `Draw ${quote.drawOdds}` : "Moneyline"}</td>
                  <td>{quote.homeOdds ?? quote.overOdds ?? "-"}</td>
                  <td>{quote.awayOdds ?? quote.underOdds ?? "-"}</td>
                  <td>{quote.homeOdds ? `${(impliedProbability(quote.homeOdds) * 100).toFixed(1)}%` : "-"}</td>
                  <td>{new Date(quote.lastUpdated).toLocaleTimeString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
