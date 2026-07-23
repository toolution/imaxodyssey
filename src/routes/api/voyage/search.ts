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
    if (departure.length < 2 || departure.length > 120)
      return respErr('Enter a city or postal code.');
    if (!missions.includes(mission)) return respErr('Choose a voyage mission.');
    return respData(await searchVoyages(departure, mission), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return respErr(
      error instanceof Error
        ? error.message
        : 'Poseidon has blocked this route.'
    );
  }
}

export const Route = createFileRoute('/api/voyage/search')({
  server: { handlers: { POST } },
});
