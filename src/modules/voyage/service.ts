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
  originRegion: string
): Promise<VoyageRoute> {
  const destination: [number, number] = [
    candidate.theater.longitude,
    candidate.theater.latitude,
  ];
  const routed = await drivingRoute(origin, destination);
  return {
    kind,
    theater: candidate.theater,
    distanceMeters: routed.metric.distanceMeters,
    durationSeconds: routed.metric.durationSeconds,
    geometry: routed.geometry,
    estimated: routed.estimated,
    regionCount: new Set(
      [originRegion, candidate.theater.region].filter(Boolean)
    ).size,
    adventureTier: adventureTier(routed.metric.durationSeconds),
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
    .map((theater) => ({
      theater,
      directMeters: haversineMeters(
        port.latitude,
        port.longitude,
        theater.latitude,
        theater.longitude
      ),
    }))
    .sort((a, b) => a.directMeters - b.directMeters)
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
    .map(({ theater, directMeters }, index) => ({
      theater,
      distanceMeters: metrics[index]?.distanceMeters ?? directMeters * 1.2,
      durationSeconds:
        metrics[index]?.durationSeconds ??
        ((directMeters * 1.2) / 1609.344 / 55) * 3600,
      formatScore: formatScore(theater),
    }))
    .sort((a, b) => a.durationSeconds - b.durationSeconds);

  const shortest = ranked[0];
  const hero = selectHero(ranked, shortest, mission);
  const shortestRoute = await hydrateRoute(
    shortest,
    'shortest',
    origin,
    port.region
  );
  const routes = [shortestRoute];
  if (hero.theater.id !== shortest.theater.id)
    routes.push(await hydrateRoute(hero, 'hero', origin, port.region));

  return {
    departure: port,
    mission,
    routes,
    searchedTheaters: eligible.length,
    usedEstimatedRoutes: routes.some((route) => route.estimated),
  };
}
