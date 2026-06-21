import { Gauge, RadioTower, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

type Horizon = "now" | "2030" | "2040";

type PulseCard = {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "violet" | "mint" | "blue";
};

const horizons: Horizon[] = ["now", "2030", "2040"];

export default function LocalPulseMatrix({ profile }: { profile: DemographicProfile }) {
  const [horizon, setHorizon] = useState<Horizon>("2030");
  const matrix = useMemo(() => buildPulseMatrix(profile, horizon), [profile, horizon]);

  return (
    <section className="local-pulse-matrix" aria-label="ZipScope local pulse matrix">
      <div className="pulse-orb" aria-hidden="true" />
      <div className="pulse-header">
        <div>
          <span className="beta-chip">Beta intelligence layer</span>
          <h2>{profile.displayName} local pulse matrix</h2>
          <p>Scenario signals are derived from sourced Census fields plus transparent client-side modeling. They are directional, not official forecasts.</p>
        </div>
        <div className="pulse-horizons" aria-label="Scenario horizon">
          {horizons.map((item) => (
            <button className={horizon === item ? "active" : ""} key={item} onClick={() => setHorizon(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="pulse-command-strip">
        <RadioTower size={17} />
        <strong>{matrix.command}</strong>
        <span>{profile.sourceName} / ZCTA {profile.zcta}</span>
      </div>

      <div className="pulse-grid">
        {matrix.cards.map((card) => (
          <article className={`pulse-card ${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="pulse-footer">
        <div>
          <Gauge size={16} />
          <span>Data confidence: sourced demographics, modeled scenario overlay</span>
        </div>
        <div>
          <ShieldCheck size={16} />
          <span>Experimental: not investment, civic, lending, insurance, or betting advice</span>
        </div>
      </div>
    </section>
  );
}

function buildPulseMatrix(profile: DemographicProfile, horizon: Horizon) {
  const multiplier = horizon === "now" ? 1 : horizon === "2030" ? 1.04 : 1.11;
  const population = Math.round(profile.population * multiplier);
  const income = profile.medianHouseholdIncome;
  const homeValue = profile.medianHomeValue;
  const poverty = profile.povertyRate;
  const education = profile.bachelorsOrHigherRate;
  const vacancy = profile.vacancyRate;
  const commute = profile.averageCommuteMinutes;
  const ratio = income && homeValue ? homeValue / income : null;
  const accessScore = scoreAccess({ commute, vacancy, poverty });

  const cards: PulseCard[] = [
    {
      label: "Population trajectory",
      value: formatNumber(population),
      detail: horizon === "now" ? "Current ACS population baseline." : `${horizon} scenario band using a conservative local-growth multiplier.`,
      tone: "cyan",
    },
    {
      label: "Affordability vector",
      value: ratio ? `${ratio.toFixed(1)}x` : "Pending",
      detail: ratio ? `${formatCurrency(homeValue ?? 0)} home value against ${formatCurrency(income ?? 0)} income.` : "Income or home value is unavailable from the source profile.",
      tone: ratio && ratio > 4 ? "violet" : "blue",
    },
    {
      label: "Workforce readiness",
      value: education === null ? "Pending" : formatPercent(education),
      detail: "Bachelor's+ share helps indicate knowledge-work depth, not individual opportunity.",
      tone: education !== null && education > 0.32 ? "mint" : "blue",
    },
    {
      label: "Access friction",
      value: `${accessScore}/100`,
      detail: "Composite of commute, vacancy, and poverty stress markers for planning context.",
      tone: accessScore > 58 ? "violet" : "cyan",
    },
  ];

  const command = [
    `${profile.zip} scenario ${horizon.toUpperCase()}`,
    poverty === null ? "poverty pending" : `${formatPercent(poverty)} poverty marker`,
    commute === null ? "commute pending" : `${commute.toFixed(1)} min commute`,
  ].join(" | ");

  return { cards, command };
}

function scoreAccess({
  commute,
  vacancy,
  poverty,
}: {
  commute: number | null;
  vacancy: number | null;
  poverty: number | null;
}) {
  const commuteScore = Math.min(((commute ?? 24) / 45) * 38, 38);
  const vacancyScore = Math.min(((vacancy ?? 0.08) / 0.2) * 28, 28);
  const povertyScore = Math.min(((poverty ?? 0.12) / 0.28) * 34, 34);
  return Math.round(commuteScore + vacancyScore + povertyScore);
}
