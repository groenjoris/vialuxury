/**
 * Multi Hotel Trip — bouwt voor een vakantie-slug de `Deal` + `Hotel`
 * die de dealpagina (/multi-hotel-trip/deal/[slug]) verwacht, zodat de
 * bestaande pagina (zijbalk, kalender, prijs, reviews, FAQ …) ongewijzigd
 * blijft werken en alleen de vakantie-specifieke blokken afwijken.
 *
 * - Hotelnaam wordt "3 fantastische hotels"; sterren alleen wanneer alle
 *   hotels hetzelfde aantal hebben (anders 0 → geen sterren).
 * - Gallery: één foto per hotel in reisvolgorde (eerste = hero); hotels
 *   uit de dataset leveren extra foto's tot vijf beelden. `stickers`
 *   koppelt elke foto-id aan de hotelnaam voor de sticker op de foto.
 */
import type { Deal } from '~/types/deal'
import type { Hotel, HotelImage, Facility, HouseRule, FaqItem } from '~/types/hotel'
import type { LocalizedString } from '~/i18n/types'
import { tripDetailBySlug, type MultiHotelTripDetail, type MultiHotelTripDetailStop } from './mht-trips'
import { TRIP_ITINERARIES, type TripItinerarySpec, type TripMoreInfo } from './mht-trip-itineraries'
import { facilityIcon } from '~/utils-multi-hotel-trip/facilityIcon'
import { mappedHotelsByHotelPermalink } from './deals-mapper'
import {
  sharedBaseRoom,
  sharedHouseRules,
  sharedReviews,
  sharedReviewSummary,
  sharedNearbyTips,
  sharedFaq,
} from './shared-fixtures'

export interface MultiHotelTripPdp {
  trip: MultiHotelTripDetail
  deal: Deal
  hotel: Hotel
  /** Foto-id → hotelnaam (sticker op de foto in de gallery-pop-up). */
  stickers: Record<string, string>
  /** Redactionele inhoud (beschrijving, highlights, hotelinfo, dagprogramma). */
  content: TripItinerarySpec | null
  /** Dagprogramma, nog niet vertaald: de pagina zet dit om in tekst. */
  days: TripRawDay[]
}

/* ── Dagprogramma ─────────────────────────────────────────────────────── */
export type TripRawBlockKind = 'checkin' | 'checkout' | 'activity' | 'dinner' | 'homeward' | 'breakfast'
export interface TripRawBlock {
  kind: TripRawBlockKind
  /** Hotel waar het blok over gaat (inchecken/uitchecken/diner/terugreis). */
  stopIndex?: number
  /** Redactionele kop/tekst/foto (activiteit, onderweg, terugreis). */
  title?: LocalizedString
  text?: LocalizedString
  image?: string
  /** Dinerblok: "3-gangendiner" / "4-gangendiner" / "verrassingsdiner". */
  dinnerLabel?: LocalizedString
  /** Ontbijtblok: de ontbijt-inclusie van dit hotel ("Dagelijks ontbijtbuffet"). */
  breakfastLabel?: LocalizedString
  /** Ontbijtblok op een uitcheck-/vertrekdag ("laatste ontbijt"-sjabloon). */
  last?: boolean
  /** Uitcheckdag: plaats van het volgende hotel (voor "op weg naar {city}"). */
  nextCity?: string
  /** "Meer over …"-pop-up (redactioneel blok). */
  more?: TripMoreInfo
  /** Etappefeiten onder de kop (onderweg-/terugreisblok). */
  meta?: LocalizedString
}
export interface TripRawDay {
  day: number
  /** Hotel van vannacht (null op de laatste dag). */
  stopIndex: number | null
  /** Op een uitcheckdag: het hotel dat je verlaat. */
  fromStopIndex?: number
  blocks: TripRawBlock[]
}

