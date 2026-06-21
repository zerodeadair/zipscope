import { FormEvent, useState } from "react";
import { Radar, Search } from "lucide-react";
import HeaderWeatherTile from "./HeaderWeatherTile";
import type { PlaceLookup } from "../types/demographics";

type Props = {
  initialZip: string;
  onSubmit: (zip: string) => void;
  isLoading: boolean;
  weatherPlace?: PlaceLookup | null;
};

export default function ZipSearch({ initialZip, onSubmit, isLoading, weatherPlace = null }: Props) {
  const [zip, setZip] = useState(initialZip);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(zip.trim());
  }

  return (
    <section className="hero-band">
      <div className="hero-copy">
        <div className="hero-title-row">
          <div className="brand-chip"><Radar size={16} /> ZipScope</div>
        </div>
        <h1>ZIP Intelligence Console</h1>
      </div>
      <div className="hero-intel-column">
        <HeaderWeatherTile zip={initialZip} place={weatherPlace} />
        <form className="zip-console" onSubmit={handleSubmit}>
          <Search className="zip-icon" size={24} />
          <input
            aria-label="ZIP code"
            inputMode="numeric"
            maxLength={5}
            placeholder="30301"
            value={zip}
            onChange={(event) => setZip(event.target.value.replace(/\D/g, ""))}
          />
          <button type="submit" disabled={isLoading}>{isLoading ? "Scanning" : "Analyze ZIP"}</button>
        </form>
      </div>
    </section>
  );
}
