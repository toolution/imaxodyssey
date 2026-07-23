import type { TheaterCapability } from '@/lib/voyage';

import rawCityCoordinates from './imaxguide-coordinates.json';
import rawVenueCoordinates from './imaxguide-venue-coordinates.json';

interface CountryConfig {
  code: string;
  name: string;
}

const countryByFile: Record<string, CountryConfig> = {
  aruba: { code: 'AW', name: 'Aruba' },
  bahamas: { code: 'BS', name: 'Bahamas' },
  brazil: { code: 'BR', name: 'Brazil' },
  canada: { code: 'CA', name: 'Canada' },
  colombia: { code: 'CO', name: 'Colombia' },
  curacao: { code: 'CW', name: 'Curaçao' },
  ecuador: { code: 'EC', name: 'Ecuador' },
  mexico: { code: 'MX', name: 'Mexico' },
  peru: { code: 'PE', name: 'Peru' },
  unitedstates: { code: 'US', name: 'United States' },
  bahrain: { code: 'BH', name: 'Bahrain' },
  china: { code: 'CN', name: 'China' },
  hongkong: { code: 'HK', name: 'Hong Kong' },
  india: { code: 'IN', name: 'India' },
  indonesia: { code: 'ID', name: 'Indonesia' },
  japan: { code: 'JP', name: 'Japan' },
  kuwait: { code: 'KW', name: 'Kuwait' },
  malaysia: { code: 'MY', name: 'Malaysia' },
  oman: { code: 'OM', name: 'Oman' },
  philippines: { code: 'PH', name: 'Philippines' },
  qatar: { code: 'QA', name: 'Qatar' },
  saudiarabia: { code: 'SA', name: 'Saudi Arabia' },
  singapore: { code: 'SG', name: 'Singapore' },
  southkorea: { code: 'KR', name: 'South Korea' },
  taiwan: { code: 'TW', name: 'Taiwan' },
  thailand: { code: 'TH', name: 'Thailand' },
  unitedarabemirates: { code: 'AE', name: 'United Arab Emirates' },
  vietnam: { code: 'VN', name: 'Vietnam' },
  austria: { code: 'AT', name: 'Austria' },
  belgium: { code: 'BE', name: 'Belgium' },
  czechia: { code: 'CZ', name: 'Czechia' },
  finland: { code: 'FI', name: 'Finland' },
  france: { code: 'FR', name: 'France' },
  germany: { code: 'DE', name: 'Germany' },
  italy: { code: 'IT', name: 'Italy' },
  latvia: { code: 'LV', name: 'Latvia' },
  luxembourg: { code: 'LU', name: 'Luxembourg' },
  netherlands: { code: 'NL', name: 'Netherlands' },
  norway: { code: 'NO', name: 'Norway' },
  poland: { code: 'PL', name: 'Poland' },
  portugal: { code: 'PT', name: 'Portugal' },
  serbia: { code: 'RS', name: 'Serbia' },
  spain: { code: 'ES', name: 'Spain' },
  sweden: { code: 'SE', name: 'Sweden' },
  switzerland: { code: 'CH', name: 'Switzerland' },
  ukraine: { code: 'UA', name: 'Ukraine' },
  unitedkingdom: { code: 'GB', name: 'United Kingdom' },
  morocco: { code: 'MA', name: 'Morocco' },
  southafrica: { code: 'ZA', name: 'South Africa' },
  australia: { code: 'AU', name: 'Australia' },
  newzealand: { code: 'NZ', name: 'New Zealand' },
};

const cityCoordinates = rawCityCoordinates as Record<
  string,
  [latitude: number, longitude: number]
>;
const venueCoordinates = rawVenueCoordinates as Record<
  string,
  [latitude: number, longitude: number]
>;

const csvFiles = import.meta.glob<string>(
  '/imaxguide-main/imaxguide-main/data/**/*.csv',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
);

const adminDivisionColumns = [
  'Province',
  'State',
  'Region',
  'District',
  'Prefecture',
  'Canton',
  'Country',
  'Emirate',
  'Governorate',
  'Province/State',
];

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') quoted = true;
    else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') field += character;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function usefulProjector(value: string) {
  return value && !['No', 'N/A'].includes(value);
}

function usefulRatio(value: string) {
  return value && !['No', 'N/A', 'Unk'].includes(value);
}

