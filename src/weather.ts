export type WeatherNow = {
  tempC: number;
  wind: number;
  code: number;
  label: string;
};

export type WeatherDaily = {
  date: string; // YYYY-MM-DD
  code: number;
  label: string;
  tMax: number;
  tMin: number;
  precipProbMax: number; // %
};

export async function fetchWeatherNow(lat: number, lon: number): Promise<WeatherNow> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&timezone=Asia%2FSeoul`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("weather_fetch_failed");
  const data = await res.json();

  const tempC = Math.round(Number(data.current.temperature_2m));
  const wind = Math.round(Number(data.current.wind_speed_10m));
  const code = Number(data.current.weather_code);

  return { tempC, wind, code, label: wcLabel(code) };
}

export async function fetchDailyForecastForDate(
  lat: number,
  lon: number,
  date: string // YYYY-MM-DD
): Promise<WeatherDaily> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FSeoul&start_date=${date}&end_date=${date}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("forecast_fetch_failed");
  const data = await res.json();

  const code = Number(data.daily.weather_code?.[0]);
  const tMax = Math.round(Number(data.daily.temperature_2m_max?.[0]));
  const tMin = Math.round(Number(data.daily.temperature_2m_min?.[0]));
  const precipProbMax = Math.round(Number(data.daily.precipitation_probability_max?.[0] ?? 0));

  return { date, code, label: wcLabel(code), tMax, tMin, precipProbMax };
}

export function wcLabel(code: number) {
  if (code === 0) return "晴";
  if ([1, 2, 3].includes(code)) return "多雲";
  if ([45, 48].includes(code)) return "霧";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "雪";
  if ([95, 96, 99].includes(code)) return "雷雨";
  return "天氣";
}
