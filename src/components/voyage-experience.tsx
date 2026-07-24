import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  Anchor,
  Check,
  Download,
  ExternalLink,
  Info,
  LoaderCircle,
  LocateFixed,
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
  type TheaterCapability,
  type VoyageMission,
  type VoyageSearchRequest,
  type VoyageSearchResult,
  type VoyageTheaterMatch,
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
  useLocation: string;
  locating: string;
  currentLocation: string;
  locationUnsupported: string;
  locationDenied: string;
  locationUnavailable: string;
  submit: string;
  searching: string;
  skip: string;
  missionsLabel: string;
  missions: Record<VoyageMission, { title: string; description: string }>;
  nearest: string;
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
  resultSummary: (city: string, count: number) => string;
  resultsLabel: string;
  methodEyebrow: string;
  methodTitle: string;
  progressEvents: string[];
  progressNote: string;
  worthYes: string;
  worthNo: string;
  source: string;
  validation: string;
  noResultsTitle: string;
  noResultsBody: string;
  disclaimer: string;
  dataNote: string;
  dataCredit: string;
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

export function VoyageExperience({
  copy,
  seo,
}: {
  copy: VoyageCopy;
  seo: VoyageSeoCopy;
}) {
  const [result, setResult] = useState<VoyageSearchResult | null>(null);
  const [showVoyage, setShowVoyage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [sharePreview, setSharePreview] = useState<{
    url: string;
    blob: Blob;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (request: VoyageSearchRequest) =>
      apiPost<VoyageSearchResult>('/api/voyage/search', request),
    onSuccess: (data) => {
      setResult(data);
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

  const nearestMatch = result?.matches[0];

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error(copy.locationUnsupported);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        setShowVoyage(true);
        mutation.mutate({
          departure: copy.currentLocation,
          mission: form.state.values.mission,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (error) => {
        setIsLocating(false);
        toast.error(
          error.code === 1 ? copy.locationDenied : copy.locationUnavailable
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 5 * 60_000,
      }
    );
  }

  async function openShareCard() {
    if (!result || !nearestMatch) return;
    const card = await createShareCard(result, nearestMatch, copy);
    setSharePreview(card);
  }

  return (
    <div className="voyage-shell">
      <header className="voyage-header">
        <a className="voyage-brand" href="/" aria-label={copy.brand}>
          <span className="voyage-brand-mark">
            <img src="/favicon.png" alt={copy.brand} aria-hidden="true" />
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
                      autoComplete="address-level2"
                      disabled={mutation.isPending}
                    />
                  </div>
                )}
              </form.Field>
              <div className="voyage-departure-actions">
                <Button
                  className="voyage-location-button"
                  type="button"
                  variant="outline"
                  disabled={isLocating || mutation.isPending}
                  data-loading={isLocating}
                  onClick={useCurrentLocation}
                >
                  {isLocating ? (
                    <LoaderCircle aria-hidden="true" />
                  ) : (
                    <LocateFixed aria-hidden="true" />
                  )}
                  {isLocating ? copy.locating : copy.useLocation}
                </Button>
                <Button
                  className="voyage-submit"
                  type="submit"
                  disabled={isLocating || mutation.isPending}
                >
                  <Navigation aria-hidden="true" />
                  {mutation.isPending ? copy.searching : copy.submit}
                </Button>
              </div>
            </div>
          </form>

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

        {result && nearestMatch ? (
          <section className="voyage-results" aria-labelledby="result-heading">
            <div className="voyage-result-heading">
              <div>
                <p className="voyage-eyebrow">
                  <Sparkles aria-hidden="true" /> {copy.nearest}
                </p>
                <h2 id="result-heading">{copy.resultTitle}</h2>
                <p>
                  {copy.resultSummary(
                    result.departure.city,
                    result.matches.length
                  )}
                </p>
              </div>
              <Button className="voyage-share-button" onClick={openShareCard}>
                <Share2 aria-hidden="true" /> {copy.share}
              </Button>
            </div>

            <ol className="voyage-theater-grid" aria-label={copy.resultsLabel}>
              {result.matches.map((match) => (
                <li key={match.theater.id}>
                  <TheaterIsland
                    match={match}
                    country={result.departure.country}
                    copy={copy}
                  />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section id="method" className="voyage-method">
          <div>
            <p className="voyage-eyebrow">
              <RouteIcon aria-hidden="true" /> {copy.methodEyebrow}
            </p>
            <h2>{copy.methodTitle}</h2>
          </div>
          <div>
            <p>{copy.dataNote}</p>
            <p>
              <a
                href="https://github.com/r-imax/imaxguide"
                target="_blank"
                rel="noreferrer"
              >
                {copy.dataCredit}
              </a>
            </p>
          </div>
        </section>

        <SeoGuide copy={seo} />
      </main>

      <footer className="voyage-footer">
        <span>{copy.brand}</span>
        <p>{copy.disclaimer}</p>
      </footer>

      {sharePreview && result && nearestMatch ? (
        <ShareDialog
          preview={sharePreview}
          result={result}
          match={nearestMatch}
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

function TheaterIsland({
  match,
  country,
  copy,
}: {
  match: VoyageTheaterMatch;
  country: string;
  copy: VoyageCopy;
}) {
  const theater = match.theater;
  return (
    <article className="theater-island">
      <div className="theater-island-top">
        <div className="theater-seal" aria-label={`#${match.rank}`}>
          {String(match.rank).padStart(2, '0')}
        </div>
        <div>
          <p>
            {[theater.city, theater.region].filter(Boolean).join(', ')} ·{' '}
            {theater.countryName ?? theater.country}
          </p>
          <h3>{theater.name}</h3>
          <div className="theater-journey">
            <strong>{formatDistance(match.distanceMeters, country)}</strong>
            <span>{copy.estimated}</span>
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
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            [
              theater.name,
              theater.city,
              theater.region,
              theater.countryName ?? theater.country,
            ]
              .filter(Boolean)
              .join(', ')
          )}`}
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

function formatDistance(meters: number, country: string) {
  if (['US', 'GB', 'LR', 'MM'].includes(country)) {
    const miles = meters / 1609.344;
    return miles < 1 ? '<1 mi' : `${Math.round(miles).toLocaleString()} mi`;
  }
  const kilometers = meters / 1000;
  return kilometers < 1
    ? '<1 km'
    : `${Math.round(kilometers).toLocaleString()} km`;
}

async function createShareCard(
  result: VoyageSearchResult,
  match: VoyageTheaterMatch,
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
  wrapCanvasText(ctx, copy.nearest, 100, 300, 850, 86);
  ctx.fillStyle = '#6fb7b0';
  ctx.font = '600 32px Arial';
  ctx.fillText(result.departure.city.toUpperCase(), 100, 520);
  ctx.fillStyle = '#e8d9b5';
  ctx.font = '700 48px Georgia';
  wrapCanvasText(ctx, match.theater.name, 100, 610, 820, 58);
  ctx.font = '700 44px Arial';
  ctx.fillStyle = '#d7b56d';
  ctx.fillText(
    formatDistance(match.distanceMeters, result.departure.country),
    100,
    1430
  );
  ctx.font = '400 30px Arial';
  ctx.fillStyle = '#e8d9b5';
  ctx.fillText(match.theater.formats.join(' · '), 100, 1500);
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
  match,
  copy,
  onClose,
}: {
  preview: { url: string; blob: Blob };
  result: VoyageSearchResult;
  match: VoyageTheaterMatch;
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
        <img src={preview.url} alt={`${match.theater.name} share card`} />
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
