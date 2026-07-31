import {
  compareVoyageCandidates,
  type TheaterCapability,
} from '../src/lib/voyage';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const confirmed: TheaterCapability = {
  id: 'confirmed',
  name: 'Confirmed',
  city: 'Test City',
  region: '',
  country: 'US',
  latitude: 0,
  longitude: 0,
  formats: ['IMAX 15/70mm'],
  projector: 'IMAX 15/70 film',
  aspectRatio: 'Up to 1.43:1',
  has1570: true,
  hasGtLaser: false,
  worthVoyage: true,
  screeningStatus: 'confirmed',
  screeningConfirmation: {
    sourceUrl: 'https://www.imax.com/zh/us/news/the-odyssey-in-imax-70mm-film',
    verifiedAt: '2026-07-30',
  },
  verifiedAt: '2026-07-30',
  sourceUrl: 'https://www.imax.com/zh/us/news/the-odyssey-in-imax-70mm-film',
  confidence: 'high',
};

const unknown = {
  ...confirmed,
  id: 'unknown',
  screeningStatus: 'unknown' as const,
};

assert(
  compareVoyageCandidates(
    '70mm-only',
    { theater: confirmed, distanceMeters: 1_000 },
    { theater: unknown, distanceMeters: 10 }
  ) < 0,
  '70mm-only results must put confirmed Odyssey theaters first.'
);
assert(
  compareVoyageCandidates(
    'closest',
    { theater: confirmed, distanceMeters: 1_000 },
    { theater: unknown, distanceMeters: 10 }
  ) > 0,
  'Closest results must retain distance-first ordering.'
);
assert(
  compareVoyageCandidates(
    '70mm-only',
    { theater: confirmed, distanceMeters: 10 },
    { theater: confirmed, distanceMeters: 20 }
  ) < 0,
  'Confirmed 70mm results must remain distance-sorted within the confirmed group.'
);

console.log('Verified Odyssey confirmation-first mission ranking.');
