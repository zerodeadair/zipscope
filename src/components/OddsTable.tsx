import { OddsQuote } from "../providers/oddsProvider";
import { SportsEvent } from "../providers/sportsEventsProvider";
import { impliedProbability } from "../utils/impliedProbability";

export default function OddsTable({ events, odds, showDemoNote = true }: { events: SportsEvent[]; odds: OddsQuote[]; showDemoNote?: boolean }) {
  const eventById = new Map(events.map((event) => [event.id, event]));

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Odds Comparison</span>
        <h2>Demo provider odds comparison</h2>
        {showDemoNote && <p className="source-note">Demonstration quotes, not live betting prices. Implied percentages are calculated from sample odds, not win forecasts; “Demo loaded” records the sample load time.</p>}
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
              <th>Demo loaded</th>
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
                  <td role="cell" data-label="Line">{quote.spread ? `Spread ${quote.spread}` : quote.total ? `Total ${quote.total}` : quote.drawOdds ? `Draw ${quote.drawOdds}` : "Moneyline"}</td>
                  <td role="cell" data-label="Home">{quote.homeOdds ?? quote.overOdds ?? "-"}</td>
                  <td role="cell" data-label="Away">{quote.awayOdds ?? quote.underOdds ?? "-"}</td>
                  <td role="cell" data-label="Implied Home">{quote.homeOdds ? `${(impliedProbability(quote.homeOdds) * 100).toFixed(1)}%` : "-"}</td>
                  <td role="cell" data-label="Demo loaded"><time dateTime={quote.lastUpdated}>{new Date(quote.lastUpdated).toLocaleTimeString()}</time></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
