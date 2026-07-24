export type VoyageMission =
  | 'closest'
  | 'best-format'
  | '70mm-only'
  | 'worth-voyage';

export type ScreeningStatus = 'confirmed' | 'not-confirmed' | 'unknown';

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
  latitude?: number;
  longitude?: number;
}

export interface VoyageTheaterMatch {
  rank: number;
  theater: TheaterCapability;
  distanceMeters: number;
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
  matches: VoyageTheaterMatch[];
  searchedTheaters: number;
}