/** Dinerinclusie van een hotel: label en of het elke avond is. */
function dinnerOf(stop: MultiHotelTripDetailStop): { label: LocalizedString; daily: boolean } | null {
  const inc = stop.includes.find(i => /diner|dinner|menu/i.test(i.nl))
  if (!inc) return null
  const nl = inc.nl
  const gangen = nl.match(/(\d)-gangen/i)
  const label: LocalizedString = gangen
    ? { nl: `${gangen[1]}-gangendiner`, en: `${gangen[1]}-course dinner` }
    : /verrassing/i.test(nl)
      ? { nl: 'verrassingsdiner', en: 'surprise dinner' }
      : { nl: 'diner', en: 'dinner' }
  const daily = /dagelijks|^\s*2 x|beide|elke/i.test(nl) || /^\s*\d+ x .*diner/i.test(nl)
  return { label, daily }
}

function dinnerImageOf(stop: MultiHotelTripDetailStop): string | undefined {
  return stop.dinnerImage ?? stop.extraImages?.[0] ?? stop.image
}

/** Ontbijt-inclusie van een hotel (elke vakantie heeft er een). */
function breakfastOf(stop: MultiHotelTripDetailStop): LocalizedString {
  return stop.includes.find(i => /ontbijt|breakfast/i.test(i.nl)) ?? { nl: 'Ontbijt', en: 'Breakfast' }
}
function breakfastImageOf(stop: MultiHotelTripDetailStop): string | undefined {
  return stop.breakfastImage ?? stop.extraImages?.[1] ?? stop.dinnerImage ?? stop.image
}

/** Bouwt per dag de blokken: vaste blokken (inchecken, uitchecken, diner)
 *  uit de hotelgegevens, redactionele blokken uit `content.days`. */
export function buildTripDays(trip: MultiHotelTripDetail, content: TripItinerarySpec | null): TripRawDay[] {
  const stops = trip.stops
  const stopOn = (day: number) => stops.findIndex(s => day >= s.dayFrom && day <= s.dayTo)
  const out: TripRawDay[] = []
  for (let day = 1; day <= trip.nights + 1; day++) {
    const idx = stopOn(day)
    const prevIdx = day > 1 ? stopOn(day - 1) : -1
    const spec = content?.days.find(d => d.day === day)
    const blocks: TripRawBlock[] = []
    const pushActivities = () => {
      for (const a of spec?.activities ?? []) blocks.push({ kind: 'activity', title: a.title, text: a.text, image: a.image, more: a.more })
    }
    const pushDinner = (i: number, arrival: boolean) => {
      const d = dinnerOf(stops[i]!)
      if (!d) return
      if (arrival || d.daily) blocks.push({ kind: 'dinner', stopIndex: i, dinnerLabel: d.label, image: dinnerImageOf(stops[i]!) })
    }
    // Wakker worden en ontbijten — vanaf dag 2, in het hotel van vannacht (inbegrepen).
    // `breakfast: false` in de content: geen apart blok (het ontbijt wordt in het volgende blok genoemd).
    if (day > 1 && prevIdx >= 0 && spec?.breakfast !== false) {
      blocks.push({
        kind: 'breakfast',
        stopIndex: prevIdx,
        breakfastLabel: breakfastOf(stops[prevIdx]!),
        image: breakfastImageOf(stops[prevIdx]!),
        text: spec?.breakfast ? spec.breakfast.text : undefined,
        last: idx !== prevIdx,
        nextCity: idx >= 0 && idx !== prevIdx ? stops[idx]?.city : undefined,
      })
    }
    if (idx === -1) {
      // Laatste dag: uitchecken en terugreis.
      blocks.push({ kind: 'homeward', stopIndex: prevIdx, title: spec?.homeward?.title, text: spec?.homeward?.text, image: spec?.homeward?.image ?? stops[prevIdx]?.image, more: spec?.homeward?.more, meta: spec?.homeward?.meta })
      out.push({ day, stopIndex: null, fromStopIndex: prevIdx, blocks })
      continue
    }
    if (day === 1) {
      // Eigen aankomsttekst (heenreis + inchecktijd) als de content die heeft.
      blocks.push({ kind: 'checkin', stopIndex: idx, image: spec?.arrival?.image ?? stops[idx]!.image, text: spec?.arrival?.text })
      pushActivities()
      pushDinner(idx, true)
      out.push({ day, stopIndex: idx, blocks })
      continue
    }
    if (idx !== prevIdx) {
      // Wisseldag: eerst onderweg (uitchecken), dan inchecken, dan diner.
      blocks.push({ kind: 'checkout', stopIndex: prevIdx, title: spec?.route?.title, text: spec?.route?.text, image: spec?.route?.image ?? stops[prevIdx]?.image, more: spec?.route?.more, meta: spec?.route?.meta })
      // Eigen aankomsttekst (kort; hotelinfo achter de klik) als de content die heeft.
      blocks.push({ kind: 'checkin', stopIndex: idx, image: spec?.arrival?.image ?? stops[idx]!.image, text: spec?.arrival?.text })
      pushActivities()
      pushDinner(idx, true)
      out.push({ day, stopIndex: idx, fromStopIndex: prevIdx, blocks })
      continue
    }
    // Verblijfsdag.
    pushActivities()
    pushDinner(idx, false)
    out.push({ day, stopIndex: idx, blocks })
  }
  return out
}

