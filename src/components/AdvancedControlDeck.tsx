import { DatabaseZap, Gauge, Layers, Sparkles } from "lucide-react";
import type { DemographicProfile } from "../types/demographics";

export default function AdvancedControlDeck({ profile, zip, loading }: { profile: DemographicProfile | null; zip: string; loading: boolean }) {
  const activeZip = profile?.zip ?? zip;
  const place = profile?.displayName ?? "Awaiting ZIP lock";

  return (
    <section className="intel-toolbar" aria-label="Advanced intelligence configuration">
      <div className="toolbar-chip primary"><Sparkles size={15} /> ZIP {activeZip}</div>
      <div className="toolbar-chip">{loading ? "Syncing" : place}</div>
      <div className="toolbar-chip"><Gauge size={15} /> {loading ? "Pulling sources" : "Layers synchronized"}</div>
      <details className="toolbar-menu">
        <summary><Layers size={15} /> Controls</summary>
        <div>
          <span>Census</span>
          <span>ACS 2024</span>
          <span>ZCTA</span>
          <span>Sports</span>
        </div>
      </details>
      <details className="toolbar-menu">
        <summary><DatabaseZap size={15} /> Data stream</summary>
        <p>ZIP {activeZip} maps to Census ZCTA {profile?.zcta ?? activeZip}. Labels use Zippopotam.us and guarded place seeds; demographics stay sourced.</p>
      </details>
    </section>
  );
}
