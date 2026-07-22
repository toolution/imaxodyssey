import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  Anchor,
  Check,
  Clock3,
  Compass,
  Download,
  ExternalLink,
  Film,
  Info,
  Navigation,
  Route as RouteIcon,
  Share2,
  SkipForward,
  Sparkles,
  Waves,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { apiPost } from '@/lib/api-client';
import {
  ADVENTURE_LABELS,
  type TheaterCapability,
  type VoyageMission,
  type VoyageRoute,
  type VoyageSearchResult,
} from '@/lib/voyage';
import { TextField } from '@/components/form-field';
import { Button } from '@/components/ui/button';

export interface VoyageCopy {
  brand: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  departureLabel: string;
  departurePlaceholder: string;
  submit: string;
  searching: string;
  skip: string;
  missionsLabel: string;
  missions: Record<VoyageMission, { title: string; description: string }>;
  shortest: string;
  hero: string;
  capability: string;
  aspectRatio: string;
  equipment: string;
  screening: string;
  screeningUnknown: string;
  screeningConfirmed: string;
  screeningNotConfirmed: string;
  verified: string;
  estimated: string;
  worthVoyage: string;
  openDirections: string;
  share: string;
  shareQuestion: string;
  download: string;
  systemShare: string;
  close: string;
  methodLink: string;
  resultTitle: string;
  resultSummary: (city: string, theater: string) => string;
  routeTabsLabel: string;
  methodEyebrow: string;
  methodTitle: string;
  progressEvents: string[];
  progressNote: string;
  chartLabel: string;
  chartImageLabel: string;
  region: string;
  regions: string;
  worthYes: string;
  worthNo: string;
  source: string;
  validation: string;
  noResultsTitle: string;
  noResultsBody: string;
  disclaimer: string;
  dataNote: string;
}

export interface VoyageSeoCopy {
  canonicalUrl: string;
  language: string;
  siteName: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  introduction: string[];
  sections: Array<{
    title: string;
    paragraphs: string[];
    items?: Array<{ title: string; body: string }>;
  }>;
  faqTitle: string;
  faqDescription: string;
  faqs: Array<{ question: string; answer: string }>;
}

const missionOrder: VoyageMission[] = [
  'closest',
  'best-format',
  '70mm-only',
  'worth-voyage',
];

const initialResult: VoyageSearchResult = {
  departure: {
    city: 'New York',
    region: 'NY',
    country: 'US',
    latitude: 40.7128,
    longitude: -74.006,
  },
  mission: 'closest',
  routes: [
    {
      kind: 'shortest',
      theater: {
        id: 'amc-empire-25',
        name: 'AMC Empire 25',
        city: 'New York',
        region: 'NY',
        country: 'US',
        latitude: 40.7567,
        longitude: -73.9885,
        formats: ['IMAX with Laser'],
        projector: 'Commercial Laser',
        aspectRatio: 'Up to 1.90:1',
        has1570: false,
        hasGtLaser: false,
        worthVoyage: false,
        screeningStatus: 'unknown',
        verifiedAt: '2026-07-01',
        sourceUrl: 'https://www.imax.com/theatre/amc-empire-25-imax',
        confidence: 'medium',
      },
      distanceMeters: 9656,
      durationSeconds: 1560,
      geometry: [],
      estimated: false,
      regionCount: 1,
      adventureTier: 'athenas-favor',
      formatScore: 58,
    },
  ],
  searchedTheaters: 23,
  usedEstimatedRoutes: false,
};