/* ── Hotel-pop-up ─────────────────────────────────────────────────────── */
export interface TripHotelDetails {
  name: string
  starRating?: number
  city: string
  region: string
  images: string[]
  description: LocalizedString
  facilities: { icon: string; label: string }[]
  includes: LocalizedString[]
  /** Huisregels (uit de dataset, anders de gedeelde set) — in de pop-up. */
  houseRules: HouseRule[]
  /** Kamer(type) uit de redactionele inhoud, met foto. */
  room?: { name: LocalizedString; description: LocalizedString; image?: string }
  /** Inchecktijd, bv. "15:00". */
  checkIn: string
}

const FALLBACK_ICON = '/icons/facilities/special.svg'
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

/** Gegevens voor de hotel-pop-up: redactionele beschrijving/faciliteiten uit
 *  `content.hotels`, anders uit de dataset (deals.json), anders de pitch. */
export function tripHotelDetails(trip: MultiHotelTripDetail, content: TripItinerarySpec | null, stopIndex: number): TripHotelDetails | null {
  const stop = trip.stops[stopIndex]
  if (!stop) return null
  const info = content?.hotels[stop.hotelName]
  const ds = stop.hotelSlug ? mappedHotelsByHotelPermalink[stop.hotelSlug] : undefined
  const images = [stop.image, ...(stop.extraImages ?? []), ...(ds?.images ?? []).map(i => i.url)]
    .filter((u): u is string => !!u)
  const seen = new Set<string>()
  const uniqueImages = images.filter(u => { const k = u.split('?')[0]!; if (seen.has(k)) return false; seen.add(k); return true })
  const description: LocalizedString = info?.description
    ?? (ds ? { nl: stripHtml(ds.description.nl).split(/(?<=\.)\s/).slice(0, 3).join(' '), en: stripHtml(ds.description.en).split(/(?<=\.)\s/).slice(0, 3).join(' ') } : trip.pitch)
  const facilities = info
    ? info.facilities.map(label => ({ icon: facilityIcon(label) ?? FALLBACK_ICON, label }))
    : (ds?.facilities ?? []).map(f => ({ icon: facilityIcon(f.label.nl) ?? FALLBACK_ICON, label: f.label.nl }))
  return {
    name: stop.hotelName,
    starRating: stop.starRating,
    city: stop.city,
    region: stop.region,
    images: uniqueImages,
    description,
    facilities,
    includes: stop.includes,
    houseRules: ds?.houseRules ?? sharedHouseRules,
    room: info?.room
      ? { name: info.room.name, description: info.room.description, image: info.room.image ?? stop.extraImages?.[1] ?? uniqueImages[1] }
      : undefined,
    checkIn: stop.checkIn,
  }
}

const l = (nl: string, en = nl): LocalizedString => ({ nl, en })

/** Maximaal aantal foto's per vakantie: de desktop-gallery toont hero + 4,
 *  de lightbox ("Alle foto's") en de mobiele carrousel tonen ze allemaal. */
const MAX_GALLERY = 32
/** Sticker op de omgevingsfoto in de foto-pop-up. */
const COVER_STICKER = 'Omgeving'

