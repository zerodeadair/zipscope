import { Activity, Building2, Factory, Newspaper, RadioTower, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

type Timeline = "now" | "2030" | "2040" | "2050";
type HeadlineTone = "tech" | "housing" | "civic" | "industry";

type HeadlineItem = {
  title: string;
  kicker: string;
  detail: string;
  tone: HeadlineTone;
};

const timelineLabels: Timeline[] = ["now", "2030", "2040", "2050"];

export default function HeadlineWall({ profile }: { profile: DemographicProfile }) {
  const [timeline, setTimeline] = useState<Timeline>("2030");
  const headlines = useMemo(() => buildHeadlines(profile, timeline), [profile, timeline]);

  return (
    <section className="headline-wall" aria-label="Localized ZIP trend pulse">
      <div className="headline-wall-header">
        <div>
          <span>Local Pulse Matrix</span>
          <h2>{profile.displayName} trend pulse</h2>
        </div>
        <div className="timeline-switcher" aria-label="Predictive timeline">
          {timelineLabels.map((label) => (
            <button
              className={timeline === label ? "active" : ""}
              key={label}
              onClick={() => setTimeline(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="headline-ticker">
        <RadioTower size={15} />
        <span>{buildTicker(profile, timeline)}</span>
      </div>

      <div className="headline-grid">
        {headlines.map((item) => (
          <article className={`headline-card ${item.tone}`} key={item.title}>
            <div className="headline-icon">{iconForTone(item.tone)}</div>
            <span>{item.kicker}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function buildHeadlines(profile: DemographicProfile, timeline: Timeline): HeadlineItem[] {
  const income = profile.medianHouseholdIncome ?? 0;
  const homeValue = profile.medianHomeValue ?? 0;
  const bachelors = profile.bachelorsOrHigherRate ?? 0;
  const poverty = profile.povertyRate ?? 0;
  const vacancy = profile.vacancyRate ?? 0;
  const population = profile.population;
  const projectionMultiplier = timeline === "now" ? 1 : timeline === "2030" ? 1.04 : timeline === "2040" ? 1.11 : 1.18;
  const projectedPopulation = Math.round(population * projectionMultiplier);
  const homeIncomeRatio = income && homeValue ? homeValue / income : null;

  return [
    {
      tone: "civic",
      kicker: "Population pulse",
      title: `${formatNumber(projectedPopulation)} residents in ${timeline === "now" ? "current ACS view" : `${timeline} projection band`}`,
      detail: `The local profile starts from ${formatNumber(population)} ACS residents and applies a lightweight scenario multiplier for spatial-era planning.`,
    },
    {
      tone: homeIncomeRatio && homeIncomeRatio > 5 ? "housing" : "civic",
      kicker: "Housing pressure",
      title: homeIncomeRatio ? `${homeIncomeRatio.toFixed(1)}x home-to-income ratio` : "Housing pressure pending",
      detail: homeIncomeRatio
        ? `${formatCurrency(homeValue)} median home value against ${formatCurrency(income)} household income creates the affordability signal.`
        : "Home value or income is unavailable, so the pressure score remains intentionally muted.",
    },
    {
      tone: bachelors > 0.35 ? "tech" : "industry",
      kicker: "Workforce signal",
      title: `${formatPercent(bachelors)} bachelor's+ attainment`,
      detail: `Education, commute, and income indicators imply ${bachelors > 0.35 ? "knowledge-work upside" : "mixed workforce capacity"} for future local-market planning.`,
    },
    {
      tone: poverty > 0.14 || vacancy > 0.1 ? "housing" : "tech",
      kicker: "Anomaly watch",
      title: poverty > 0.14 ? `${formatPercent(poverty)} poverty stress marker` : "Stability vector holding",
      detail: `The anomaly layer blends poverty, vacancy, housing cost, and education to surface civic risk without overstating causality.`,
    },
  ];
}

function buildTicker(profile: DemographicProfile, timeline: Timeline) {
  const commute = profile.averageCommuteMinutes === null ? "commute pending" : `${profile.averageCommuteMinutes.toFixed(1)} min commute`;
  const vacancy = profile.vacancyRate === null ? "vacancy pending" : `${formatPercent(profile.vacancyRate)} vacancy`;
  return `${timeline.toUpperCase()} scenario: ${profile.zip} / ZCTA ${profile.zcta} | ${commute} | ${vacancy} | ${profile.sourceName}`;
}

function iconForTone(tone: HeadlineTone) {
  if (tone === "tech") return <TrendingUp size={18} />;
  if (tone === "housing") return <Building2 size={18} />;
  if (tone === "industry") return <Factory size={18} />;
  if (tone === "civic") return <Activity size={18} />;
  return <Newspaper size={18} />;
}