export function VoyageExperience({
  copy,
  seo,
}: {
  copy: VoyageCopy;
  seo: VoyageSeoCopy;
}) {
  const [result, setResult] = useState<VoyageSearchResult | null>(
    initialResult
  );
  const [selectedRoute, setSelectedRoute] = useState<'shortest' | 'hero'>(
    'shortest'
  );
  const [showVoyage, setShowVoyage] = useState(false);
  const [sharePreview, setSharePreview] = useState<{
    url: string;
    blob: Blob;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (request: { departure: string; mission: VoyageMission }) =>
      apiPost<VoyageSearchResult>('/api/voyage/search', request),
    onSuccess: (data) => {
      setResult(data);
      setSelectedRoute(
        data.routes.some((route) => route.kind === 'hero') ? 'hero' : 'shortest'
      );
      setShowVoyage(false);
    },
    onError: (error: Error) => {
      setShowVoyage(false);
      toast.error(error.message);
    },
  });

  const form = useForm({
    defaultValues: { departure: '', mission: 'closest' as VoyageMission },
    validators: {
      onSubmit: z.object({
        departure: z.string().trim().min(2, copy.validation),
        mission: z.enum([
          'closest',
          'best-format',
          '70mm-only',
          'worth-voyage',
        ]),
      }),
    },
    onSubmit: async ({ value }) => {
      setShowVoyage(true);
      mutation.mutate(value);
    },
  });

  const activeRoute =
    result?.routes.find((route) => route.kind === selectedRoute) ??
    result?.routes[0];

  async function openShareCard() {
    if (!result || !activeRoute) return;
    const card = await createShareCard(result, activeRoute, copy);
    setSharePreview(card);
  }

  return (
    <div className="voyage-shell">
      <header className="voyage-header">
        <a className="voyage-brand" href="/" aria-label={copy.brand}>
          <span className="voyage-brand-mark">
            <img src="/favicon.png" alt="" aria-hidden="true" />
          </span>
          <span>{copy.brand}</span>
        </a>
        <a className="voyage-method-link" href="#method">
          <Info aria-hidden="true" /> {copy.methodLink}
        </a>
      </header>

      <main>
        <section className="voyage-hero" aria-labelledby="voyage-title">
          <div className="voyage-stars" aria-hidden="true" />
          <div className="voyage-hero-copy">
            <p className="voyage-eyebrow">
              <Anchor aria-hidden="true" /> {copy.eyebrow}
            </p>
            <h1 id="voyage-title">{copy.headline}</h1>
            <p className="voyage-subheadline">{copy.subheadline}</p>
          </div>

          <form
            className="voyage-search"
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
            <fieldset>
              <legend>{copy.missionsLabel}</legend>
              <form.Subscribe selector={(state) => state.values.mission}>
                {(mission) => (
                  <div className="voyage-missions">
                    {missionOrder.map((value) => (
                      <button
                        type="button"
                        key={value}
                        className="voyage-mission"
                        data-selected={mission === value}
                        aria-pressed={mission === value}
                        onClick={() => form.setFieldValue('mission', value)}
                      >
                        <span>{copy.missions[value].title}</span>
                        <small>{copy.missions[value].description}</small>
                        {mission === value ? (
                          <Check aria-hidden="true" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </form.Subscribe>
            </fieldset>

            <div className="voyage-departure-row">
              <form.Field name="departure">
                {(field) => (
                  <div className="voyage-departure-field">
                    <TextField
                      field={field}
                      label={copy.departureLabel}
                      placeholder={copy.departurePlaceholder}
                      autoComplete="postal-code"
                      disabled={mutation.isPending}
                    />
                  </div>
                )}
              </form.Field>
              <Button
                className="voyage-submit"
                type="submit"
                disabled={mutation.isPending}
              >
                <Navigation aria-hidden="true" />
                {mutation.isPending ? copy.searching : copy.submit}
              </Button>
            </div>
          </form>

          {activeRoute ? (
            <div className="voyage-featured-theater">
              <TheaterIsland
                route={activeRoute}
                country={result?.departure.country ?? 'US'}
                copy={copy}
              />
            </div>
          ) : null}

          {mutation.isPending && showVoyage ? (
            <VoyageProgress copy={copy} onSkip={() => setShowVoyage(false)} />
          ) : null}
        </section>

        {mutation.isError && !result ? (
          <section className="voyage-empty" aria-live="polite">
            <Waves aria-hidden="true" />
            <h2>{copy.noResultsTitle}</h2>
            <p>{mutation.error.message || copy.noResultsBody}</p>
          </section>
        ) : null}

        {result && activeRoute ? (
          <section className="voyage-results" aria-labelledby="result-heading">
            <div className="voyage-result-heading">
              <div>
                <p className="voyage-eyebrow">
                  <Sparkles aria-hidden="true" />{' '}
                  {ADVENTURE_LABELS[activeRoute.adventureTier]}
                </p>
                <h2 id="result-heading">{copy.resultTitle}</h2>
                <p>
                  {copy.resultSummary(
                    result.departure.city,
                    activeRoute.theater.name
                  )}
                </p>
              </div>
              <Button className="voyage-share-button" onClick={openShareCard}>
                <Share2 aria-hidden="true" /> {copy.share}
              </Button>
            </div>

            <div
              className="voyage-route-tabs"
              role="tablist"
              aria-label={copy.routeTabsLabel}
            >
              {result.routes.map((route) => (
                <button
                  type="button"
                  role="tab"
                  key={route.kind}
                  aria-selected={selectedRoute === route.kind}
                  data-active={selectedRoute === route.kind}
                  onClick={() => setSelectedRoute(route.kind)}
                >
                  {route.kind === 'shortest' ? (
                    <Clock3 aria-hidden="true" />
                  ) : (
                    <Sparkles aria-hidden="true" />
                  )}
                  <span>
                    <strong>
                      {route.kind === 'shortest' ? copy.shortest : copy.hero}
                    </strong>
                    <small>
                      {formatDistance(
                        route.distanceMeters,
                        result.departure.country
                      )}{' '}
                      · {formatDuration(route.durationSeconds)}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section id="method" className="voyage-method">
          <div>
            <p className="voyage-eyebrow">
              <RouteIcon aria-hidden="true" /> {copy.methodEyebrow}
            </p>
            <h2>{copy.methodTitle}</h2>
          </div>
          <p>{copy.dataNote}</p>
        </section>

        <SeoGuide copy={seo} />
      </main>

      <footer className="voyage-footer">
        <span>{copy.brand}</span>
        <p>{copy.disclaimer}</p>
      </footer>

      {sharePreview && result && activeRoute ? (
        <ShareDialog
          preview={sharePreview}
          result={result}
          route={activeRoute}
          copy={copy}
          onClose={() => {
            URL.revokeObjectURL(sharePreview.url);
            setSharePreview(null);
          }}
        />
      ) : null}
      <SeoSchema copy={seo} />
    </div>
  );
}

function SeoGuide({ copy }: { copy: VoyageSeoCopy }) {
  return (
    <section className="voyage-seo" aria-labelledby="voyage-seo-title">
      <div className="voyage-seo-intro">
        <p className="voyage-eyebrow">{copy.eyebrow}</p>
        <h2 id="voyage-seo-title">{copy.title}</h2>
        {copy.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="voyage-seo-sections">
        {copy.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items ? (
              <div className="voyage-seo-items">
                {section.items.map((item) => (
                  <div key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section className="voyage-faq" aria-labelledby="voyage-faq-title">
        <div>
          <p className="voyage-eyebrow">FAQ</p>
          <h2 id="voyage-faq-title">{copy.faqTitle}</h2>
          <p>{copy.faqDescription}</p>
        </div>
        <div className="voyage-faq-list">
          {copy.faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}

function SeoSchema({ copy }: { copy: VoyageSeoCopy }) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${copy.canonicalUrl}#website`,
        url: copy.canonicalUrl,
        name: copy.siteName,
        description: copy.metaDescription,
        inLanguage: copy.language,
      },
      {
        '@type': 'WebApplication',
        '@id': `${copy.canonicalUrl}#application`,
        url: copy.canonicalUrl,
        name: copy.title,
        description: copy.metaDescription,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern web browser.',
        isAccessibleForFree: true,
        inLanguage: copy.language,
        about: {
          '@type': 'Thing',
          name: 'The Odyssey IMAX 70mm',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${copy.canonicalUrl}#faq`,
        url: copy.canonicalUrl,
        inLanguage: copy.language,
        mainEntity: copy.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}

function VoyageProgress({
  copy,
  onSkip,
}: {
  copy: VoyageCopy;
  onSkip: () => void;
}) {
  const [event, setEvent] = useState(copy.progressEvents[0]);
  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(index + 1, copy.progressEvents.length - 1);
      setEvent(copy.progressEvents[index]);
    }, 1050);
    return () => window.clearInterval(timer);
  }, [copy.progressEvents]);

  return (
    <div className="voyage-progress" role="status" aria-live="polite">
      <div className="voyage-progress-ship">
        <Navigation aria-hidden="true" />
      </div>
      <div>
        <strong>{event}</strong>
        <span>{copy.progressNote}</span>
      </div>
      <button type="button" onClick={onSkip}>
        <SkipForward aria-hidden="true" /> {copy.skip}
      </button>
    </div>
  );
}

function OdysseyMap({
  result,
  activeKind,
  searching,
  copy,
}: {
  result: VoyageSearchResult | null;
  activeKind: 'shortest' | 'hero';
  searching: boolean;
  copy: VoyageCopy;
}) {
  const projected = useMemo(
    () => buildMapProjection(result?.routes ?? []),
    [result]
  );
  return (
    <div
      className="odyssey-map"
      data-searching={searching}
      aria-label={copy.chartLabel}
    >
      <div className="map-tiles" aria-hidden="true">
        {projected.tiles.map((tile) => (
          <img
            key={`${tile.z}-${tile.x}-${tile.y}`}
            className="map-tile"
            src={`/api/voyage/tile?z=${tile.z}&x=${tile.x}&y=${tile.y}`}
            alt=""
            draggable={false}
            style={{
              left: `${tile.left / 10}%`,
              top: `${(tile.top / 520) * 100}%`,
              width: `${tile.size / 10}%`,
              height: `${(tile.size / 520) * 100}%`,
            }}
          />
        ))}
      </div>
      <svg viewBox="0 0 1000 520" role="img" aria-label={copy.chartImageLabel}>
        <defs>
          <filter id="route-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {result
          ? projected.routes.map((route) => (
              <g
                key={route.kind}
                data-active={route.kind === activeKind}
                className={`projected-route projected-${route.kind}`}
              >
                <polyline points={route.points} />
                <circle
                  className="route-origin"
                  cx={route.start.x}
                  cy={route.start.y}
                  r="9"
                />
                <circle
                  className="route-destination-ring"
                  cx={route.end.x}
                  cy={route.end.y}
                  r={route.kind === activeKind ? 18 : 13}
                />
                <circle
                  className="route-destination"
                  cx={route.end.x}
                  cy={route.end.y}
                  r={route.kind === activeKind ? 8 : 6}
                />
              </g>
            ))
          : null}
      </svg>
      <span className="map-attribution">
        ©{' '}
        <a
          href="https://www.maptiler.com/copyright/"
          target="_blank"
          rel="noreferrer"
        >
          MapTiler
        </a>{' '}
        ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>
      </span>
    </div>
  );
}

function buildMapProjection(routes: VoyageRoute[]) {
  const viewWidth = 1000;
  const viewHeight = 520;
  const tileSize = 512;
  const idleBounds: [number, number, number, number] = [-129, 24, -62, 52];
  const all = routes.flatMap((route) => route.geometry);
  const bounds = all.length ? geographicBounds(all) : idleBounds;
  const northWest = mercatorPoint([bounds[0], bounds[3]]);
  const southEast = mercatorPoint([bounds[2], bounds[1]]);
  const normalizedWidth = Math.max(southEast.x - northWest.x, 0.00001);
  const normalizedHeight = Math.max(southEast.y - northWest.y, 0.00001);
  let zoom = 0;
  for (let candidate = 1; candidate <= 13; candidate += 1) {
    const worldSize = tileSize * 2 ** candidate;
    if (
      normalizedWidth * worldSize <= viewWidth * 0.76 &&
      normalizedHeight * worldSize <= viewHeight * 0.72
    ) {
      zoom = candidate;
    } else break;
  }

  const worldSize = tileSize * 2 ** zoom;
  const centerX = ((northWest.x + southEast.x) / 2) * worldSize;
  const centerY = ((northWest.y + southEast.y) / 2) * worldSize;
  const topLeftX = centerX - viewWidth / 2;
  const topLeftY = centerY - viewHeight / 2;
  const firstTileX = Math.floor(topLeftX / tileSize);
  const lastTileX = Math.floor((topLeftX + viewWidth) / tileSize);
  const firstTileY = Math.floor(topLeftY / tileSize);
  const lastTileY = Math.floor((topLeftY + viewHeight) / tileSize);
  const tileCount = 2 ** zoom;
  const tiles = [];
  for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
    if (tileY < 0 || tileY >= tileCount) continue;
    for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount;
      tiles.push({
        z: zoom,
        x: wrappedX,
        y: tileY,
        left: tileX * tileSize - topLeftX,
        top: tileY * tileSize - topLeftY,
        size: tileSize,
      });
    }
  }

  const project = (coordinate: [number, number]) => {
    const point = mercatorPoint(coordinate);
    return {
      x: point.x * worldSize - topLeftX,
      y: point.y * worldSize - topLeftY,
    };
  };
  return {
    tiles,
    routes: routes.map((route) => {
      const points = route.geometry.map(project);
      return {
        kind: route.kind,
        points: points.map((point) => `${point.x},${point.y}`).join(' '),
        start: points[0],
        end: points[points.length - 1],
      };
    }),
  };
}

function geographicBounds(
  coordinates: [number, number][]
): [number, number, number, number] {
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const longitudePadding = Math.max((east - west) * 0.18, 0.02);
  const latitudePadding = Math.max((north - south) * 0.22, 0.015);
  return [
    Math.max(-180, west - longitudePadding),
    Math.max(-85, south - latitudePadding),
    Math.min(180, east + longitudePadding),
    Math.min(85, north + latitudePadding),
  ];
}

function mercatorPoint([longitude, latitude]: [number, number]) {
  const clampedLatitude = Math.max(-85.051129, Math.min(85.051129, latitude));
  const radians = (clampedLatitude * Math.PI) / 180;
  return {
    x: (longitude + 180) / 360,
    y: (1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2,
  };
}

function TheaterIsland({
  route,
  country,
  copy,
}: {
  route: VoyageRoute;
  country: 'US' | 'CA';
  copy: VoyageCopy;
}) {
  const theater = route.theater;
  return (
    <article className="theater-island">
      <div className="theater-island-top">
        <div className="theater-seal">
          <Film aria-hidden="true" />
        </div>
        <div>
          <p>
            {theater.city}, {theater.region}
          </p>
          <h2>{theater.name}</h2>
          <div className="theater-journey">
            <strong>{formatDistance(route.distanceMeters, country)}</strong>
            <span>{formatDuration(route.durationSeconds)}</span>
            <span>
              {route.regionCount}{' '}
              {route.regionCount === 1 ? copy.region : copy.regions}
            </span>
            {route.estimated ? <span>{copy.estimated}</span> : null}
          </div>
        </div>
      </div>
      <dl className="theater-specs">
        <div>
          <dt>{copy.capability}</dt>
          <dd>{theater.formats.join(' · ')}</dd>
        </div>
        <div>
          <dt>{copy.aspectRatio}</dt>
          <dd>{theater.aspectRatio}</dd>
        </div>
        <div>
          <dt>{copy.equipment}</dt>
          <dd>{theater.projector}</dd>
        </div>
        <div>
          <dt>{copy.screening}</dt>
          <dd data-status={theater.screeningStatus}>
            {screeningLabel(theater, copy)}
          </dd>
        </div>
        <div>
          <dt>{copy.verified}</dt>
          <dd>
            {new Date(`${theater.verifiedAt}T00:00:00`).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            )}
          </dd>
        </div>
        <div>
          <dt>{copy.worthVoyage}</dt>
          <dd>{theater.worthVoyage ? copy.worthYes : copy.worthNo}</dd>
        </div>
      </dl>
      <div className="theater-actions">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${theater.latitude},${theater.longitude}`}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation aria-hidden="true" /> {copy.openDirections}{' '}
          <ExternalLink aria-hidden="true" />
        </a>
        <a href={theater.sourceUrl} target="_blank" rel="noreferrer">
          {copy.source} <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function screeningLabel(theater: TheaterCapability, copy: VoyageCopy) {
  if (theater.screeningStatus === 'confirmed') return copy.screeningConfirmed;
  if (theater.screeningStatus === 'not-confirmed')
    return copy.screeningNotConfirmed;
  return copy.screeningUnknown;
}

function formatDistance(meters: number, country: 'US' | 'CA') {
  if (country === 'CA')
    return `${Math.round(meters / 1000).toLocaleString()} km`;
  return `${Math.round(meters / 1609.344).toLocaleString()} mi`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours} hr ${remainder} min` : `${remainder} min`;
}

async function createShareCard(
  result: VoyageSearchResult,
  route: VoyageRoute,
  copy: VoyageCopy
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Share card is not supported in this browser.');
  ctx.fillStyle = '#071a26';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(215,181,109,.18)';
  ctx.lineWidth = 2;
  for (let y = 140; y < 1780; y += 68) {
    ctx.beginPath();
    for (let x = -60; x < 1140; x += 120)
      ctx.quadraticCurveTo(x + 30, y - 18, x + 60, y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#d7b56d';
  ctx.lineWidth = 4;
  ctx.strokeRect(54, 54, 972, 1812);
  ctx.setLineDash([18, 14]);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(190, 1250);
  ctx.bezierCurveTo(300, 980, 620, 1110, 860, 760);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#a86f3d';
  ctx.beginPath();
  ctx.arc(860, 760, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8d9b5';
  ctx.font = '700 38px Georgia';
  ctx.fillText(copy.brand.toUpperCase(), 100, 150);
  ctx.font = '700 74px Georgia';
  wrapCanvasText(ctx, ADVENTURE_LABELS[route.adventureTier], 100, 300, 850, 86);
  ctx.fillStyle = '#6fb7b0';
  ctx.font = '600 32px Arial';
  ctx.fillText(result.departure.city.toUpperCase(), 100, 520);
  ctx.fillStyle = '#e8d9b5';
  ctx.font = '700 48px Georgia';
  wrapCanvasText(ctx, route.theater.name, 100, 610, 820, 58);
  ctx.font = '700 44px Arial';
  ctx.fillStyle = '#d7b56d';
  ctx.fillText(
    `${formatDistance(route.distanceMeters, result.departure.country)} · ${formatDuration(route.durationSeconds)}`,
    100,
    1430
  );
  ctx.font = '400 30px Arial';
  ctx.fillStyle = '#e8d9b5';
  ctx.fillText(route.theater.formats.join(' · '), 100, 1500);
  ctx.font = '700 50px Georgia';
  ctx.fillStyle = '#e8d9b5';
  ctx.fillText(copy.shareQuestion, 100, 1725);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value
          ? resolve(value)
          : reject(new Error('Could not create share card.')),
      'image/png'
    )
  );
  return { blob, url: URL.createObjectURL(blob) };
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, y);
}

function ShareDialog({
  preview,
  result,
  route,
  copy,
  onClose,
}: {
  preview: { url: string; blob: Blob };
  result: VoyageSearchResult;
  route: VoyageRoute;
  copy: VoyageCopy;
  onClose: () => void;
}) {
  async function share() {
    const file = new File([preview.blob], 'imax-odyssey.png', {
      type: 'image/png',
    });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: copy.brand,
        text: copy.shareQuestion,
      });
    } else download();
  }
  function download() {
    const anchor = document.createElement('a');
    anchor.href = preview.url;
    anchor.download = `imax-odyssey-${result.departure.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    anchor.click();
  }
  return (
    <div
      className="share-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={copy.share}
    >
      <button
        className="share-backdrop"
        type="button"
        onClick={onClose}
        aria-label={copy.close}
      />
      <div className="share-dialog-panel">
        <img
          src={preview.url}
          alt={`${ADVENTURE_LABELS[route.adventureTier]} share card`}
        />
        <div>
          <Button onClick={share}>
            <Share2 aria-hidden="true" /> {copy.systemShare}
          </Button>
          <Button variant="outline" onClick={download}>
            <Download aria-hidden="true" /> {copy.download}
          </Button>
          <button type="button" onClick={onClose}>
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