function buildImages(trip: MultiHotelTripDetail): { images: HotelImage[]; stickers: Record<string, string> } {
  const images: HotelImage[] = []
  const stickers: Record<string, string> = {}
  // 0. Omgevingsfoto als eerste (hero) — dezelfde foto als op de dealcard,
  //    met sticker "Omgeving" (niet aan een hotel gekoppeld).
  if (trip.coverImage) {
    const id = `${trip.id}-cover`
    images.push({ id, url: trip.coverImage, alt: trip.title, position: 'hero' })
    stickers[id] = COVER_STICKER
  }
  // 0b. Omgevingsfoto's (bezienswaardigheden onderweg) direct na de cover: de
  //     eerste vier vullen de zichtbare gallery, de hotelfoto's komen pas
  //     daarna en zijn dus alleen in de foto-pop-up te zien.
  ;(trip.nearbyImages ?? []).forEach((url, i) => {
    const id = `${trip.id}-nearby-${i}`
    images.push({ id, url, alt: trip.title, position: images.length === 0 ? 'hero' : 'gallery' })
    stickers[id] = COVER_STICKER
  })
  // 1. Eén foto per hotel, in reisvolgorde.
  trip.stops.forEach((stop, i) => {
    if (!stop.image) return
    const id = `${trip.id}-img-${i}`
    images.push({ id, url: stop.image, alt: l(stop.hotelName), position: images.length === 0 ? 'hero' : 'gallery' })
    stickers[id] = stop.hotelName
  })
  // 2. Aanvullen met extra foto's — uit de dataset (hotels in deals.json) of
  //    uit `extraImages` van de stop (aangeleverde hotelfoto's) — round-robin
  //    over de hotels, zodat elk hotel in de zichtbare 1 + 4 gallery terugkomt.
  const used = new Set(images.map(img => img.url.split('?')[0]))
  const extras = trip.stops.map((stop) => {
    const h = stop.hotelSlug ? mappedHotelsByHotelPermalink[stop.hotelSlug] : undefined
    const urls = [...(stop.extraImages ?? []), ...(h?.images ?? []).map(img => img.url)]
    return {
      name: stop.hotelName,
      urls: urls.filter(u => !used.has(u.split('?')[0])),
    }
  })
  let round = 0
  while (images.length < MAX_GALLERY && extras.some(e => e.urls.length)) {
    for (const e of extras) {
      if (images.length >= MAX_GALLERY) break
      const url = e.urls.shift()
      if (!url) continue
      const id = `${trip.id}-extra-${round}-${images.length}`
      images.push({ id, url, alt: l(e.name), position: 'gallery' })
      stickers[id] = e.name
    }
    round++
  }
  return { images, stickers }
}

const F = (nl: string, en: string): LocalizedString => ({ nl, en })

/** Veelgestelde vragen bij een vakantie — de verwarring die een rondreis
 *  met meerdere hotels oproept (eigen auto? groepsreis? één boeking?),
 *  met een paar varianten voor de fietsvakantie. */
