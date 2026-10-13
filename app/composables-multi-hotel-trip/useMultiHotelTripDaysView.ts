// Multi Hotel Trip — dagprogramma als weergave (TripDayView[]) voor het uitgebreide
// reisschema (sidepanel) en de tijdlijn: de vaste blokken (inchecken, onderweg/uitchecken,
// diner, terugreis) krijgen hier hun tekst; met een aankomstdatum krijgt elke dag zijn datum.
// Gedeeld door de dealpagina en de persoonlijke routepagina na het boeken.
import dayjs from 'dayjs'
import { formatDateWeekdayShort } from '~/utils-multi-hotel-trip/formatDate'
import type { MultiHotelTripPdp } from '~/data/mht-trip-pdp'
import type { MultiHotelTripDetail } from '~/data/mht-trips'
import type { LocalizedString } from '~/i18n/types'
import type { TripDayView, TripBlockView } from '~/components-multi-hotel-trip/deal/TripItinerary.vue'

type T = (key: string) => string
type Localized = (value: LocalizedString | string) => string

const cap = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str)

/** "een half uur" / "drie kwartier" / "1 uur 20 min" — reistijd in woorden. */
export function tripDurationLabel(minutes: number, t: T): string {
  if (minutes === 30) return t('trip.dur.halfHour')
  if (minutes === 45) return t('trip.dur.threeQuarters')
  if (minutes === 60) return t('trip.dur.hour')
  if (minutes < 60) return t('trip.dur.minutes').replace('{m}', String(minutes))
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m === 0 ? t('trip.dur.hours').replace('{h}', String(h)) : t('trip.dur.hoursMinutes').replace('{h}', String(h)).replace('{m}', String(m))
}

/** "50 km (een half uur)" of, bij een fietsvakantie, "35 km fietsen". */
export function tripDistanceLabelFn(travel: { km: number; minutes: number } | undefined, t: T, isBike: boolean): string {
  if (!travel) return ''
  if (isBike) return t('trip.distanceBike').replace('{km}', String(travel.km))
  return t('trip.distanceDrive').replace('{km}', String(travel.km)).replace('{duration}', tripDurationLabel(travel.minutes, t))
}

