import { BriefcaseBusiness, CarFront, ChartNoAxesCombined, HeartHandshake, Home, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DemographicProfile } from "../types/demographics";
import { buildPremiumSignals } from "../utils/demographicIntelligence";

const icons: Record<string, LucideIcon> = {
  "Family Household Signal": HeartHandshake,
  "Employment Base Proxy": BriefcaseBusiness,
  "Transportation Friction": CarFront,
  "Cost Pressure Alert": Home,
  "Regional Comparison Index": Scale,
  "Growth / Stability Signal": ChartNoAxesCombined,
};

export default function PremiumIntelSection({ profile }: { profile: DemographicProfile }) {
  const signals = buildPremiumSignals(profile);

  return (
    <section className="premium-intel-section" aria-label="Expanded ZIP intelligence">
      <div className="premium-intel-heading">
        <div>
          <span>Expanded Intelligence</span>
          <h2>Decision-grade ZIP signals</h2>
        </div>
        <p>Concise modeled overlays built from the current sourced profile. Each score is a planning signal, not an official Census field.</p>
      </div>
      <div className="premium-intel-grid">
        {signals.map((signal) => {
          const Icon = icons[signal.label] ?? ChartNoAxesCombined;
          return (
            <article className={`premium-intel-card ${signal.tone}`} key={signal.label}>
              <div className="premium-intel-top">
                <Icon size={18} />
                <span>{signal.label}</span>
              </div>
              <strong>{signal.value}</strong>
              <p>{signal.detail}</p>
              <div className="premium-intel-meter">
                <i style={{ width: `${Math.max(6, Math.min(100, signal.score))}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
