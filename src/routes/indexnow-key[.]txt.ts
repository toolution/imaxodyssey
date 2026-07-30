import { createFileRoute } from '@tanstack/react-router';

import { indexNowKey } from '@/lib/indexnow';

export const Route = createFileRoute('/indexnow-key.txt')({
  server: {
    handlers: {
      GET: () => {
        const key = indexNowKey();
        if (!key) return new Response('Not found', { status: 404 });
        return new Response(key, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
