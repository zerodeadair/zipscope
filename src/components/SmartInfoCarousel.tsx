import { ArrowUpRight, BrainCircuit, History, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

type Slide = {
  eyebrow: string;
  title: string;
  prompt: string;
  body: string;
  icon: LucideIcon;
};

export default function SmartInfoCarousel({ profile }: { profile: DemographicProfile }) {
  const slides = useMemo(() => buildSlides(profile), [profile]);
  const [active, setActive] = useState(0);
  const slide = slides[active];
  const Icon = slide.icon;

  return (
    <section className="smart-carousel" aria-label="Sliding ZIP intelligence cards">
      <div className="smart-slide">
        <div className="slide-glow" />
        <div className="slide-copy">
          <span>{slide.eyebrow}</span>
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
        </div>
        <div className="slide-prompt-pill">
          <Icon size={18} />
          <span>{slide.prompt}</span>
        </div>
        <button className="slide-action" type="button">
          <BrainCircuit size={17} />
          Analyze insight
          <ArrowUpRight size={15} />
        </button>
        <div className="slide-dots" aria-label="Carousel pagination">
          {slides.map((item, index) => (
            <button
              aria-label={`Show ${item.eyebrow}`}
              className={index === active ? "active" : ""}
              key={item.eyebrow}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function buildSlides(profile: DemographicProfile): Slide[] {
  const income = profile.medianHouseholdIncome ?? 0;
  const homeValue = profile.medianHomeValue ?? 0;
  const ratio = income && homeValue ? (homeValue / income).toFixed(1) : "n/a";
  const age = profile.medianAge ? profile.medianAge.toFixed(1) : "unknown";
  const place = profile.displayName;

  return [
    {
      eyebrow: "AI anomaly scan",
      title: "Housing pressure vector",
      prompt: `${ratio}x home-to-income signal`,
      body: `${place} shows a median home value of ${homeValue ? formatCurrency(homeValue) : "unavailable"} against ${income ? formatCurrency(income) : "unavailable"} household income. Treat this as a pressure signal, not a prediction.`,
      icon: TrendingUp,
    },
    {
      eyebrow: "Local context",
      title: "Age-market alignment",
      prompt: `Median age ${age}`,
      body: `A median age of ${age} shapes demand for schools, healthcare, venues, housing tenure, and sports/event scheduling around ZIP ${profile.zip}.`,
      icon: Lightbulb,
    },
    {
      eyebrow: "Historical lens",
      title: "ZCTA interpretation reminder",
      prompt: `ZIP ${profile.zip} maps to ZCTA ${profile.zcta}`,
      body: "Census ZCTAs approximate USPS ZIP routes. ZipScope separates place labels from demographic truth layers so the interface stays useful without pretending ZIPs are perfect boundaries.",
      icon: History,
    },
    {
      eyebrow: "Predictive signal",
      title: "Market capacity pulse",
      prompt: `${formatNumber(profile.population)} residents / ${profile.bachelorsOrHigherRate === null ? "education pending" : `${formatPercent(profile.bachelorsOrHigherRate)} bachelor's+`}`,
      body: "Population, education, poverty, and housing signals combine into a directional market pulse for civic and sports-market context.",
      icon: Sparkles,
    },
  ];
}