function buildTheater(
  row: Record<string, string>,
  country: CountryConfig,
  sourcePath: string
): TheaterCapability {
  const city = row.City?.trim();
  const name = row['Location Name']?.trim();
  const region =
    adminDivisionColumns.map((column) => row[column]?.trim()).find(Boolean) ??
    '';
  if (!city || !name) {
    throw new Error(`Invalid IMAX Guide row in ${sourcePath}`);
  }

  const id = `imaxguide-${country.code.toLowerCase()}-${slugify(city)}-${slugify(name)}`;
  const coordinateKey = `${country.code}|${region}|${city}`;
  const preciseCoordinates = venueCoordinates[id];
  const coordinates = preciseCoordinates ?? cityCoordinates[coordinateKey];
  if (!coordinates) {
    throw new Error(`Missing theater coordinates for ${coordinateKey}`);
  }
  const [latitude, longitude] = coordinates;
  const filmProjector = row['Film Projector']?.trim() ?? '';
  const digitalProjector = row['Digital Projector']?.trim() ?? '';
  const has1570 = /15\s*\/\s*70/i.test(filmProjector);
  const hasGtLaser = /GT Laser/i.test(digitalProjector);
  const screenRatio = row['Screen Aspect Ratio (AR)']?.trim() ?? '';
  const digitalRatio = row['Maximum AR for digital projection']?.trim() ?? '';
  const bestRatio =
    has1570 && usefulRatio(screenRatio)
      ? screenRatio
      : usefulRatio(digitalRatio)
        ? digitalRatio
        : usefulRatio(screenRatio)
          ? screenRatio
          : '';
  const formats = [
    has1570 ? 'IMAX 15/70mm' : '',
    usefulProjector(digitalProjector) ? digitalProjector : '',
  ].filter(Boolean);
  const projector = [
    usefulProjector(filmProjector) ? filmProjector : '',
    usefulProjector(digitalProjector) ? digitalProjector : '',
  ]
    .filter(Boolean)
    .join(' + ');
  const commercial = row['Commercial films shown?']?.trim().toLowerCase();

  return {
    id,
    name,
    city,
    region,
    country: country.code,
    countryName: country.name,
    latitude,
    longitude,
    coordinatePrecision: preciseCoordinates ? 'venue' : 'city',
    formats: formats.length ? formats : ['IMAX'],
    projector: projector || 'Unknown',
    aspectRatio: bestRatio
      ? bestRatio.startsWith('Dome')
        ? bestRatio
        : `Up to ${bestRatio}`
      : 'Unknown',
    has1570,
    hasGtLaser,
    worthVoyage:
      commercial !== 'no' &&
      (has1570 || (hasGtLaser && bestRatio.includes('1.43'))),
    commercialFilms:
      commercial === 'yes'
        ? 'yes'
        : commercial === 'limited'
          ? 'limited'
          : commercial === 'no'
            ? 'no'
            : 'unknown',
    screeningStatus: commercial === 'no' ? 'not-confirmed' : 'unknown',
    verifiedAt: '2026-07-21',
    sourceUrl: `https://github.com/r-imax/imaxguide/blob/main/data/${sourcePath}`,
    confidence: 'medium',
  };
}

export const imaxGuideCatalog: TheaterCapability[] = Object.entries(csvFiles)
  .flatMap(([path, rawCsv]) => {
    const sourcePath = path.match(/data\/(.+\.csv)$/)?.[1];
    const filename = sourcePath
      ?.split('/')
      .at(-1)
      ?.replace(/\.csv$/, '');
    const country = filename ? countryByFile[filename] : undefined;
    if (!sourcePath || !country) {
      throw new Error(`Unknown IMAX Guide data file: ${path}`);
    }

    const [headers, ...rows] = parseCsv(rawCsv);
    const normalizedHeaders = headers.map((header) =>
      header.replace(/^\uFEFF/, '').trim()
    );
    return rows.map((values) =>
      buildTheater(
        Object.fromEntries(
          normalizedHeaders.map((header, index) => [
            header,
            values[index]?.trim() ?? '',
          ])
        ),
        country,
        sourcePath
      )
    );
  })
  .sort(
    (left, right) =>
      left.country.localeCompare(right.country) ||
      left.city.localeCompare(right.city) ||
      left.name.localeCompare(right.name)
  );
