import { Activity, ShieldAlert, TrendingUp, Trophy } from "lucide-react";
import type { OddsQuote } from "../providers/oddsProvider";
import type { SportsEvent } from "../providers/sportsEventsProvider";
import { impliedProbability } from "../utils/impliedProbability";

export default function SportsContextPanel({ events, odds }: { events: SportsEvent[]; odds: OddsQuote[] }) {
  const moneylineOdds = odds.filter((quote) => quote.market === "moneyline" && quote.homeOdds);
  const averageHomeProbability = moneylineOdds.length
    ? moneylineOdds.reduce((sum, quote) => sum + impliedProbability(quote.homeOdds ?? 0), 0) / moneylineOdds.length
    : 0;

  return (
    <div className="sports-context-grid">
      <article className="context-card">
        <div><Trophy size={17} /> Nearby Team Performance</div>
        <strong>{events.length} tracked events</strong>
        <p>Regional event slate is modeled from public/demo sports adapters until live provider keys are added.</p>
        <div className="mini-bars"><span /><span /><span /><span /></div>
      </article>
      <article className="context-card">
        <div><TrendingUp size={17} /> Odds Market Pulse</div>
        <strong>{averageHomeProbability ? `${(averageHomeProbability * 100).toFixed(1)}%` : "Pending"}</strong>
        <p>Average home implied probability across visible moneyline markets. Informational analysis only.</p>
        <div className="sparkline" />
      </article>
      <article className="context-card">
        <div><Activity size={17} /> Market Sentiment</div>
        <strong>{odds.length} public odds quotes</strong>
        <p>Provider comparison stays descriptive. ZipScope does not recommend bets.</p>
        <div className="donut-signal" />
      </article>
      <article className="context-card">
        <div><ShieldAlert size={17} /> Responsible Use Monitor</div>
        <strong>Advisory lock active</strong>
        <p>Betting advice generation is disabled. Odds are displayed for public-market intelligence.</p>
        <div className="risk-lines"><span /><span /><span /></div>
      </article>
    </div>
  );
}
