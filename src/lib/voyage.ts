export type VoyageMission =
  | 'closest'
  | 'best-format'
  | '70mm-only'
  | 'worth-voyage';

export type ScreeningStatus = 'confirmed' | 'not-confirmed' | 'unknown';

export interface ScreeningConfirmation {
  sourceUrl: string;
  verifiedAt: string;
}

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
  screeningConfirmation?: ScreeningConfirmation;
  commercialFilms?: 'yes' | 'limited' | 'no' | 'unknown';
  verifiedAt: string;
  sourceUrl: string;
  confidence: 'high' | 'medium';
}

export interface VoyageSearchRequest {
  departure: string;
  mission: VoyageMission;
  latitude?: number;
  longitude?: number;
}

export interface VoyageTheaterMatch {
  rank: number;
  theater: TheaterCapability;
  distanceMeters: number;
  formatScore: number;
}

export function compareVoyageCandidates(
  mission: VoyageMission,
  left: Pick<VoyageTheaterMatch, 'theater' | 'distanceMeters'>,
  right: Pick<VoyageTheaterMatch, 'theater' | 'distanceMeters'>
) {
  if (mission === '70mm-only') {
    const confirmationDifference =
      Number(right.theater.screeningStatus === 'confirmed') -
      Number(left.theater.screeningStatus === 'confirmed');
    if (confirmationDifference) return confirmationDifference;
  }
  return (
    left.distanceMeters - right.distanceMeters ||
    left.theater.id.localeCompare(right.theater.id)
  );
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
  matches: VoyageTheaterMatch[];
  searchedTheaters: number;
}