function tripFaq(trip: MultiHotelTripDetail): FaqItem[] {
  const bike = trip.type === 'fiets'
  const first = trip.stops[0]
  const n = trip.stops.length
  const items: FaqItem[] = [
    { id: 'trip-groep', question: F('Is dit een groepsreis?', 'Is this a group tour?'),
      answer: F(`Nee. Je reist zelfstandig, in je eigen tempo en zonder reisleider. Wij hebben de ${n} hotels, de diners en het voorbeeldprogramma voor je geregeld; onderweg bepaal je zelf wat je doet en wanneer je vertrekt.`,
        `No. You travel independently, at your own pace and without a tour guide. We have arranged the ${n} hotels, the dinners and the sample programme; along the way you decide what you do and when you leave.`) },
    bike
      ? { id: 'trip-fiets', question: F('Breng ik mijn eigen fiets mee?', 'Do I bring my own bike?'),
          answer: F('Dat mag, maar het hoeft niet: bij het eerste hotel kun je een fiets of e-bike huren voor de hele week (reserveer bij het boeken). Je auto blijft de hele vakantie gratis bij het eerste hotel staan.',
            'You can, but you do not have to: at the first hotel you can rent a bike or e-bike for the whole week (reserve when booking). Your car stays parked for free at the first hotel all week.') }
      : { id: 'trip-auto', question: F('Breng ik mijn eigen auto mee?', 'Do I bring my own car?'),
          answer: F(`Ja, dit is een vakantie met eigen vervoer: je rijdt zelf van huis naar ${first?.city ?? 'het eerste hotel'} en daarna van hotel naar hotel. Een huurauto kan natuurlijk ook. Parkeren bij de hotels is inbegrepen; laadmogelijkheden voor elektrisch rijden vind je per hotel onder "Meer over hotel".`,
            `Yes, this is a self-drive holiday: you drive from home to ${first?.city ?? 'the first hotel'} and then from hotel to hotel. A rental car works too. Parking at the hotels is included; charging options for electric cars are listed per hotel under "More about the hotel".`) },
    { id: 'trip-fietshuur', question: F(bike ? 'Kan ik ter plaatse een e-bike huren?' : 'Kan ik ter plaatse een fiets huren?', bike ? 'Can I rent an e-bike locally?' : 'Can I rent a bike locally?'),
      answer: F(bike
        ? 'Ja. Bij het eerste hotel staan fietsen en e-bikes klaar; geef bij het boeken je lengte en voorkeur door, dan staat de fiets afgesteld op je te wachten.'
        : 'Bij de meeste hotels wel: ze verhuren fietsen of e-bikes of regelen ze voor je bij een verhuurder in het dorp. Kijk bij de faciliteiten van elk hotel (via "Meer over hotel") of vraag het bij het boeken; wij reserveren ze dan alvast.',
        bike
        ? 'Yes. Bikes and e-bikes are ready at the first hotel; tell us your height and preference when booking and the bike will be adjusted and waiting for you.'
        : 'At most hotels, yes: they rent bikes or e-bikes or arrange them for you with a local rental shop. Check each hotel\'s facilities (via "More about the hotel") or ask when booking and we will reserve them for you.') },
    { id: 'trip-programma', question: F('Moet ik het voorbeeldreisschema precies volgen?', 'Do I have to follow the sample itinerary exactly?'),
      answer: F('Nee. Alleen de hotelnachten en de diners op de aankomstdagen liggen vast. Het dag-voor-dagprogramma is een voorbeeld met onze favoriete tips; sla gerust iets over of blijf langer hangen waar het je bevalt.',
        'No. Only the hotel nights and the dinners on arrival days are fixed. The day-by-day programme is a sample with our favourite tips; skip something or linger wherever you like.') },
    { id: 'trip-boeking', question: F(`Hoe werkt het boeken en inchecken bij ${n} hotels?`, `How do booking and check-in work with ${n} hotels?`),
      answer: F('Je boekt de hele vakantie in één keer en krijgt één bevestiging met alle hotels, data en inbegrepen extra\'s. Bij elk hotel meld je je gewoon met je naam; de hotels weten dat je komt en wat er inbegrepen is.',
        'You book the whole holiday in one go and receive one confirmation listing every hotel, the dates and the included extras. At each hotel you simply give your name; the hotels know you are coming and what is included.') },
    { id: 'trip-vol', question: F('Wat als één van de hotels vol is op mijn datum?', 'What if one of the hotels is full on my date?'),
      answer: F('De kalender toont alleen aankomstdata waarop alle hotels beschikbaar zijn, zodat je nooit een halve reis boekt. Is jouw voorkeursdatum niet beschikbaar, dan zie je direct de dichtstbijzijnde alternatieven.',
        'The calendar only shows arrival dates on which all hotels are available, so you never book half a trip. If your preferred date is not available you immediately see the nearest alternatives.') },
    { id: 'trip-maaltijden', question: F('Welke maaltijden zijn inbegrepen?', 'Which meals are included?'),
      answer: F(bike
        ? 'Elke ochtend het ontbijt en elke avond een 3-gangendiner in het hotel waar je slaapt. Lunch regel je zelf onderweg; in het reisschema staan onze tips.'
        : 'Elke ochtend het ontbijt in het hotel waar je slaapt, en op elke aankomstdag een 3-gangendiner in dat hotel. De overige avonden ben je vrij; in het reisschema staan onze restauranttips.',
        bike
        ? 'Breakfast every morning and a 3-course dinner every evening at the hotel where you stay. Lunch is up to you along the way; the itinerary lists our tips.'
        : 'Breakfast every morning at the hotel where you stay, and a 3-course dinner at that hotel on each arrival day. The other evenings are free; the itinerary lists our restaurant tips.') },
    { id: 'trip-afstand', question: F(bike ? 'Hoe ver fiets ik per dag?' : 'Hoe lang rijd ik per dag?', bike ? 'How far do I cycle per day?' : 'How long do I drive per day?'),
      answer: F(bike
        ? 'De etappes tussen de hotels zijn 30 tot 45 kilometer over rustige fietspaden, met onderweg genoeg terrassen. Op de verblijfsdagen kies je zelf een rondje vanuit het hotel — of je laat de fiets een dag staan.'
        : 'De etappes tussen de hotels duren bewust maar een uurtje, zodat je onderweg tijd hebt voor een stad of een kust. Alleen de heen- en terugreis vanuit huis is langer; die staat bij het kaartje.',
        bike
        ? 'The legs between the hotels are 30 to 45 kilometres on quiet cycle paths, with plenty of terraces along the way. On stay days you pick your own loop from the hotel — or leave the bike for a day.'
        : 'The legs between the hotels deliberately take only about an hour, leaving time for a town or a stretch of coast on the way. Only the drive from home and back is longer; you will find it next to the map.') },
    bike
      ? { id: 'trip-bagage', question: F('Hoe komt mijn bagage bij het volgende hotel?', 'How does my luggage get to the next hotel?'),
          answer: F('Je koffers reizen vooruit: zet ze voor het ontbijt klaar bij de receptie en ze staan \'s middags op je kamer in het volgende hotel. Jij fietst met alleen een dagtas.',
            'Your luggage travels ahead: leave it at reception before breakfast and it will be in your room at the next hotel in the afternoon. You cycle with just a day bag.') }
      : { id: 'trip-tol', question: F('Heb ik een vignet nodig of betaal ik tol?', 'Do I need a vignette or pay tolls?'),
          answer: F('Voor Nederland, België en Frankrijk heb je geen vignet nodig. In Frankrijk betaal je tol op sommige snelwegen; de etappes tussen de hotels lopen grotendeels over tolvrije wegen. Reken voor de heenreis op een klein tolbedrag als je de snelste route neemt.',
            'No vignette is needed for the Netherlands, Belgium or France. In France some motorways charge tolls; the legs between the hotels mostly follow toll-free roads. Allow for a small toll on the drive there if you take the fastest route.') },
    ...(bike ? [
      { id: 'trip-niveau', question: F('Hoe zwaar zijn de etappes?', 'How demanding are the legs?'),
        answer: F('Licht: de etappes zijn 20 tot 45 kilometer over verharde fietspaden en knooppuntroutes, grotendeels vlak met een paar zachte klimmen op de Sallandse Heuvelrug en naar de Herikerberg. In rustig tempo fiets je 1 tot 3 uur per etappe, met tijd voor een terras. Een e-bike is welkom, maar niet nodig.',
          'Easy: the legs are 20 to 45 kilometres on paved cycle paths and junction routes, mostly flat with a few gentle climbs on the Sallandse Heuvelrug and up to the Herikerberg. At a relaxed pace you cycle 1 to 3 hours per leg, with time for a terrace. An e-bike is welcome but not necessary.') },
      { id: 'trip-trein', question: F('Kan ik met de trein komen en mijn fiets meenemen?', 'Can I come by train and bring my bike?'),
        answer: F(`Ja. Station ${trip.station ?? first?.city ?? ''} ligt op een paar minuten fietsen van het eerste hotel. Buiten de spits mag je fiets mee in de trein met een fietskaartje; reis je liever zonder fiets, dan staat er bij aankomst een huurfiets of e-bike voor je klaar.`,
          `Yes. ${trip.station ?? first?.city ?? ''} station is a few minutes' ride from the first hotel. Outside rush hour your bike travels with you on the train with a bicycle ticket; if you prefer to travel without a bike, a rental bike or e-bike is waiting for you on arrival.`) },
    ] as FaqItem[] : []),
    { id: 'trip-annuleren', question: F('Kan ik annuleren of mijn datum wijzigen?', 'Can I cancel or change my date?'),
      answer: F('Tot 30 dagen voor vertrek annuleer je kosteloos. Daarna gelden de voorwaarden van de hotels. Een andere aankomstdatum regelen we op aanvraag, afhankelijk van de beschikbaarheid bij alle hotels.',
        'Up to 30 days before departure you can cancel free of charge. After that the hotels\' conditions apply. We arrange a different arrival date on request, subject to availability at all hotels.') },
  ]
  return items
}

