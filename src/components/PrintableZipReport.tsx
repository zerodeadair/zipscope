import type { OddsQuote } from "../providers/oddsProvider";
import type { SportsEvent } from "../providers/sportsEventsProvider";
import type { DemographicProfile } from "../types/demographics";
import { buildPremiumSignals, buildSimilarAreas, buildSourceConfidence, buildTopInsights } from "../utils/demographicIntelligence";
import { formatNumber, formatOptionalCurrency, formatOptionalPercent, localMarketScore } from "../utils/formatters";
import { buildDemographicTiles } from "./DemographicsDashboard";

type Props = {
  events: SportsEvent[];
  odds: OddsQuote[];
  pinnedTileIds: string[];
  profile: DemographicProfile;
};

export default function PrintableZipReport({ events, odds, pinnedTileIds, profile }: Props) {
  const similarAreas = buildSimilarAreas(profile);
  const signals = buildPremiumSignals(profile);
  const confidence = buildSourceConfidence(profile);
  const score = localMarketScore(profile);
  const insights = buildTopInsights(profile).slice(0, 3);
  const raceGroups = [...profile.raceEthnicity].filter((group) => group.value > 0).sort((a, b) => b.value - a.value).slice(0, 4);
  const sportsItems = events.slice(0, 3);
  const oddsItems = odds.slice(0, 3);
  const allTiles = buildDemographicTiles(profile);
  const pinnedTiles = pinnedTileIds.length
    ? pinnedTileIds.map((id) => allTiles.find((tile) => tile.id === id)).filter((tile): tile is NonNullable<typeof tile> => Boolean(tile)).slice(0, 18)
    : allTiles.filter((tile) => ["population", "median-income", "home-income", "growth-opportunity", "sports-fan-intensity"].includes(tile.id));

  const facts = [
    ["Population", formatNumber(profile.population)],
    ["Median income", formatOptionalCurrency(profile.medianHouseholdIncome)],
    ["Median age", profile.medianAge === null ? "Unavailable" : profile.medianAge.toFixed(1)],
    ["Home value", formatOptionalCurrency(profile.medianHomeValue)],
    ["Poverty", formatOptionalPercent(profile.povertyRate)],
    ["High school+", formatOptionalPercent(profile.highSchoolGradRate)],
    ["Bachelor's+", formatOptionalPercent(profile.bachelorsOrHigherRate)],
    ["Avg commute", profile.averageCommuteMinutes === null ? "Unavailable" : `${profile.averageCommuteMinutes.toFixed(1)} min`],
    ["Housing units", profile.housingUnits === null ? "Unavailable" : formatNumber(profile.housingUnits)],
    ["Owner occupied", formatOptionalPercent(profile.ownerOccupiedRate)],
    ["Vacancy", formatOptionalPercent(profile.vacancyRate)],
    ["Source year", profile.sourceYear],
  ];

  return (
    <section className="print-report export-report" id="zipscope-export-report" aria-label={`Exportable ZIP report for ${profile.zip}`}>
      <header className="export-report-hero">
        <div className="export-brand-block">
          <span className="export-kicker">ZipScope Sports Intel</span>
          <h1>ZIP {profile.zip}</h1>
          <p>{profile.displayName}</p>
          <div className="export-chip-row">
            <span>{profile.sourceName}</span>
            <span>ZCTA {profile.zcta}</span>
            <span>{new Date(profile.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="export-score-card">
          <span>Market signal</span>
          <strong>{score}</strong>
          <p>{confidence.score}% source coverage</p>
          <i><b style={{ width: `${confidence.score}%` }} /></i>
        </div>
      </header>

      <section className="export-section export-insight-band">
        <div>
          <span className="export-kicker">Top ZIP read</span>
          <h2>Executive snapshot</h2>
        </div>
        <div className="export-insight-list">
          {insights.map((insight) => <p key={insight}>{insight}</p>)}
        </div>
      </section>

      <section className="export-section">
        <div className="export-section-heading">
          <span className="export-kicker">Core snapshot</span>
          <h2>Demographic and housing facts</h2>
        </div>
        <div className="export-kpi-grid">
          {facts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="export-section">
        <div className="export-section-heading">
          <span className="export-kicker">Pinned intelligence</span>
          <h2>{pinnedTiles.length} report tiles</h2>
        </div>
        <div className="export-tile-grid">
          {pinnedTiles.map((tile) => (
            <article key={tile.id}>
              <div>
                <span>{tile.category}</span>
                <em>{tile.status}</em>
              </div>
              <strong>{tile.value}</strong>
              <h3>{tile.label}</h3>
              <p>{tile.detail}</p>
              <small>{tile.confidence}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="export-two-column">
        <div className="export-section">
          <div className="export-section-heading">
            <span className="export-kicker">Premium signals</span>
            <h2>Market context</h2>
          </div>
          <div className="export-signal-list">
            {signals.slice(0, 6).map((signal) => (
              <div key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <i><b style={{ width: `${signal.score}%` }} /></i>
              </div>
            ))}
          </div>
        </div>

        <div className="export-section">
          <div className="export-section-heading">
            <span className="export-kicker">Composition</span>
            <h2>Population mix</h2>
          </div>
          <div className="export-signal-list">
            {raceGroups.length ? raceGroups.map((group) => (
              <div key={group.label}>
                <span>{group.label}</span>
                <strong>{group.value.toFixed(1)}%</strong>
                <i><b style={{ width: `${group.value}%` }} /></i>
              </div>
            )) : <p>Race / ethnicity estimates unavailable.</p>}
          </div>
        </div>
      </section>

      <section className="export-section">
        <div className="export-section-heading">
          <span className="export-kicker">Similar Areas Beta</span>
          <h2>Comparable ZIP preview</h2>
        </div>
        <div className="export-similar-grid">
          {similarAreas.map((area) => (
            <article key={area.zip}>
              <div>
                <strong>{area.zip}</strong>
                <span>{area.matchScore}% match</span>
              </div>
              <h3>{area.city}, {area.stateCode}</h3>
              <p>{area.similarities.join(" / ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="export-two-column export-sports-row">
        <div className="export-section">
          <div className="export-section-heading">
            <span className="export-kicker">Sports context</span>
            <h2>Nearby event signals</h2>
          </div>
          <div className="export-text-stack">
            {sportsItems.length ? sportsItems.map((event) => (
              <p key={event.id}>{event.awayTeam} at {event.homeTeam} / {event.league}</p>
            )) : <p>Sports events unavailable.</p>}
          </div>
        </div>
        <div className="export-section">
          <div className="export-section-heading">
            <span className="export-kicker">Odds snapshot</span>
            <h2>Market lines</h2>
          </div>
          <div className="export-text-stack">
            {oddsItems.length ? oddsItems.map((quote) => (
              <p key={`${quote.eventId}-${quote.provider}-${quote.market}`}>
                {quote.provider} / {quote.market} / {formatOddsQuote(quote)}
              </p>
            )) : <p>Odds unavailable.</p>}
          </div>
        </div>
      </section>

      <footer className="print-report-footer export-report-footer">
        <span>{profile.sourceName}; ZIP approximated as Census ZCTA {profile.zcta}. Last checked {new Date(profile.lastUpdated).toLocaleDateString()}.</span>
        <span>Estimated, beta, mock, and coming-soon values are directional planning signals, not official determinations.</span>
      </footer>
    </section>
  );
}

function formatOddsQuote(quote: OddsQuote) {
  if (quote.market === "totals") {
    return `total ${quote.total ?? "n/a"}`;
  }
  if (quote.market === "spread") {
    return `spread ${quote.spread ?? "n/a"}`;
  }
  const values = [quote.homeOdds, quote.awayOdds, quote.drawOdds].filter((value) => value !== undefined);
  return values.length ? values.join(" / ") : "odds pending";
}
