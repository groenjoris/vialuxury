import type { HotelImage } from '~/types/hotel'
import type { LocalizedString } from '~/i18n/types'

/**
 * Example cycling-route maps appended to the photo gallery of every cycling
 * deal (prototype: the same two maps for all of them, whether or not they
 * match the hotel's region). Each carries a caption that the gallery viewer
 * shows in white above the photo.
 */
export const FIETSKAART_IMAGES: HotelImage[] = [
  {
    id: 'fietskaart-cultuur-drenthe',
    url: '/images/fietskaarten/fietsroute-cultuur-drenthe.webp',
    alt: { nl: 'Fietskaart', en: 'Cycling map', de: 'Radkarte' },
    caption: {
      nl: 'Voorbeeld fietsroute cultuur Drenthe',
      en: 'Example cycling route: culture in Drenthe',
      de: 'Beispiel-Radroute Kultur Drenthe',
    },
    position: 'gallery',
  },
  {
    id: 'fietskaart-natuurparken-overijssel',
    url: '/images/fietskaarten/fietsroute-natuurparken-overijssel.webp',
    alt: { nl: 'Fietskaart', en: 'Cycling map', de: 'Radkarte' },
    caption: {
      nl: 'Voorbeeld fietsroute natuurparken Overijssel',
      en: 'Example cycling route: nature parks in Overijssel',
      de: 'Beispiel-Radroute Naturparks Overijssel',
    },
    position: 'gallery',
  },
]

/** True for cycling deals: tagged with the "fiets" theme or with "fiets" in
 *  the (Dutch) title. */
export function isFietsDeal(deal: { themes?: string[]; title?: LocalizedString } | null | undefined): boolean {
  if (!deal) return false
  if (deal.themes?.includes('fiets')) return true
  return /fiets/i.test(deal.title?.nl ?? '')
}

/** Gallery images for a deal page: the hotel's own photos, plus the two
 *  example cycling maps for cycling deals. */
export function withFietskaarten(images: HotelImage[], deal: { themes?: string[]; title?: LocalizedString } | null | undefined): HotelImage[] {
  return isFietsDeal(deal) ? [...images, ...FIETSKAART_IMAGES] : images
}
