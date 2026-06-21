import { Cloud, CloudFog, CloudRain, CloudSun, Cloudy, Loader2, Snowflake, Sun, TriangleAlert, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getWeatherForZip, type WeatherSnapshot } from "../services/weather";
import type { PlaceLookup } from "../types/demographics";

const REFRESH_MS = 5 * 60 * 1000;

export default function HeaderWeatherTile({ zip, place }: { zip: string; place: PlaceLookup | null }) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      setLoading(true);
      const nextWeather = await getWeatherForZip(zip, place);
      if (!cancelled) {
        setWeather(nextWeather);
        setLoading(false);
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [place, zip]);

  return (
    <aside className="header-weather-tile" aria-label="ZIP weather intelligence">
      <div className="weather-current">
        <div className="weather-icon-orb">
          {loading ? <Loader2 className="weather-spin" size={22} /> : <WeatherIcon code={weather?.code ?? 0} size={23} />}
        </div>
        <div>
          <div className="weather-current-top">
            <strong>{weather ? `${weather.temperature}°` : "--°"}</strong>
            <span>{weather?.condition ?? "Syncing"}</span>
          </div>
        </div>
      </div>
      <div className="weather-forecast-strip">
        {(weather?.forecast ?? buildLoadingDays()).slice(1, 5).map((day) => (
          <div className="weather-day" key={day.date}>
            <span>{formatDay(day.date)}</span>
            <WeatherIcon code={day.code} size={17} />
            <b>{day.high}°</b>
            <small>{day.low}°</small>
          </div>
        ))}
      </div>
      <div className="weather-meta">
        <span>{weather?.source ?? "Weather provider"}</span>
        <span>{weather ? `Updated ${formatRefreshTime(weather.lastRefreshed)}` : "Refreshing"}</span>
      </div>
    </aside>
  );
}

function WeatherIcon({ code, size }: { code: number; size: number }) {
  if (code === 0) return <Sun size={size} />;
  if ([1, 2].includes(code)) return <CloudSun size={size} />;
  if (code === 3) return <Cloudy size={size} />;
  if ([45, 48].includes(code)) return <CloudFog size={size} />;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain size={size} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake size={size} />;
  if ([95, 96, 99].includes(code)) return <Zap size={size} />;
  if (code < 0) return <TriangleAlert size={size} />;
  return <Cloud size={size} />;
}

function buildLoadingDays() {
  return Array.from({ length: 5 }).map((_, index) => ({
    date: new Date(Date.now() + index * 86400000).toISOString().slice(0, 10),
    high: 0,
    low: 0,
    condition: "Loading",
    code: -1,
  }));
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

function formatRefreshTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
