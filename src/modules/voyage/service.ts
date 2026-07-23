import { geocodePort } from '@/core/maps/maptiler';
import {
  drivingMatrix,
  drivingRoute,
  haversineMeters,
} from '@/core/maps/tomtom';
import { theaterCatalog } from '@/config/theaters/catalog';
import type {
  AdventureTier,
  TheaterCapability,
  VoyageMission,
  VoyageRoute,
  VoyageSearchResult,
} from '@/lib/voyage';

interface RankedCandidate {
  theater: TheaterCapability;
  distanceMeters: number;
  durationSeconds: number;
  formatScore: number;
}

const cityCoordinateUncertainty = {
  distanceMeters: 8_000,
  durationSeconds: 15 * 60,
};

function coordinateUncertainty(theater: TheaterCapability) {
  return theater.coordinatePrecision === 'city'
    ? cityCoordinateUncertainty
    : { distanceMeters: 0, durationSeconds: 0 };
}

export function adventureTier(durationSeconds: number): AdventureTier {
  const minutes = durationSeconds / 60;
  if (minutes < 30) return 'athenas-favor';
  if (minutes < 90) return 'sirens-call';
  if (minutes < 180) return 'cyclops-territory';
  if (minutes < 360) return 'poseidons-curse';
  return 'ten-year-odyssey';
}

export function formatScore(theater: TheaterCapability) {
  let score = theater.has1570
    ? 100
    : theater.hasGtLaser
      ? 82
      : theater.formats.some((format) => format.includes('Laser'))
        ? 58
        : 30;
  if (theater.aspectRatio.includes('1.43')) score += 12;
  if (theater.worthVoyage) score += 6;
  if (theater.screeningStatus === 'confirmed') score += 24;
  return score;
}

function appliesToMission(theater: TheaterCapability, mission: VoyageMission) {
  if (theater.commercialFilms === 'no') return false;
  if (mission === '70mm-only') return theater.has1570;
  return true;
}

function selectHero(
  candidates: RankedCandidate[],
  shortest: RankedCandidate,
  mission: VoyageMission
) {
  if (mission === 'closest') return shortest;
  const maxDuration =
    mission === '70mm-only'
      ? Number.POSITIVE_INFINITY
      : shortest.durationSeconds + 3 * 3600;
  return (
    candidates
      .filter((candidate) => candidate.durationSeconds <= maxDuration)
      .sort((a, b) => {
        const aUtility = a.formatScore * 1000 - a.durationSeconds / 15;
        const bUtility = b.formatScore * 1000 - b.durationSeconds / 15;
        return bUtility - aUtility;
      })[0] ?? shortest
  );
}

async function hydrateRoute(
  candidate: RankedCandidate,
  kind: 'shortest' | 'hero',
  origin: [number, number],
  originRegion: string,
  originCountry: string
): Promise<VoyageRoute> {
  const destination: [number, number] = [
    candidate.theater.longitude,
    candidate.theater.latitude,
  ];
  const routed = await drivingRoute(origin, destination);
  const uncertainty = coordinateUncertainty(candidate.theater);
  const distanceMeters =
    routed.metric.distanceMeters + uncertainty.distanceMeters;
  const durationSeconds =
    routed.metric.durationSeconds + uncertainty.durationSeconds;
  return {
    kind,
    theater: candidate.theater,
    distanceMeters,
    durationSeconds,
    geometry: routed.geometry,
    estimated:
      routed.estimated || candidate.theater.coordinatePrecision === 'city',
    regionCount: new Set(
      [
        [originCountry, originRegion].filter(Boolean).join(':'),
        [candidate.theater.country, candidate.theater.region]
          .filter(Boolean)
          .join(':'),
      ].filter(Boolean)
    ).size,
    adventureTier: adventureTier(durationSeconds),
    formatScore: candidate.formatScore,
  };
}

export async function searchVoyages(
  departure: string,
  mission: VoyageMission
): Promise<VoyageSearchResult> {
  const port = await geocodePort(departure);
  const origin: [number, number] = [port.longitude, port.latitude];
  const eligible = theaterCatalog
    .filter((theater) => appliesToMission(theater, mission))
    .map((theater) => {
      const uncertainty = coordinateUncertainty(theater);
      const directMeters = haversineMeters(
        port.latitude,
        port.longitude,
        theater.latitude,
        theater.longitude
      );
      return {
        theater,
        directMeters,
        uncertainty,
        rankingMeters: directMeters + uncertainty.distanceMeters,
      };
    })
    .sort((a, b) => a.rankingMeters - b.rankingMeters)
    .slice(0, 23);

  if (!eligible.length)
    throw new Error(
      'Poseidon has blocked this route. No matching theater is in the current chart.'
    );
  const metrics = await drivingMatrix(
    origin,
    eligible.map(({ theater }) => [theater.longitude, theater.latitude])
  );
  const ranked: RankedCandidate[] = eligible
    .map(({ theater, directMeters, uncertainty }, index) => {
      const estimatedDistance = directMeters * 1.2;
      return {
        theater,
        distanceMeters:
          (metrics[index]?.distanceMeters ?? estimatedDistance) +
          uncertainty.distanceMeters,
        durationSeconds:
          (metrics[index]?.durationSeconds ??
            (estimatedDistance / 1609.344 / 55) * 3600) +
          uncertainty.durationSeconds,
        formatScore: formatScore(theater),
      };
    })
    .sort((a, b) => a.durationSeconds - b.durationSeconds);

  const shortest = ranked[0];
  const hero = selectHero(ranked, shortest, mission);
  const shortestRoute = await hydrateRoute(
    shortest,
    'shortest',
    origin,
    port.region,
    port.country
  );
  const routes = [shortestRoute];
  if (hero.theater.id !== shortest.theater.id)
    routes.push(
      await hydrateRoute(hero, 'hero', origin, port.region, port.country)
    );

  return {
    departure: port,
    mission,
    routes,
    searchedTheaters: eligible.length,
    usedEstimatedRoutes: routes.some((route) => route.estimated),
  };
}
