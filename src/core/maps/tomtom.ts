import { envConfigs } from '@/config';

export interface RouteMetric {
  distanceMeters: number;
  durationSeconds: number;
}

function tomTomKey() {
  return envConfigs.tomtom_api_key?.trim();
}

export async function drivingMatrix(
  origin: [number, number],
  destinations: [number, number][]
): Promise<(RouteMetric | null)[]> {
  const apiKey = tomTomKey();
  if (!apiKey) {
    return destinations.map((destination) =>
      estimateMetric(origin, destination)
    );
  }

  const url = new URL('https://api.tomtom.com/routing/matrix/2');
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origins: [{ point: toTomTomPoint(origin) }],
        destinations: destinations.map((destination) => ({
          point: toTomTomPoint(destination),
        })),
        options: {
          departAt: 'any',
          routeType: 'fastest',
          traffic: 'historical',
          travelMode: 'car',
        },
      }),
    });
    if (!response.ok) throw new Error('TomTom matrix failed');
    const data = (await response.json()) as any;
    const cells = Array.isArray(data.data) ? data.data : [];

    return destinations.map((destination, destinationIndex) => {
      const cell = cells.find(
        (item: any) =>
          item.originIndex === 0 && item.destinationIndex === destinationIndex
      );
      const summary = cell?.routeSummary;
      return typeof summary?.lengthInMeters === 'number' &&
        typeof summary?.travelTimeInSeconds === 'number'
        ? {
            distanceMeters: summary.lengthInMeters,
            durationSeconds: summary.travelTimeInSeconds,
          }
        : estimateMetric(origin, destination);
    });
  } catch {
    return destinations.map((destination) =>
      estimateMetric(origin, destination)
    );
  }
}

export async function drivingRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<{
  metric: RouteMetric;
  geometry: [number, number][];
  estimated: boolean;
}> {
  const apiKey = tomTomKey();
  if (!apiKey) return estimatedRoute(origin, destination);

  const locations = `${toTomTomLocation(origin)}:${toTomTomLocation(destination)}`;
  const url = new URL(
    `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json`
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('routeType', 'fastest');
  url.searchParams.set('traffic', 'true');
  url.searchParams.set('travelMode', 'car');
  url.searchParams.set('computeTravelTimeFor', 'all');
  url.searchParams.set('routeRepresentation', 'polyline');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('TomTom route failed');
    const route = ((await response.json()) as any).routes?.[0];
    const summary = route?.summary;
    const geometry: [number, number][] = (route?.legs ?? []).flatMap(
      (leg: any) =>
        (leg.points ?? []).map((point: any) => [
          Number(point.longitude),
          Number(point.latitude),
        ])
    );
    if (
      typeof summary?.lengthInMeters !== 'number' ||
      typeof summary?.travelTimeInSeconds !== 'number' ||
      geometry.length < 2
    ) {
      throw new Error('No TomTom route');
    }

    return {
      metric: {
        distanceMeters: summary.lengthInMeters,
        durationSeconds: summary.travelTimeInSeconds,
      },
      geometry,
      estimated: false,
    };
  } catch {
    return estimatedRoute(origin, destination);
  }
}

function toTomTomPoint([longitude, latitude]: [number, number]) {
  return { latitude, longitude };
}

function toTomTomLocation([longitude, latitude]: [number, number]) {
  return `${latitude},${longitude}`;
}

function estimatedRoute(
  origin: [number, number],
  destination: [number, number]
) {
  return {
    metric: estimateMetric(origin, destination),
    geometry: curvedLine(origin, destination),
    estimated: true,
  };
}

export function estimateMetric(
  origin: [number, number],
  destination: [number, number]
): RouteMetric {
  const directMeters = haversineMeters(
    origin[1],
    origin[0],
    destination[1],
    destination[0]
  );
  const distanceMeters = directMeters * 1.2;
  return {
    distanceMeters,
    durationSeconds: (distanceMeters / 1609.344 / 55) * 3600,
  };
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function curvedLine(
  origin: [number, number],
  destination: [number, number]
): [number, number][] {
  return Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const bend = Math.sin(Math.PI * t) * 1.4;
    return [
      origin[0] + (destination[0] - origin[0]) * t + bend,
      origin[1] + (destination[1] - origin[1]) * t,
    ];
  });
}
