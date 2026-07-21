import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';

function integerParam(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null;
  return Number(value);
}

async function GET({ request }: { request: Request }) {
  const apiKey = envConfigs.maptiler_api_key?.trim();
  if (!apiKey)
    return new Response('MapTiler is not configured', { status: 503 });

  const requestUrl = new URL(request.url);
  const zoom = integerParam(requestUrl.searchParams.get('z'));
  const x = integerParam(requestUrl.searchParams.get('x'));
  const y = integerParam(requestUrl.searchParams.get('y'));
  if (zoom == null || x == null || y == null || zoom > 18) {
    return new Response('Invalid tile', { status: 400 });
  }
  const tileCount = 2 ** zoom;
  if (x >= tileCount || y >= tileCount) {
    return new Response('Invalid tile', { status: 400 });
  }

  const tileUrl = new URL(
    `https://api.maptiler.com/maps/streets-v4/${zoom}/${x}/${y}.png`
  );
  tileUrl.searchParams.set('key', apiKey);
  const response = await fetch(tileUrl);
  if (!response.ok || !response.body) {
    return new Response('Map tile unavailable', { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Content-Type': response.headers.get('content-type') || 'image/png',
    },
  });
}

export const Route = createFileRoute('/api/voyage/tile')({
  server: { handlers: { GET } },
});
