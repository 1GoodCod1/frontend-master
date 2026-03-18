/**
 * Approximate coordinates of Moldovan cities for IP-based geolocation.
 * Used to find nearest city when IP APIs return coordinates but wrong city name.
 * Coordinates: [latitude, longitude]
 */
export const MOLDOVA_CITY_COORDS: Record<string, [number, number]> = {
  chisinau: [47.01, 28.86],
  balti: [47.76, 27.93],
  bender: [46.83, 29.48],
  tiraspol: [46.85, 29.63],
  cahul: [45.9, 28.2],
  ungeni: [47.21, 27.79],
  soroca: [48.15, 28.29],
  orhei: [47.38, 28.82],
  dubasari: [47.26, 29.17],
  comrat: [46.29, 28.66],
  straseni: [47.14, 28.61],
  drochia: [48.04, 27.82],
  'ceadir-lunga': [46.06, 28.83],
  edinet: [48.17, 27.3],
  hincesti: [46.83, 28.59],
  floresti: [47.89, 28.29],
  taraclia: [45.99, 28.67],
  nisporeni: [47.08, 28.18],
  cantemir: [46.28, 28.2],
  briceni: [48.36, 27.08],
  'anenii-noi': [46.88, 29.22],
};

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearest Moldovan city by coordinates.
 * Returns city slug or null if outside Moldova or no match.
 */
export function findNearestCityByCoords(
  lat: number,
  lon: number,
  maxDistanceKm = 150
): string | null {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return null;
  }
  // Moldova bounding box rough check
  if (lat < 45.4 || lat > 48.5 || lon < 26.6 || lon > 30.2) {
    return null;
  }
  let nearest: { slug: string; dist: number } | null = null;
  for (const [slug, [cityLat, cityLon]] of Object.entries(MOLDOVA_CITY_COORDS)) {
    const dist = haversineKm(lat, lon, cityLat, cityLon);
    if (dist <= maxDistanceKm && (!nearest || dist < nearest.dist)) {
      nearest = { slug, dist };
    }
  }
  return nearest?.slug ?? null;
}
