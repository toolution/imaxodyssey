import { envConfigs } from '@/config';
import {
  baseLocale,
  locales,
  localizeUrl,
  type Locale,
} from '@/paraglide/runtime.js';

const socialImagePath = '/imgs/generated/imax-odyssey-og-1785382551064.png';

function siteOrigin(): URL {
  const url = new URL(envConfigs.app_url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_APP_URL must use http or https');
  }
  return url;
}

export function absoluteUrl(pathname = '/'): string {
  return new URL(pathname, siteOrigin()).href;
}

export function localizedUrl(pathname: string, locale: Locale): string {
  return localizeUrl(absoluteUrl(pathname), { locale }).href;
}

export function localizedPageLinks(
  pathname: string,
  locale: Locale,
  availableLocales: readonly Locale[] = locales
) {
  const canonical = localizedUrl(pathname, locale);
  const defaultLocale = availableLocales.includes(baseLocale)
    ? baseLocale
    : availableLocales[0];

  return {
    canonical,
    links: [
      { rel: 'canonical' as const, href: canonical },
      ...availableLocales.map((alternateLocale) => ({
        rel: 'alternate' as const,
        hrefLang: alternateLocale,
        href: localizedUrl(pathname, alternateLocale),
      })),
      ...(defaultLocale
        ? [
            {
              rel: 'alternate' as const,
              hrefLang: 'x-default',
              href: localizedUrl(pathname, defaultLocale),
            },
          ]
        : []),
    ],
  };
}

export function defaultSocialImage(): string {
  return absoluteUrl(socialImagePath);
}

export function publicRobotsMeta() {
  return {
    name: 'robots',
    content: 'index, follow, max-image-preview:large',
  };
}

export function noIndexRobotsMeta() {
  return { name: 'robots', content: 'noindex, follow' };
}

export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
