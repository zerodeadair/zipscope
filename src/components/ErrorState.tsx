import { AlertTriangle } from "lucide-react";
import type { PlaceLookup } from "../types/demographics";

export default function ErrorState({ message, fix, place, zip }: { message: string; fix?: string; place?: PlaceLookup | null; zip?: string }) {
  return (
    <div className="error-state">
      <AlertTriangle size={20} />
      <div>
        {place && <strong>ZIP {zip}: {place.city}, {place.stateCode}{place.county ? ` / ${place.county}` : ""}</strong>}
        <span>{message}</span>
        {fix && <small>{fix}</small>}
      </div>
    </div>
  );
}
