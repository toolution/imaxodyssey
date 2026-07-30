import { useEffect, useRef, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import {
  Anchor,
  AtSign,
  Check,
  Copy,
  Download,
  ExternalLink,
  Globe2,
  Info,
  LoaderCircle,
  LocateFixed,
  MessageCircle,
  Navigation,
  Route as RouteIcon,
  Send,
  Share2,
  SkipForward,
  Sparkles,
  Users,
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
import {
  VoyagePrompts,
  type VoyagePromptCopy,
  type VoyagePromptKind,
} from '@/components/voyage-prompts';

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
  sharePlatforms: string;
  copyLink: string;
  linkCopied: string;
  copyFailed: string;
  shareImageNote: string;
  popups: {
    theaters: VoyagePromptCopy['theaters'] & {
      description: (city: string, count: number) => string;
    };
    gratitude: VoyagePromptCopy['gratitude'];
  };
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
  navigation: Array<{ href: string; label: string }>;
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

const THEATER_PROMPT_STORAGE_KEY = 'imax-odyssey:theater-info-prompt-v2';
const GRATITUDE_STORAGE_KEY = 'imax-odyssey:gratitude-prompt';
const GRATITUDE_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const GRATITUDE_DWELL_MS = 30 * 1000;
const socialPlatforms = [
  { id: 'x', label: 'X', icon: AtSign },
  { id: 'facebook', label: 'Facebook', icon: Users },
  { id: 'reddit', label: 'Reddit', icon: MessageCircle },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', icon: Send },
  { id: 'bluesky', label: 'Bluesky', icon: Globe2 },
] as const;

type SocialPlatformId = (typeof socialPlatforms)[number]['id'];

export function VoyageExperience({
  copy,
  seo,
}: {
  copy: VoyageCopy;
  seo: VoyageSeoCopy;
}) {
  const resultsRef = useRef<HTMLElement>(null);
  const [result, setResult] = useState<VoyageSearchResult | null>(null);
  const [showVoyage, setShowVoyage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activePrompt, setActivePrompt] = useState<VoyagePromptKind | null>(
    null
  );
  const [theaterPromptPending, setTheaterPromptPending] = useState(false);
  const [resultsEngaged, setResultsEngaged] = useState(false);
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
      if (
        data.matches.length > 0 &&
        readStorage('local', THEATER_PROMPT_STORAGE_KEY) !== '1'
      ) {
        setTheaterPromptPending(true);
      }
    },
    onError: (error: Error) => {
      setShowVoyage(false);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!theaterPromptPending || activePrompt || sharePreview) return;

    const timer = window.setTimeout(() => {
      setTheaterPromptPending(false);
      writeStorage('local', THEATER_PROMPT_STORAGE_KEY, '1');
      setActivePrompt('theaters');
    }, 550);
    return () => window.clearTimeout(timer);
  }, [activePrompt, sharePreview, theaterPromptPending]);

  useEffect(() => {
    setResultsEngaged(false);
    const element = resultsRef.current;
    if (!result?.matches.length || !element) return;

    if (!('IntersectionObserver' in window)) {
      setResultsEngaged(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.35) return;
        setResultsEngaged(true);
        observer.disconnect();
      },
      { threshold: [0.35] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [result]);

  useEffect(() => {
    if (
      !resultsEngaged ||
      activePrompt ||
      theaterPromptPending ||
      sharePreview ||
      gratitudePromptWasShownRecently()
    ) {
      return;
    }

    let retryTimer: number | undefined;
    const showPrompt = () => {
      if (document.visibilityState !== 'visible') {
        retryTimer = window.setTimeout(showPrompt, 5_000);
        return;
      }
      markGratitudePromptSeen();
      setActivePrompt('gratitude');
    };
    const dwellTimer = window.setTimeout(showPrompt, GRATITUDE_DWELL_MS);

    return () => {
      window.clearTimeout(dwellTimer);
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [activePrompt, resultsEngaged, sharePreview, theaterPromptPending]);

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
  const theaterPromptDescription = result
    ? copy.popups.theaters.description(
        result.departure.city,
        result.matches.length
      )
    : '';

  function useCurrentLocation() {
    if (isLocating || mutation.isPending) return;

    if (typeof window === 'undefined' || !window.navigator.geolocation) {
      toast.error(copy.locationUnsupported);
      return;
    }

    const mission = form.state.values.mission;
    setIsLocating(true);
    try {
      window.navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setIsLocating(false);
          setShowVoyage(true);
          mutation.mutate({
            departure: copy.currentLocation,
            mission,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (error) => {
          setIsLocating(false);
          toast.error(
            error.code === error.PERMISSION_DENIED
              ? copy.locationDenied
              : copy.locationUnavailable
          );
        },
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 5 * 60_000,
        }
      );
    } catch {
      setIsLocating(false);
      toast.error(copy.locationUnavailable);
    }
  }

  async function openShareCard() {
    if (!result || !nearestMatch) return;
    markGratitudePromptSeen();
    const card = await createShareCard(
      result,
      nearestMatch,
      copy,
      seo.canonicalUrl
    );
    setSharePreview(card);
  }

  function shareFromPrompt() {
    setActivePrompt(null);
    void openShareCard();
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
        <nav className="voyage-method-link" aria-label={copy.brand}>
          {copy.navigation.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a href="#method">
            <Info aria-hidden="true" /> {copy.methodLink}
          </a>
        </nav>
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
          <section
            ref={resultsRef}
            className="voyage-results"
            aria-labelledby="result-heading"
          >
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
        <nav aria-label={copy.brand}>
          {copy.navigation.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <p>{copy.disclaimer}</p>
      </footer>

      <VoyagePrompts
        prompt={activePrompt}
        copy={{
          close: copy.close,
          theaters: {
            eyebrow: copy.popups.theaters.eyebrow,
            title: copy.popups.theaters.title,
            confirm: copy.popups.theaters.confirm,
          },
          gratitude: copy.popups.gratitude,
        }}
        theaterDescription={theaterPromptDescription}
        onClose={() => setActivePrompt(null)}
        onShare={shareFromPrompt}
      />

      {sharePreview && result && nearestMatch ? (
        <ShareDialog
          preview={sharePreview}
          result={result}
          match={nearestMatch}
          copy={copy}
          shareUrl={seo.canonicalUrl}
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
          href={theaterDirectionsUrl(theater)}
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

function theaterDirectionsUrl(theater: TheaterCapability) {
  const destination = [
    theater.name,
    theater.city,
    theater.region,
    theater.countryName ?? theater.country,
  ]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function readStorage(kind: 'local' | 'session', key: string) {
  try {
    const storage =
      kind === 'local' ? window.localStorage : window.sessionStorage;
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(kind: 'local' | 'session', key: string, value: string) {
  try {
    const storage =
      kind === 'local' ? window.localStorage : window.sessionStorage;
    storage.setItem(key, value);
  } catch {
    // Private browsing modes can disable storage; the prompt still works.
  }
}

function gratitudePromptWasShownRecently() {
  const shownAt = Number(readStorage('local', GRATITUDE_STORAGE_KEY));
  return (
    Number.isFinite(shownAt) && Date.now() - shownAt < GRATITUDE_COOLDOWN_MS
  );
}

function markGratitudePromptSeen() {
  writeStorage('local', GRATITUDE_STORAGE_KEY, String(Date.now()));
}

async function createShareCard(
  result: VoyageSearchResult,
  match: VoyageTheaterMatch,
  copy: VoyageCopy,
  shareUrl: string
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
  ctx.strokeStyle = 'rgba(215,181,109,.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 1770);
  ctx.lineTo(980, 1770);
  ctx.stroke();
  ctx.font = '600 26px Arial';
  ctx.fillStyle = '#6fb7b0';
  ctx.fillText(displayShareUrl(shareUrl), 100, 1820, 860);
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

function displayShareUrl(shareUrl: string) {
  try {
    const url = new URL(shareUrl);
    const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    return `${url.host}${path}`;
  } catch {
    return shareUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

function socialShareUrl(
  platform: SocialPlatformId,
  shareUrl: string,
  text: string
) {
  const textWithUrl = `${text}\n${shareUrl}`;
  const destinations: Record<SocialPlatformId, [string, URLSearchParams]> = {
    x: [
      'https://twitter.com/intent/tweet',
      new URLSearchParams({ text, url: shareUrl }),
    ],
    facebook: [
      'https://www.facebook.com/sharer/sharer.php',
      new URLSearchParams({ u: shareUrl }),
    ],
    reddit: [
      'https://www.reddit.com/submit',
      new URLSearchParams({ title: text, url: shareUrl }),
    ],
    whatsapp: ['https://wa.me/', new URLSearchParams({ text: textWithUrl })],
    telegram: [
      'https://t.me/share/url',
      new URLSearchParams({ text, url: shareUrl }),
    ],
    bluesky: [
      'https://bsky.app/intent/compose',
      new URLSearchParams({ text: textWithUrl }),
    ],
  };
  const [baseUrl, params] = destinations[platform];
  return `${baseUrl}?${params.toString()}`;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Clipboard unavailable');
}

function ShareDialog({
  preview,
  result,
  match,
  copy,
  shareUrl,
  onClose,
}: {
  preview: { url: string; blob: Blob };
  result: VoyageSearchResult;
  match: VoyageTheaterMatch;
  copy: VoyageCopy;
  shareUrl: string;
  onClose: () => void;
}) {
  async function share() {
    const file = new File([preview.blob], 'imax-odyssey.png', {
      type: 'image/png',
    });
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
      download();
      return;
    }

    const text = `${copy.shareQuestion}\n${shareUrl}`;
    try {
      await navigator.share({
        files: [file],
        title: copy.brand,
        text,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      if (error instanceof TypeError) {
        try {
          await navigator.share({ files: [file], title: copy.brand, text });
        } catch (fallbackError) {
          if (
            fallbackError instanceof DOMException &&
            fallbackError.name === 'AbortError'
          ) {
            return;
          }
          toast.error(
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError)
          );
        }
        return;
      }
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  function download() {
    const anchor = document.createElement('a');
    anchor.href = preview.url;
    anchor.download = `imax-odyssey-${result.departure.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
    anchor.click();
  }

  async function copyWebsiteLink() {
    try {
      await copyText(shareUrl);
      toast.success(copy.linkCopied);
    } catch (error) {
      toast.error(copy.copyFailed);
    }
  }

  function shareToPlatform(platform: SocialPlatformId) {
    window.open(
      socialShareUrl(platform, shareUrl, copy.shareQuestion),
      '_blank',
      'noopener,noreferrer,width=720,height=720'
    );
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
        <div className="share-dialog-actions">
          <div className="share-dialog-file-actions">
            <Button onClick={share}>
              <Share2 aria-hidden="true" /> {copy.systemShare}
            </Button>
            <Button variant="outline" onClick={download}>
              <Download aria-hidden="true" /> {copy.download}
            </Button>
          </div>

          <div className="share-dialog-platforms">
            <p>{copy.sharePlatforms}</p>
            <div className="share-dialog-platform-grid">
              {socialPlatforms.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() => shareToPlatform(id)}
                >
                  <Icon aria-hidden="true" /> {label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="share-dialog-copy-link"
            variant="outline"
            onClick={copyWebsiteLink}
          >
            <Copy aria-hidden="true" /> {copy.copyLink}
          </Button>
          <p className="share-dialog-note">{copy.shareImageNote}</p>
          <button
            className="share-dialog-close"
            type="button"
            onClick={onClose}
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