function buildDeal(trip: MultiHotelTripDetail): Deal {
  return {
    id: `${trip.id}-deal`,
    hotelSlug: trip.slug,
    nights: trip.nights,
    title: trip.title,
    subtitle: trip.pitch,
    inclusions: trip.inclusions.map((title, i) => ({
      id: `${trip.id}-inc-${i}`,
      icon: '',
      title,
      description: title,
    })),
    baseRoomType: sharedBaseRoom,
    // Geen kamerupgrades op vakantieniveau — de upgrades zitten per hotel
    // al in de "Inclusief"-lijsten.
    roomUpgrades: [],
    basePrice: trip.price,
    originalPrice: trip.originalPrice,
    discountPercentage: trip.discountPercentage,
    pricePerPerson: Math.round(trip.price / 2),
  }
}

function buildHotel(trip: MultiHotelTripDetail, images: HotelImage[], content: TripItinerarySpec | null): Hotel {
  const first = trip.stops[0]!
  const stars = trip.stops.map(s => s.starRating ?? 0)
  const sameStars = stars.every(s => s === stars[0])
  const known = trip.stops
    .map(s => (s.hotelSlug ? mappedHotelsByHotelPermalink[s.hotelSlug] : undefined))
    .filter((h): h is Hotel => !!h)
  // Faciliteiten: vereniging van de bekende hotels (op label), anders leeg.
  const facilities: Facility[] = []
  const seen = new Set<string>()
  for (const h of known) {
    for (const f of h.facilities) {
      const key = f.label.nl.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      facilities.push(f)
    }
  }
  return {
    id: trip.id,
    slug: trip.slug,
    name: `${trip.stops.length} fantastische hotels`,
    starRating: sameStars ? (stars[0] ?? 0) : 0,
    location: {
      city: first.city,
      region: first.region,
      country: known[0]?.location.country ?? 'Nederland',
      coordinates: { lat: first.lat ?? 52.0, lng: first.lng ?? 5.0 },
      address: '',
    },
    // Samenvattende beschrijving: alinea's als <p> zodat de dealpagina de
    // eerste alinea als teaser toont en de rest in de "Lees meer"-pop-up.
    description: content
      ? { nl: content.description.map(p => `<p>${p.nl}</p>`).join('\n'), en: content.description.map(p => `<p>${p.en}</p>`).join('\n') }
      : { nl: `<p>${trip.pitch.nl}</p>`, en: `<p>${trip.pitch.en}</p>` },
    pitch: trip.pitch,
    houseRules: sharedHouseRules,
    images,
    facilities,
    reviews: {
      overallScore: trip.reviewScore,
      totalReviews: trip.reviewCount,
      categories: sharedReviewSummary.categories,
    },
    individualReviews: sharedReviews,
    nearbyTips: known[0]?.nearbyTips ?? sharedNearbyTips,
    faq: tripFaq(trip),
    highlights: (content?.highlights ?? trip.highlights).map(text => ({ icon: '', text })),
  }
}

/** Vakantie-PDP-data voor een route-slug, of null als het geen vakantie is. */
export function tripPdpBySlug(slug: string): MultiHotelTripPdp | null {
  const trip = tripDetailBySlug[slug]
  if (!trip) return null
  const content = TRIP_ITINERARIES[trip.id] ?? null
  const { images, stickers } = buildImages(trip)
  return { trip, deal: buildDeal(trip), hotel: buildHotel(trip, images, content), stickers, content, days: buildTripDays(trip, content) }
}
