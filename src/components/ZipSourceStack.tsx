import { CheckCircle2, ExternalLink, KeyRound, Link2, MapPinned } from "lucide-react";
import type { PlaceLookup, SourceStatus } from "../types/demographics";

const statusLabels: Record<SourceStatus["status"], string> = {
  active: "Active",
  needs_key: "Needs key",
  reference: "Reference",
  fallback: "Seed label",
  unavailable: "Unavailable",
};

export default function ZipSourceStack({
  zip,
  place,
  sourceStack,
  sourceLinks,
}: {
  zip: string;
  place: PlaceLookup | null;
  sourceStack: SourceStatus[];
  sourceLinks: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="dashboard-section source-stack-section">
      <div className="section-heading">
        <span>ZIP Intelligence Stack</span>
        <h2>{place ? `${place.city}, ${place.stateCode}${place.county ? ` / ${place.county}` : ""}` : `ZIP ${zip}`} source bridge</h2>
      </div>
      <div className="zip-geo-panel">
        <div>
          <span className="mono-label">ZIP {zip}</span>
          <h3>{place ? `${place.city}, ${place.state}` : "Place label unavailable"}</h3>
          <p>
            Census demographics use ZCTAs. Friendly city/state labels come from Zippopotam.us when available,
            with local seed labels only for known test ZIPs. Seed labels never supply demographic values.
          </p>
        </div>
        {place && (
          <div className="geo-facts">
            <span><MapPinned size={15} /> {place.county ?? "County pending HUD bridge"}</span>
            <span>{Number.isFinite(place.latitude) ? `${place.latitude?.toFixed(4)}, ${place.longitude?.toFixed(4)}` : "Coordinates unavailable"}</span>
            <span>{place.source}</span>
          </div>
        )}
      </div>
      <div className="source-card-grid">
        {sourceStack.map((source) => (
          <article className="source-card" key={source.name}>
            <div className={`source-status ${source.status}`}>
              {source.status === "active" ? <CheckCircle2 size={15} /> : source.status === "needs_key" ? <KeyRound size={15} /> : <Link2 size={15} />}
              {statusLabels[source.status]}
            </div>
            <h3>{source.name}</h3>
            <strong>{source.role}</strong>
            <p>{source.detail}</p>
            {source.href && <a href={source.href} target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a>}
          </article>
        ))}
      </div>
      <details className="source-disclosure compact-source-disclosure">
        <summary>Reference links</summary>
        <div className="source-links wide-links">
          {sourceLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
        </div>
      </details>
    </section>
  );
}
