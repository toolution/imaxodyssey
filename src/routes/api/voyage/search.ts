import { createFileRoute } from '@tanstack/react-router';

import { searchVoyages } from '@/modules/voyage/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';
import type { VoyageMission } from '@/lib/voyage';

const missions: VoyageMission[] = [
  'closest',
  'best-format',
  '70mm-only',
  'worth-voyage',
];

async function POST({ request }: { request: Request }) {
  try {
    const limited = enforceMinIntervalRateLimit(request, {
      intervalMs: 750,
      keyPrefix: 'voyage-search',
    });
    if (limited) return limited;

    const body = await request.json().catch(() => null);
    const departure =
      typeof body?.departure === 'string' ? body.departure.trim() : '';
    const mission = body?.mission as VoyageMission;
    const hasLatitude = typeof body?.latitude === 'number';
    const hasLongitude = typeof body?.longitude === 'number';
    if (departure.length < 2 || departure.length > 120)
      return respErr('Enter a city.');
    if (!missions.includes(mission)) return respErr('Choose a voyage mission.');
    if (hasLatitude !== hasLongitude)
      return respErr('Provide both latitude and longitude.');
    const coordinates =
      hasLatitude && hasLongitude
        ? { latitude: body.latitude, longitude: body.longitude }
        : undefined;
    if (
      coordinates &&
      (!Number.isFinite(coordinates.latitude) ||
        !Number.isFinite(coordinates.longitude) ||
        coordinates.latitude < -90 ||
        coordinates.latitude > 90 ||
        coordinates.longitude < -180 ||
        coordinates.longitude > 180)
    )
      return respErr('Invalid location coordinates.');
    return respData(await searchVoyages(departure, mission, coordinates), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respErr(
      error instanceof Error
        ? error.message
        : 'The theater search could not be completed.'
    );
  }
}

export const Route = createFileRoute('/api/voyage/search')({
  server: { handlers: { POST } },
});
