/**
 * Multi Hotel Trip - Jesse — bewegend beeld per vakantie, voor de
 * fietsvakantiekaart (`components-mht-jesse/home/FietsCard.vue`).
 *
 * Los van `mhtj-trips.ts` gehouden: het gedeelde `MultiHotelTripInfo`-type
 * (app/types) kent deze velden niet, en dat type wordt ook door MHT en de
 * andere prototypes gebruikt. Zo blijft dit een Jesse-eigen toevoeging.
 *
 * `scenes` zijn de scenegrenzen in seconden: begin, elk knippunt, eind. Vier
 * getallen zijn dus drie scenes. Het aantal etappes in de routelijn (aantal
 * stops min een) moet gelijk zijn aan het aantal scenes, anders loopt de
 * voortgangsbalk voor of achter op het beeld. De grenzen hieronder zijn op
 * losse frames nagemeten; controleer ze per nieuwe video.
 */
export interface MhtJesseTripMedia {
  /** Routevideo: zonder geluid, in een lus, kort. */
  video: string
  /** Stilstaand beeld dat over de video ligt tot hij speelt. */
  thumbnail?: string
  /** Eerste frame van de video; valt terug als het stilstaande beeld ontbreekt. */
  poster?: string
  /** Scenegrenzen in seconden. */
  scenes: number[]
}

/** Gesleuteld op de slug van de vakantie (`spec.slug` in mhtj-trips.ts). */
export const MHTJ_TRIP_MEDIA: Record<string, MhtJesseTripMedia> = {
  'fietsvakantie-twente-en-salland-delden-raalte-markelo': {
    video: '/videos/mht-jesse/twente-salland/route.mp4',
    thumbnail: '/videos/mht-jesse/twente-salland/thumbnail.jpg',
    poster: '/videos/mht-jesse/twente-salland/poster.jpg',
    // 3 scenes voor 3 stops: Delden → Raalte → Markelo.
    scenes: [0, 1.583333, 3.291667, 6],
  },
}

export function tripMediaFor(slug?: string): MhtJesseTripMedia | null {
  if (!slug) return null
  return MHTJ_TRIP_MEDIA[slug] ?? null
}
