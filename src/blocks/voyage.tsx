import { envConfigs } from '@/config';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import * as m from '@/blocks/voyage-messages';
import { VoyageExperience } from '@/components/voyage-experience';

export function Voyage() {
  const locale = getLocale();
  const canonicalUrl = localizeUrl(`${envConfigs.app_url}/`, { locale }).href;

  return (
    <VoyageExperience
      copy={{
        brand: m['voyage.brand'](),
        eyebrow: m['voyage.eyebrow'](),
        headline: m['voyage.headline'](),
        subheadline: m['voyage.subheadline'](),
        departureLabel: m['voyage.departure.label'](),
        departurePlaceholder: m['voyage.departure.placeholder'](),
        submit: m['voyage.submit'](),
        searching: m['voyage.searching'](),
        skip: m['voyage.skip'](),
        missionsLabel: m['voyage.missions.label'](),
        missions: {
          closest: {
            title: m['voyage.missions.closest.title'](),
            description: m['voyage.missions.closest.description'](),
          },
          'best-format': {
            title: m['voyage.missions.best.title'](),
            description: m['voyage.missions.best.description'](),
          },
          '70mm-only': {
            title: m['voyage.missions.70mm.title'](),
            description: m['voyage.missions.70mm.description'](),
          },
          'worth-voyage': {
            title: m['voyage.missions.worth.title'](),
            description: m['voyage.missions.worth.description'](),
          },
        },
        shortest: m['voyage.routes.shortest'](),
        hero: m['voyage.routes.hero'](),
        capability: m['voyage.details.capability'](),
        aspectRatio: m['voyage.details.aspect_ratio'](),
        equipment: m['voyage.details.equipment'](),
        screening: m['voyage.details.screening'](),
        screeningUnknown: m['voyage.details.screening_unknown'](),
        screeningConfirmed: m['voyage.details.screening_confirmed'](),
        screeningNotConfirmed: m['voyage.details.screening_not_confirmed'](),
        verified: m['voyage.details.verified'](),
        estimated: m['voyage.details.estimated'](),
        worthVoyage: m['voyage.details.worth'](),
        openDirections: m['voyage.details.directions'](),
        share: m['voyage.share.title'](),
        shareQuestion: m['voyage.share.question'](),
        download: m['voyage.share.download'](),
        systemShare: m['voyage.share.system'](),
        close: m['voyage.share.close'](),
        methodLink: m['voyage.method.link'](),
        resultTitle: m['voyage.result.title'](),
        resultSummary: (city, theater) =>
          m['voyage.result.summary']({ city, theater }),
        routeTabsLabel: m['voyage.routes.label'](),
        methodEyebrow: m['voyage.method.eyebrow'](),
        methodTitle: m['voyage.method.title'](),
        progressEvents: [
          m['voyage.progress.athena'](),
          m['voyage.progress.stars'](),
          m['voyage.progress.sirens'](),
          m['voyage.progress.poseidon'](),
        ],
        progressNote: m['voyage.progress.note'](),
        chartLabel: m['voyage.chart.label'](),
        chartImageLabel: m['voyage.chart.image_label'](),
        region: m['voyage.details.region'](),
        regions: m['voyage.details.regions'](),
        worthYes: m['voyage.details.worth_yes'](),
        worthNo: m['voyage.details.worth_no'](),
        source: m['voyage.details.source'](),
        validation: m['voyage.validation.departure'](),
        noResultsTitle: m['voyage.empty.title'](),
        noResultsBody: m['voyage.empty.body'](),
        disclaimer: m['voyage.disclaimer'](),
        dataNote: m['voyage.data_note'](),
        dataCredit: m['voyage.data_credit'](),
      }}
      seo={{
        canonicalUrl,
        language: locale,
        siteName: envConfigs.app_name,
        metaDescription: m['voyage.metadata.description'](),
        eyebrow: m['voyage.seo.eyebrow'](),
        title: m['voyage.seo.title'](),
        introduction: [m['voyage.seo.intro.1'](), m['voyage.seo.intro.2']()],
        sections: [
          {
            title: m['voyage.seo.find.title'](),
            paragraphs: [m['voyage.seo.find.1'](), m['voyage.seo.find.2']()],
          },
          {
            title: m['voyage.seo.formats.title'](),
            paragraphs: [m['voyage.seo.formats.intro']()],
            items: [
              {
                title: m['voyage.seo.formats.1570.title'](),
                body: m['voyage.seo.formats.1570.body'](),
              },
              {
                title: m['voyage.seo.formats.gt.title'](),
                body: m['voyage.seo.formats.gt.body'](),
              },
              {
                title: m['voyage.seo.formats.digital.title'](),
                body: m['voyage.seo.formats.digital.body'](),
              },
            ],
          },
          {
            title: m['voyage.seo.choose.title'](),
            paragraphs: [
              m['voyage.seo.choose.1'](),
              m['voyage.seo.choose.2'](),
            ],
            items: [
              {
                title: m['voyage.seo.choose.item1.title'](),
                body: m['voyage.seo.choose.item1.body'](),
              },
              {
                title: m['voyage.seo.choose.item2.title'](),
                body: m['voyage.seo.choose.item2.body'](),
              },
              {
                title: m['voyage.seo.choose.item3.title'](),
                body: m['voyage.seo.choose.item3.body'](),
              },
              {
                title: m['voyage.seo.choose.item4.title'](),
                body: m['voyage.seo.choose.item4.body'](),
              },
            ],
          },
          {
            title: m['voyage.seo.screenings.title'](),
            paragraphs: [
              m['voyage.seo.screenings.1'](),
              m['voyage.seo.screenings.2'](),
            ],
          },
          {
            title: m['voyage.seo.route.title'](),
            paragraphs: [m['voyage.seo.route.1'](), m['voyage.seo.route.2']()],
          },
          {
            title: m['voyage.seo.verify.title'](),
            paragraphs: [
              m['voyage.seo.verify.1'](),
              m['voyage.seo.verify.2'](),
            ],
          },
        ],
        faqTitle: m['voyage.seo.faq.title'](),
        faqDescription: m['voyage.seo.faq.description'](),
        faqs: [
          {
            question: m['voyage.seo.faq.1.question'](),
            answer: m['voyage.seo.faq.1.answer'](),
          },
          {
            question: m['voyage.seo.faq.2.question'](),
            answer: m['voyage.seo.faq.2.answer'](),
          },
          {
            question: m['voyage.seo.faq.3.question'](),
            answer: m['voyage.seo.faq.3.answer'](),
          },
          {
            question: m['voyage.seo.faq.4.question'](),
            answer: m['voyage.seo.faq.4.answer'](),
          },
          {
            question: m['voyage.seo.faq.5.question'](),
            answer: m['voyage.seo.faq.5.answer'](),
          },
          {
            question: m['voyage.seo.faq.6.question'](),
            answer: m['voyage.seo.faq.6.answer'](),
          },
        ],
      }}
    />
  );
}
