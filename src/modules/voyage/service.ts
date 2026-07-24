import { theaterCatalog } from '@/config/theaters/catalog';
import type {
  TheaterCapability,
  VoyageMission,
  VoyageSearchResult,
} from '@/lib/voyage';

interface LocalDeparture {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  aliases: string[];
  theaterCount?: number;
}

interface DepartureCoordinates {
  latitude: number;
  longitude: number;
}

const resultLimit = 6;

const knownDepartures: LocalDeparture[] = [
  departure('New York', 'NY', 'US', 40.7128, -74.006, ['10001']),
  departure('Los Angeles', 'CA', 'US', 34.0522, -118.2437, ['90001']),
  departure('San Francisco', 'CA', 'US', 37.7749, -122.4194),
  departure('Chicago', 'IL', 'US', 41.8781, -87.6298),
  departure('Dallas', 'TX', 'US', 32.7767, -96.797),
  departure('Austin', 'TX', 'US', 30.2672, -97.7431),
  departure('Boston', 'MA', 'US', 42.3601, -71.0589),
  departure('Washington', 'DC', 'US', 38.9072, -77.0369),
  departure('Toronto', 'ON', 'CA', 43.6532, -79.3832),
  departure('Montreal', 'QC', 'CA', 45.5019, -73.5674),
  departure('Vancouver', 'BC', 'CA', 49.2827, -123.1207),
  departure('Calgary', 'AB', 'CA', 51.0447, -114.0719),
  departure('London', 'England', 'GB', 51.5074, -0.1278),
  departure('Tokyo', 'Tokyo', 'JP', 35.6762, 139.6503),
  departure('Sydney', 'NSW', 'AU', -33.8688, 151.2093),
  departure('Singapore', '', 'SG', 1.3521, 103.8198),
];

const catalogDepartures = buildCatalogDepartures();

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
  if (mission === 'best-format')
    return (
      theater.has1570 ||
      theater.hasGtLaser ||
      theater.aspectRatio.includes('1.43')
    );
  if (mission === 'worth-voyage') return theater.worthVoyage;
  return true;
}

export async function searchVoyages(
  departure: string,
  mission: VoyageMission,
  coordinates?: DepartureCoordinates
): Promise<VoyageSearchResult> {
  const port = coordinates
    ? {
        city: departure,
        region: '',
        country: '',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }
    : resolveDeparture(departure);
  const eligible = theaterCatalog
    .filter((theater) => appliesToMission(theater, mission))
    .map((theater) => {
      const distanceMeters = haversineMeters(
        port.latitude,
        port.longitude,
        theater.latitude,
        theater.longitude
      );
      return {
        theater,
        distanceMeters,
        formatScore: formatScore(theater),
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  if (!eligible.length)
    throw new Error('No matching theater is available in the current catalog.');

  return {
    departure: port.country
      ? port
      : { ...port, country: eligible[0].theater.country },
    mission,
    matches: eligible.slice(0, resultLimit).map((candidate, index) => ({
      rank: index + 1,
      ...candidate,
    })),
    searchedTheaters: eligible.length,
  };
}

function departure(
  city: string,
  region: string,
  country: string,
  latitude: number,
  longitude: number,
  extraAliases: string[] = []
): LocalDeparture {
  return {
    city,
    region,
    country,
    latitude,
    longitude,
    aliases: locationAliases(city, region, country, extraAliases),
  };
}

function buildCatalogDepartures() {
  const groups = new Map<
    string,
    LocalDeparture & { latitudeTotal: number; longitudeTotal: number }
  >();

  for (const theater of theaterCatalog) {
    const key = [theater.city, theater.region, theater.country]
      .map(normalizeLocation)
      .join('|');
    const existing = groups.get(key);
    if (existing) {
      existing.latitudeTotal += theater.latitude;
      existing.longitudeTotal += theater.longitude;
      existing.theaterCount = (existing.theaterCount ?? 0) + 1;
      continue;
    }

    groups.set(key, {
      city: theater.city,
      region: theater.region,
      country: theater.country,
      latitude: theater.latitude,
      longitude: theater.longitude,
      latitudeTotal: theater.latitude,
      longitudeTotal: theater.longitude,
      theaterCount: 1,
      aliases: locationAliases(
        theater.city,
        theater.region,
        theater.country,
        theater.countryName
          ? [
              `${theater.city} ${theater.countryName}`,
              `${theater.city} ${theater.region} ${theater.countryName}`,
            ]
          : []
      ),
    });
  }

  return [...groups.values()].map((entry) => ({
    city: entry.city,
    region: entry.region,
    country: entry.country,
    latitude: entry.latitudeTotal / (entry.theaterCount ?? 1),
    longitude: entry.longitudeTotal / (entry.theaterCount ?? 1),
    theaterCount: entry.theaterCount,
    aliases: entry.aliases,
  }));
}

function locationAliases(
  city: string,
  region: string,
  country: string,
  extraAliases: string[] = []
) {
  return [
    city,
    [city, region].filter(Boolean).join(' '),
    [city, country].filter(Boolean).join(' '),
    [city, region, country].filter(Boolean).join(' '),
    ...extraAliases,
  ]
    .map(normalizeLocation)
    .filter(Boolean);
}

function resolveDeparture(query: string) {
  const normalizedQuery = normalizeLocation(query);
  if (!normalizedQuery)
    throw new Error('Enter a city represented in the theater catalog.');

  const known = knownDepartures.find((entry) =>
    entry.aliases.includes(normalizedQuery)
  );
  if (known) return stripAliases(known);

  const exactMatches = catalogDepartures
    .filter((entry) => entry.aliases.includes(normalizedQuery))
    .sort((a, b) => (b.theaterCount ?? 0) - (a.theaterCount ?? 0));
  if (exactMatches[0]) return stripAliases(exactMatches[0]);

  const partialMatches = catalogDepartures
    .filter((entry) =>
      entry.aliases.some(
        (alias) =>
          alias.startsWith(normalizedQuery) || normalizedQuery.startsWith(alias)
      )
    )
    .sort((a, b) => (b.theaterCount ?? 0) - (a.theaterCount ?? 0));
  if (partialMatches[0]) return stripAliases(partialMatches[0]);

  throw new Error(
    'No local departure location was found. Enter a city represented in the theater catalog.'
  );
}

function stripAliases({
  aliases: _aliases,
  theaterCount: _count,
  ...port
}: LocalDeparture) {
  return port;
}

function normalizeLocation(value: string) {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6_371_000;
  const latitudeDelta = toRadians(lat2 - lat1);
  const longitudeDelta = toRadians(lon2 - lon1);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
