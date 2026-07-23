export type VoyageMission =
  | 'closest'
  | 'best-format'
  | '70mm-only'
  | 'worth-voyage';

export type ScreeningStatus = 'confirmed' | 'not-confirmed' | 'unknown';

export type AdventureTier =
  | 'athenas-favor'
  | 'sirens-call'
  | 'cyclops-territory'
  | 'poseidons-curse'
  | 'ten-year-odyssey';

export interface TheaterCapability {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  countryName?: string;
  latitude: number;
  longitude: number;
  coordinatePrecision?: 'venue' | 'city';
  formats: string[];
  projector: string;
  aspectRatio: string;
  has1570: boolean;
  hasGtLaser: boolean;
  worthVoyage: boolean;
  screeningStatus: ScreeningStatus;
  commercialFilms?: 'yes' | 'limited' | 'no' | 'unknown';
  verifiedAt: string;
  sourceUrl: string;
  confidence: 'high' | 'medium';
}

export interface VoyageSearchRequest {
  departure: string;
  mission: VoyageMission;
}

export interface VoyageRoute {
  kind: 'shortest' | 'hero';
  theater: TheaterCapability;
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
  estimated: boolean;
  regionCount: number;
  adventureTier: AdventureTier;
  formatScore: number;
}

export interface VoyageSearchResult {
  departure: {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  mission: VoyageMission;
  routes: VoyageRoute[];
  searchedTheaters: number;
  usedEstimatedRoutes: boolean;
}

export const ADVENTURE_LABELS: Record<AdventureTier, string> = {
  'athenas-favor': "Athena's Favor",
  'sirens-call': "The Sirens' Call",
  'cyclops-territory': 'Cyclops Territory',
  'poseidons-curse': "Poseidon's Curse",
  'ten-year-odyssey': 'The Ten-Year Odyssey',
};
