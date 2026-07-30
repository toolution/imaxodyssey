import { envConfigs } from '@/config';
import { absoluteUrl } from '@/lib/seo';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

function configuredKey(): string | null {
  const key = envConfigs.indexnow_key.trim();
  return INDEXNOW_KEY_PATTERN.test(key) ? key : null;
}

export function indexNowKey(): string | null {
  return configuredKey();
}

export async function submitIndexNow(urls: readonly string[]): Promise<void> {
  const key = configuredKey();
  if (!key) return;

  let origin: URL;
  try {
    origin = new URL(absoluteUrl('/'));
  } catch {
    return;
  }

  const urlList = [...new Set(urls)]
    .filter((url) => {
      try {
        return new URL(url).host === origin.host;
      } catch {
        return false;
      }
    })
    .slice(0, 10_000);
  if (!urlList.length) return;

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: origin.host,
        key,
        keyLocation: absoluteUrl('/indexnow-key.txt'),
        urlList,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok && response.status !== 202) {
      console.warn(`IndexNow submission failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn(
      'IndexNow submission failed',
      error instanceof Error ? error.message : 'unknown error'
    );
  }
}
