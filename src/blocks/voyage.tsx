import { m } from '@/paraglide/messages.js';
import { VoyageExperience } from '@/components/voyage-experience';

export function Voyage() {
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
      }}
    />
  );
}
