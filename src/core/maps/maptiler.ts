import { envConfigs } from '@/config';

export interface GeocodedPort {
  city: string;
  region: string;
  country: 'US' | 'CA';
  latitude: number;
  longitude: number;
}

const demoPorts: Record<string, GeocodedPort> = {
  'new york': {
    city: 'New York',
    region: 'NY',
    country: 'US',
    latitude: 40.7128,
    longitude: -74.006,
  },
  '10001': {
    city: 'New York',
    region: 'NY',
    country: 'US',
    latitude: 40.7506,
    longitude: -73.9972,
  },
  'los angeles': {
    city: 'Los Angeles',
    region: 'CA',
    country: 'US',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  '90001': {
    city: 'Los Angeles',
    region: 'CA',
    country: 'US',
    latitude: 33.9731,
    longitude: -118.2479,
  },
  'san francisco': {
    city: 'San Francisco',
    region: 'CA',
    country: 'US',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  chicago: {
    city: 'Chicago',
    region: 'IL',
    country: 'US',
    latitude: 41.8781,
    longitude: -87.6298,
  },
  dallas: {
    city: 'Dallas',
    region: 'TX',
    country: 'US',
    latitude: 32.7767,
    longitude: -96.797,
  },
  austin: {
    city: 'Austin',
    region: 'TX',
    country: 'US',
    latitude: 30.2672,
    longitude: -97.7431,
  },
  boston: {
    city: 'Boston',
    region: 'MA',
    country: 'US',
    latitude: 42.3601,
    longitude: -71.0589,
  },
  washington: {
    city: 'Washington',
    region: 'DC',
    country: 'US',
    latitude: 38.9072,
    longitude: -77.0369,
  },
  toronto: {
    city: 'Toronto',
    region: 'ON',
    country: 'CA',
    latitude: 43.6532,
    longitude: -79.3832,
  },
  montreal: {
    city: 'Montreal',
    region: 'QC',
    country: 'CA',
    latitude: 45.5019,
    longitude: -73.5674,
  },
  vancouver: {
    city: 'Vancouver',
    region: 'BC',
    country: 'CA',
    latitude: 49.2827,
    longitude: -123.1207,
  },
  calgary: {
    city: 'Calgary',
    region: 'AB',
    country: 'CA',
    latitude: 51.0447,
    longitude: -114.0719,
  },
};

function mapTilerKey() {
  return envConfigs.maptiler_api_key?.trim();
}

export async function geocodePort(query: string): Promise<GeocodedPort> {
  const knownPort = demoPorts[query.trim().toLowerCase()];
  if (knownPort) return knownPort;

  const apiKey = mapTilerKey();
  if (!apiKey) {
    throw new Error(
      'MapTiler is not configured. Try New York, Los Angeles, Toronto, or add MAPTILER_API_KEY.'
    );
  }

  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set('key', apiKey);
  url.searchParams.set('country', 'us,ca');
  url.searchParams.set(
    'types',
    'postal_code,place,municipality,locality,address'
  );
  url.searchParams.set('limit', '1');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Athena could not read that chart. Please try again.');
  }
  const data = (await response.json()) as any;
  const feature = data.features?.[0];
  const coordinates = feature?.center ?? feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates)) {
    throw new Error(
      'No departure port was found in the United States or Canada.'
    );
  }

  const contexts = [feature, ...(feature.context ?? [])];
  const properties = feature.properties ?? {};
  const countryContext = contexts.find(
    (item: any) =>
      item.id?.startsWith('country.') || item.place_type?.includes('country')
  );
  const regionContext = contexts.find(
    (item: any) =>
      item.id?.startsWith('region.') || item.place_type?.includes('region')
  );
  const placeContext = contexts.find(
    (item: any) =>
      item.id?.startsWith('place.') ||
      item.place_type?.some((type: string) =>
        ['place', 'municipality', 'locality'].includes(type)
      )
  );
  const rawCountry =
    properties.country_code ??
    feature.country_code ??
    countryContext?.properties?.country_code ??
    countryContext?.short_code ??
    '';
  const country = String(rawCountry).split('-').pop()?.toUpperCase();
  if (country !== 'US' && country !== 'CA') {
    throw new Error(
      'This voyage currently sails only in the United States and Canada.'
    );
  }

  const rawRegion =
    properties.state_code ??
    properties.region_code ??
    regionContext?.properties?.state_code ??
    regionContext?.short_code ??
    '';
  return {
    city:
      placeContext?.text ??
      placeContext?.place_name ??
      feature.text ??
      feature.place_name?.split(',')[0] ??
      query,
    region: String(rawRegion).split('-').pop()?.toUpperCase() ?? '',
    country,
    longitude: Number(coordinates[0]),
    latitude: Number(coordinates[1]),
  };
}