export function buildTripDaysView(
  tripPdp: MultiHotelTripPdp | null,
  trip: MultiHotelTripDetail | null,
  /** Aankomstdatum als YYYY-MM-DD (null = zonder datums). */
  checkIn: string | null,
  t: T,
  localized: Localized,
): TripDayView[] {
  const tripDistanceLabel = (travel?: { km: number; minutes: number }) => tripDistanceLabelFn(travel, t, trip?.type === 'fiets')
  if (!tripPdp || !trip) return []
  const content = tripPdp.content
  return tripPdp.days.map((d) => {
    const stop = d.stopIndex != null ? trip.stops[d.stopIndex] : undefined
    const from = d.fromStopIndex != null ? trip.stops[d.fromStopIndex] : undefined
    const blocks: TripBlockView[] = d.blocks.map((b) => {
      const st = b.stopIndex != null ? trip.stops[b.stopIndex] : undefined
      const name = st?.hotelName ?? ''
      const view: TripBlockView = (() => { switch (b.kind) {
        case 'checkin':
          return {
            kind: 'checkin',
            tag: t('trip.tag.checkin'),
            title: t('trip.checkinAt').replace('{hotel}', name),
            // Dag 1 met eigen aankomsttekst (heenreis, inchecktijd); anders de hotelbeschrijving.
            text: b.text ? localized(b.text) : localized(content?.hotels[name]?.description ?? trip.pitch),
            image: b.image,
            starRating: st?.starRating,
            meta: st ? `${st.city}, ${st.region}` : undefined,
            stopIndex: b.stopIndex,
            hotelName: name || undefined,
          }
        case 'checkout':
          return {
            kind: 'checkout',
            tag: t('trip.tag.route'),
            title: b.title ? localized(b.title) : t('trip.checkoutAt').replace('{hotel}', name),
            text: b.text ? localized(b.text) : t('trip.checkoutText').replace('{hotel}', name),
            meta: b.meta ? localized(b.meta) : undefined,
            image: b.image,
            stopIndex: b.stopIndex,
            hotelName: name || undefined,
          }
        case 'dinner': {
          const dl = b.dinnerLabel ? localized(b.dinnerLabel) : t('trip.tag.dinner').toLowerCase()
          return {
            kind: 'dinner',
            tag: t('trip.tag.dinner'),
            title: cap(t('trip.dinnerAt').replace('{dinner}', dl).replace('{hotel}', name)),
            text: b.text ? localized(b.text) : t('trip.dinnerText').replace('{dinner}', dl),
            image: b.image,
            stopIndex: b.stopIndex,
            hotelName: name || undefined,
          }
        }
        case 'breakfast': {
          const bl = b.breakfastLabel ? localized(b.breakfastLabel) : t('trip.tag.breakfast')
          return {
            kind: 'breakfast',
            tag: t('trip.tag.breakfast'),
            title: t('trip.breakfastAt').replace('{hotel}', name),
            // Eigen tekst uit de content; anders op een uitcheckdag het "laatste
            // ontbijt"-sjabloon (met de volgende plaats), op de vertrekdag het
            // thuis-sjabloon, en op een verblijfsdag het gewone sjabloon.
            text: b.text
              ? localized(b.text)
              : b.last
                ? (b.nextCity ? t('trip.breakfastLastText').replace('{city}', b.nextCity) : t('trip.breakfastHomeText'))
                : t('trip.breakfastText').replace('{breakfast}', bl.charAt(0).toLowerCase() + bl.slice(1)),
            image: b.image,
            stopIndex: b.stopIndex,
            hotelName: name || undefined,
          }
        }
        case 'homeward':
          return {
            kind: 'homeward',
            tag: t('trip.tag.homeward'),
            title: b.title ? localized(b.title) : t('trip.homewardTitle'),
            meta: b.meta ? localized(b.meta) : undefined,
            text: b.text ? localized(b.text) : t('trip.checkoutText').replace('{hotel}', name),
            image: b.image,
            stopIndex: b.stopIndex,
            hotelName: name || undefined,
          }
        default:
          return {
            kind: 'activity',
            tag: t('trip.tag.activity'),
            title: b.title ? localized(b.title) : '',
            text: b.text ? localized(b.text) : '',
            image: b.image,
          }
      } })()
      // "Meer over …"-pop-up: korte tekst in het blok, achtergrond achter een klik.
      if (b.more) view.more = { label: localized(b.more.label), title: localized(b.more.title), paragraphs: b.more.paragraphs.map(p => localized(p)), image: b.more.image }
      return view
    })
    const type: TripDayView['type'] = d.day === 1 && stop ? 'arrival' : (from && stop && from !== stop) ? 'transfer' : stop ? 'stay' : 'home'
    const view: TripDayView = { day: d.day, label: t('trip.daySingle').replace('{a}', String(d.day)), blocks, stopIndex: d.stopIndex, fromStopIndex: d.fromStopIndex, type }
    if (checkIn) view.date = formatDateWeekdayShort(dayjs(checkIn).add(d.day - 1, 'day').format('YYYY-MM-DD'))
    // Informatieve ondertitel per dagtype (aankomst / wisseldag / verblijf / terugreis).
    if (d.day === 1 && stop) {
      view.subtitle = t('trip.subtitle.arrival').replace('{city}', stop.city).replace('{region}', stop.region).replace('{hotel}', stop.hotelName).replace('{time}', stop.checkIn)
    } else if (from && stop && from !== stop) {
      view.subtitle = t('trip.subtitle.transfer').replace('{distance}', tripDistanceLabel(stop.travel)).replace('{city}', stop.city).replace('{hotel}', stop.hotelName).replace('{time}', stop.checkIn)
    } else if (stop) {
      view.subtitle = t('trip.subtitle.stay').replace('{city}', stop.city).replace('{hotel}', stop.hotelName)
    } else if (from) {
      view.subtitle = t('trip.subtitle.home').replace('{hotel}', from.hotelName)
    }
    // Eigen dagkop (sidepanel) en samenvattingsregel uit de content (Opaalkust: het reisdocument).
    if (d.heading) view.heading = localized(d.heading)
    if (d.summary) view.summary = localized(d.summary)
    return view
  })
}
