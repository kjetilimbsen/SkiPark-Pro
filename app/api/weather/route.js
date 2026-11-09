import { NextResponse } from 'next/server';

const SYMBOL_TRANSLATIONS = {
  clearsky_day: { text: "Klarvær", icon: "☀️" },
  clearsky_night: { text: "Klart", icon: "🌙" },
  fair_day: { text: "Lettskyet", icon: "🌤️" },
  fair_night: { text: "Lettskyet", icon: "🌤️" },
  partlycloudy_day: { text: "Delvis skyet", icon: "⛅" },
  partlycloudy_night: { text: "Delvis skyet", icon: "⛅" },
  cloudy: { text: "Overskyet", icon: "☁️" },
  lightrainshowers_day: { text: "Lette regnbyger", icon: "🌦️" },
  rainshowers_day: { text: "Regnbyger", icon: "🌧️" },
  heavyrainshowers_day: { text: "Kraftige regnbyger", icon: "🌧️" },
  lightrain: { text: "Lett regn", icon: "🌧️" },
  rain: { text: "Regn", icon: "🌧️" },
  heavyrain: { text: "Kraftig regn", icon: "🌧️" },
  lightsleet: { text: "Lett sludd", icon: "🌨️" },
  sleet: { text: "Sludd", icon: "🌨️" },
  heavysleet: { text: "Kraftig sludd", icon: "🌨️" },
  lightsnow: { text: "Lett snøvær", icon: "🌨️" },
  snow: { text: "Snøvær", icon: "❄️" },
  heavysnow: { text: "Tett snøvær", icon: "❄️" },
  lightsnowshowers_day: { text: "Lette snøbyger", icon: "🌨️" },
  snowshowers_day: { text: "Snøbyger", icon: "🌨️" },
  fog: { text: "Tåke", icon: "🌫️" }
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') || '61.15';
    const lon = searchParams.get('lon') || '10.70';

    const yrUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

    const res = await fetch(yrUrl, {
      headers: {
        'User-Agent': 'SkiParkPro/1.0 (kjetil@sportienda.com)',
        'Accept': 'application/json'
      },
      next: { revalidate: 600 } // Cache in Next.js for 10 minutes
    });

    if (!res.ok) {
      throw new Error(`Yr API feilet med status ${res.status}`);
    }

    const data = await res.json();
    const current = data.properties?.timeseries?.[0];
    if (!current) throw new Error("Mangler tidsserie fra Yr");

    const details = current.data.instant.details;
    const next1 = current.data.next_1_hours;
    const next6 = current.data.next_6_hours;

    const rawSymbol = next1?.summary?.symbol_code || next6?.summary?.symbol_code || "fair_day";
    const cleanSymbol = rawSymbol.replace(/_polartwilight/, '');
    const meta = SYMBOL_TRANSLATIONS[cleanSymbol] || { text: "Opphold", icon: "🌤️" };

    const precipitation = next1?.details?.precipitation_amount ?? next6?.details?.precipitation_amount ?? 0;

    return NextResponse.json({
      temp: Math.round(details.air_temperature * 10) / 10,
      humidity: Math.round(details.relative_humidity),
      windSpeed: Math.round(details.wind_speed * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      symbolCode: rawSymbol,
      conditionText: meta.text,
      conditionIcon: meta.icon,
      updatedAt: new Date().toISOString()
    });

  } catch (err) {
    // Fallback til standard vintervær hvis nettverksfeil
    return NextResponse.json({
      temp: -3.5,
      humidity: 82,
      windSpeed: 2.4,
      precipitation: 0.0,
      symbolCode: "partlycloudy_day",
      conditionText: "Vintervær (frakoblet)",
      conditionIcon: "❄️",
      isFallback: true,
      error: err.message
    });
  }
}
