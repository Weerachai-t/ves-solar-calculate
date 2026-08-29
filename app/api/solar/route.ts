import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get('lat'));
  const lng = Number(req.nextUrl.searchParams.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid latitude/longitude' }, { status: 400 });
  }
  const end = new Date();
  end.setUTCFullYear(end.getUTCFullYear() - 1);
  const start = new Date(end);
  start.setUTCFullYear(start.getUTCFullYear() - 5);
  const date = (d: Date) => d.toISOString().slice(0, 10);
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('start_date', date(start));
  url.searchParams.set('end_date', date(end));
  url.searchParams.set('daily', 'shortwave_radiation_sum');
  url.searchParams.set('timezone', 'auto');
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return NextResponse.json({ error: 'Solar data provider unavailable' }, { status: 502 });
  const data = await res.json();
  const times: string[] = data.daily?.time ?? [];
  const vals: number[] = data.daily?.shortwave_radiation_sum ?? [];
  const sums = Array(12).fill(0), counts = Array(12).fill(0);
  times.forEach((t, i) => { const m = Number(t.slice(5, 7)) - 1; const v = Number(vals[i]); if (m >= 0 && Number.isFinite(v)) { sums[m] += v / 3.6; counts[m]++; } });
  const monthlyIrradiance = sums.map((sum, m) => counts[m] ? (sum / counts[m]) * new Date(2024, m + 1, 0).getDate() : 0);
  const annualIrradiance = monthlyIrradiance.reduce((a, b) => a + b, 0);
  return NextResponse.json({ latitude: data.latitude, longitude: data.longitude, timezone: data.timezone, period: { start: date(start), end: date(end) }, monthlyIrradiance, annualIrradiance, source: 'Open-Meteo Historical Weather API / shortwave_radiation_sum' });
}
