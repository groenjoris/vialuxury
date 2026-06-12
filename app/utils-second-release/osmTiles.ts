/**
 * OpenStreetMap Web-Mercator tile maths. Single source of truth for the
 * static mini-maps (StaticMiniMap) so the projection lives in one place.
 */

/** Fractional tile X for a longitude at a given zoom (0 … 2^z). */
export function lngToTileX(lng: number, z: number): number {
  return ((lng + 180) / 360) * 2 ** z
}

/** Fractional tile Y for a latitude at a given zoom (0 … 2^z). */
export function latToTileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z
}
