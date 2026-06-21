import type { PlaceLookup } from "../types/demographics";

export type WeatherDay = {
  date: string;
  high: number;
  low: number;
  condition: string;
  code: number;
};

export type WeatherSnapshot = {
  zip: string;
  placeLabel: string;
  temperature: number;
  condition: string;
  code: number;
  lastRefreshed: string;
  source: "Open-Meteo" | "Demo weather fallback";
  forecast: WeatherDay[];
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

export async function getWeatherForZip(zip: string, place: PlaceLookup | null): Promise<WeatherSnapshot> {
  if (!place?.latitude || !place.longitude) {
    return buildDemoWeather(zip, place, "Demo weather fallback");
  }

  try {
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "temperature_2m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      temperature_unit: "fahrenheit",
      forecast_days: "5",
      timezone: "auto",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      return buildDemoWeather(zip, place, "Demo weather fallback");
    }
    const payload = (await response.json()) as OpenMeteoResponse;
    const currentCode = payload.current?.weather_code ?? payload.daily?.weather_code?.[0] ?? 0;
    const temperature = payload.current?.temperature_2m ?? averageTemp(payload.daily?.temperature_2m_max?.[0], payload.daily?.temperature_2m_min?.[0]);
    const forecast = buildForecast(payload);

    return {
      zip,
      placeLabel: placeLabel(zip, place),
      temperature: Math.round(temperature),
      condition: conditionFromCode(currentCode),
      code: currentCode,
      lastRefreshed: new Date().toISOString(),
      source: "Open-Meteo",
      forecast: forecast.length ? forecast : buildDemoWeather(zip, place, "Demo weather fallback").forecast,
    };
  } catch {
    return buildDemoWeather(zip, place, "Demo weather fallback");
  }
}

function buildForecast(payload: OpenMeteoResponse): WeatherDay[] {
  const dates = payload.daily?.time ?? [];
  const codes = payload.daily?.weather_code ?? [];
  const highs = payload.daily?.temperature_2m_max ?? [];
  const lows = payload.daily?.temperature_2m_min ?? [];

  return dates.slice(0, 5).map((date, index) => {
    const code = codes[index] ?? 0;
    return {
      date,
      high: Math.round(highs[index] ?? 72),
      low: Math.round(lows[index] ?? 54),
      condition: conditionFromCode(code),
      code,
    };
  });
}

function buildDemoWeather(zip: string, place: PlaceLookup | null, source: WeatherSnapshot["source"]): WeatherSnapshot {
  const seed = Number(zip.slice(-2)) || 30;
  const base = 58 + (seed % 18);
  const conditions = [0, 1, 2, 45, 61];
  const forecast = Array.from({ length: 5 }).map((_, index) => {
    const code = conditions[(seed + index) % conditions.length];
    const high = base + index + ((seed + index) % 4);
    return {
      date: addDays(index),
      high,
      low: high - 13 - (index % 3),
      condition: conditionFromCode(code),
      code,
    };
  });

  return {
    zip,
    placeLabel: placeLabel(zip, place),
    temperature: forecast[0].high - 4,
    condition: forecast[0].condition,
    code: forecast[0].code,
    lastRefreshed: new Date().toISOString(),
    source,
    forecast,
  };
}

function placeLabel(zip: string, place: PlaceLookup | null) {
  return place ? `${place.city}, ${place.stateCode}` : `ZIP ${zip}`;
}

function addDays(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function averageTemp(high?: number, low?: number) {
  if (typeof high === "number" && typeof low === "number") return (high + low) / 2;
  if (typeof high === "number") return high;
  if (typeof low === "number") return low;
  return 72;
}

export function conditionFromCode(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Storms";
  return "Mixed";
}
