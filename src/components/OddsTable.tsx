import MetricProvenance from "./MetricProvenance";
import { OddsQuote } from "../providers/oddsProvider";
import { SportsEvent } from "../providers/sportsEventsProvider";
import { impliedProbability } from "../utils/impliedProbability";

export default function OddsTable({ events, odds }: { events: SportsEvent[]; odds: OddsQuote[] }) {
  const eventById = new Map(events.map((event) => [event.id, event]));

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Odds Comparison</span>
        <h2>Provider odds comparison</h2>
      </div>
      <div className="table-wrap">
        <table role="table">
          <thead role="rowgroup">
            <tr role="row">
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
          <tbody role="rowgroup">
            {odds.map((quote, index) => {
              const event = eventById.get(quote.eventId);
              return (
                <tr role="row" key={`${quote.eventId}-${quote.provider}-${quote.market}-${index}`}>
                  <td role="cell" data-label="Event">{event ? `${event.awayTeam} at ${event.homeTeam}` : quote.eventId}</td>
                  <td role="cell" data-label="Provider">{quote.provider}</td>
                  <td role="cell" data-label="Market">{quote.market}</td>
                  <td role="cell" data-label="Line">{quote.spread ? `Spread ${quote.spread}` : quote.total ? `Total ${quote.total}` : quote.drawOdds ? `Draw ${quote.drawOdds}` : "Moneyline"}{(quote.spread ?? quote.total ?? quote.drawOdds) !== undefined && <MetricProvenance>Beta</MetricProvenance>}</td>
                  <td role="cell" data-label="Home">{quote.homeOdds ?? quote.overOdds ?? "-"}{(quote.homeOdds ?? quote.overOdds) !== undefined && <MetricProvenance>Beta</MetricProvenance>}</td>
                  <td role="cell" data-label="Away">{quote.awayOdds ?? quote.underOdds ?? "-"}{(quote.awayOdds ?? quote.underOdds) !== undefined && <MetricProvenance>Beta</MetricProvenance>}</td>
                  <td role="cell" data-label="Implied Home">{quote.homeOdds ? `${(impliedProbability(quote.homeOdds) * 100).toFixed(1)}%` : "-"}{quote.homeOdds !== undefined && <MetricProvenance>Beta</MetricProvenance>}</td>
                  <td role="cell" data-label="Updated">{new Date(quote.lastUpdated).toLocaleTimeString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
