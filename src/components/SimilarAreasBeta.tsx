import { ArrowRightLeft, BadgeInfo, MapPinned, Sparkles } from "lucide-react";
import type { DemographicProfile } from "../types/demographics";
import { buildSimilarAreas } from "../utils/demographicIntelligence";

export default function SimilarAreasBeta({ profile }: { profile: DemographicProfile }) {
  const areas = buildSimilarAreas(profile);

  return (
    <section className="similar-areas-card" id="similar-areas" aria-label="Similar Areas Beta">
      <div className="similar-areas-header">
        <div>
          <span className="beta-chip"><Sparkles size={14} /> Similar Areas Beta</span>
          <h2>Comparable ZIP intelligence</h2>
        </div>
        <p>Experimental matching uses sourced ZIP demographics plus transparent local scoring. Match scores are directional, not official rankings.</p>
      </div>

      <div className="similar-area-list">
        {areas.map((area, index) => (
          <article className="similar-area-row" key={area.zip}>
            <div className="similar-rank">{index + 1}</div>
            <div className="similar-area-main">
              <div className="similar-area-title">
                <MapPinned size={17} />
                <strong>{area.zip} {area.city}, {area.stateCode}</strong>
                <span>{area.matchScore}% match</span>
              </div>
              <p>{area.why}</p>
              <div className="similar-tag-row">
                {area.similarities.map((item) => <span key={item}>{item}</span>)}
              </div>
              <small><BadgeInfo size={14} /> Key difference: {area.difference}</small>
            </div>
            <button className="compare-button" type="button" aria-label={`Compare ${profile.zip} with ${area.zip}`}>
              <ArrowRightLeft size={16} />
              Compare
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
