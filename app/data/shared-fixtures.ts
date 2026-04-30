/**
 * Shared fixtures used across all hotels for fields that aren't in deals.json:
 * - Individual reviews
 * - Review category breakdown
 * - FAQ
 * - Nearby tips
 * - House rules
 * - Base room + room upgrades
 *
 * One generic set used for all hotels in the prototype dataset.
 */
import type { Review, ReviewSummary, NearbyTip, FaqItem, HouseRule } from '~/types/hotel'
import type { RoomOption } from '~/types/deal'

export const sharedReviewSummary: Pick<ReviewSummary, 'categories'> = {
  categories: [
    { name: { nl: 'Hygiëne', en: 'Hygiene' }, icon: 'cleaning_services', score: 9.4 },
    { name: { nl: 'Service', en: 'Service' }, icon: 'local_activity', score: 9.6 },
    { name: { nl: 'Kamers', en: 'Rooms' }, icon: 'bed', score: 9.2 },
    { name: { nl: 'Locatie', en: 'Location' }, icon: 'location_on', score: 9.0 },
    { name: { nl: 'Gastronomie', en: 'Gastronomy' }, icon: 'restaurant', score: 9.3 },
    { name: { nl: 'Aankomst', en: 'Check-in' }, icon: 'card_travel', score: 9.1 },
  ],
}

export const sharedReviews: Review[] = [
  {
    id: 'rev-1',
    author: 'Marco',
    date: '2026-03-15',
    score: 9.5,
    text: {
      nl: 'Wat een prachtig hotel! De kamer had een geweldig uitzicht, het diner was uitstekend en het personeel was bijzonder vriendelijk. Zeker voor herhaling vatbaar.',
      en: "What a beautiful hotel! The room had a fantastic view, the dinner was excellent, and the staff was particularly friendly. Definitely worth another visit.",
    },
  },
  {
    id: 'rev-2',
    author: 'Lisa',
    date: '2026-03-10',
    score: 9.2,
    text: {
      nl: 'Perfecte plek voor een romantisch weekendje weg. De wellness was fantastisch en het ontbijt uitgebreid. Een aanrader!',
      en: 'Perfect spot for a romantic weekend getaway. The wellness was fantastic and the breakfast extensive. Highly recommended!',
    },
  },
  {
    id: 'rev-3',
    author: 'Pieter',
    date: '2026-02-28',
    score: 8.9,
    text: {
      nl: 'Mooi gerestaureerd hotel met veel charme. De kamer was ruim en stijlvol ingericht. Service kon hier en daar nog wat vlotter, maar overall zeer tevreden.',
      en: 'Beautifully restored hotel with lots of charm. The room was spacious and stylishly decorated. Service could be a bit faster here and there, but overall very satisfied.',
    },
  },
  {
    id: 'rev-4',
    author: 'Anouk',
    date: '2026-02-20',
    score: 9.7,
    text: {
      nl: 'Wat een fantastische ervaring! Van het welkomstdrankje tot het uitgebreide ontbijt — alles was top. Het hotel zelf is prachtig en de omgeving heerlijk.',
      en: 'What a fantastic experience! From the welcome drink to the extensive breakfast — everything was top-notch. The hotel itself is beautiful and the surroundings lovely.',
    },
  },
  {
    id: 'rev-5',
    author: 'Jeroen',
    date: '2026-02-12',
    score: 9.0,
    text: {
      nl: 'Heel mooi hotel, goed eten en aandacht voor detail. Onze kamer was mooi gerenoveerd en zeer comfortabel. We komen zeker terug.',
      en: 'Very nice hotel, good food and attention to detail. Our room was nicely renovated and very comfortable. We will definitely return.',
    },
  },
]

export const sharedFaq: FaqItem[] = [
  {
    id: 'faq-cancel',
    question: { nl: 'Kan ik mijn boeking kosteloos annuleren?', en: 'Can I cancel my booking free of charge?' },
    answer: {
      nl: 'Ja, je kunt je boeking tot 7 dagen voor aankomst kosteloos annuleren. Daarna geldt het annuleringsbeleid van het hotel.',
      en: 'Yes, you can cancel your booking free of charge up to 7 days before arrival. After that, the hotel’s cancellation policy applies.',
    },
  },
  {
    id: 'faq-pets',
    question: { nl: 'Zijn huisdieren toegestaan?', en: 'Are pets allowed?' },
    answer: {
      nl: 'Het beleid voor huisdieren verschilt per hotel. Check de huisregels op deze pagina of neem contact op met onze klantenservice.',
      en: 'Pet policies vary per hotel. Check the house rules on this page or contact customer service.',
    },
  },
  {
    id: 'faq-breakfast',
    question: { nl: 'Is ontbijt inbegrepen?', en: 'Is breakfast included?' },
    answer: {
      nl: 'Of ontbijt inbegrepen is, hangt af van het arrangement. Op de pagina van het arrangement zie je precies wat er bij zit.',
      en: 'Whether breakfast is included depends on the package. On the package page you can see exactly what is included.',
    },
  },
  {
    id: 'faq-checkin',
    question: { nl: 'Hoe laat kan ik inchecken?', en: 'What time can I check in?' },
    answer: {
      nl: 'Inchecken is meestal vanaf 15:00 uur. Eerder inchecken is mogelijk op aanvraag, afhankelijk van beschikbaarheid.',
      en: 'Check-in is usually from 3:00 PM. Earlier check-in is possible on request, subject to availability.',
    },
  },
  {
    id: 'faq-children',
    question: { nl: 'Zijn kinderen welkom?', en: 'Are children welcome?' },
    answer: {
      nl: 'Bij de meeste hotels zijn kinderen van alle leeftijden welkom. Specifieke regels per hotel staan in de huisregels.',
      en: 'At most hotels, children of all ages are welcome. Specific rules per hotel are in the house rules.',
    },
  },
]

export const sharedNearbyTips: NearbyTip[] = [
  {
    id: 'tip-1',
    title: { nl: 'Wandelen langs het strand', en: 'Walk along the beach' },
    description: {
      nl: 'Trek je wandelschoenen aan en geniet van de frisse zeelucht tijdens een wandeling over het strand of door de duinen.',
      en: 'Put on your hiking shoes and enjoy the fresh sea air during a walk on the beach or through the dunes.',
    },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
  },
  {
    id: 'tip-2',
    title: { nl: 'Bezoek een lokaal museum', en: 'Visit a local museum' },
    description: {
      nl: 'Ontdek de cultuur en geschiedenis van de regio in een van de gerenommeerde musea in de buurt.',
      en: 'Discover the culture and history of the region in one of the renowned museums nearby.',
    },
    image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&auto=format&fit=crop',
  },
  {
    id: 'tip-3',
    title: { nl: 'Culinair uit eten', en: 'Culinary dining out' },
    description: {
      nl: 'De omgeving biedt een breed scala aan restaurants — van knusse bistro tot Michelin-bekroonde keukens.',
      en: 'The area offers a wide range of restaurants — from cozy bistros to Michelin-starred kitchens.',
    },
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
  },
]

export const sharedHouseRules: HouseRule[] = [
  {
    id: 'rule-checkin',
    title: { nl: 'Check-in / Check-out', en: 'Check-in / Check-out' },
    description: {
      nl: 'Check-in vanaf 15:00 uur. Check-out tot 11:00 uur. Vroeg inchecken of laat uitchecken op aanvraag.',
      en: 'Check-in from 3:00 PM. Check-out until 11:00 AM. Early check-in or late check-out on request.',
    },
  },
  {
    id: 'rule-pets',
    title: { nl: 'Huisdieren', en: 'Pets' },
    description: {
      nl: 'Het beleid verschilt per hotel. Neem contact op met de klantenservice voor specifieke informatie.',
      en: 'Policy varies per hotel. Contact customer service for specific information.',
    },
  },
  {
    id: 'rule-parking',
    title: { nl: 'Parkeren', en: 'Parking' },
    description: {
      nl: 'De meeste hotels bieden gratis of betaald parkeren aan. Details staan in de hotelinformatie.',
      en: 'Most hotels offer free or paid parking. Details are in the hotel information.',
    },
  },
  {
    id: 'rule-smoking',
    title: { nl: 'Roken', en: 'Smoking' },
    description: {
      nl: 'De meeste hotels zijn rookvrij. Roken is alleen toegestaan op de daarvoor aangewezen plekken buiten.',
      en: 'Most hotels are smoke-free. Smoking is only allowed in designated outdoor areas.',
    },
  },
  {
    id: 'rule-children',
    title: { nl: 'Kinderen', en: 'Children' },
    description: {
      nl: 'Kinderen zijn over het algemeen welkom. Specifieke regels per hotel verschillen.',
      en: 'Children are generally welcome. Specific rules per hotel may differ.',
    },
  },
]

export const sharedBaseRoom: RoomOption = {
  id: 'room-base',
  name: { nl: 'Comfort kamer', en: 'Comfort room' },
  description: {
    nl: 'Een comfortabele kamer van ca. 25 m² met alle benodigde voorzieningen voor een ontspannen verblijf.',
    en: 'A comfortable room of approx. 25 m² with all necessary amenities for a relaxing stay.',
  },
  image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
  priceExtra: 0,
  isDefault: true,
  features: [
    { nl: '2-persoons bed', en: 'Double bed' },
    { nl: 'Privé badkamer', en: 'Private bathroom' },
    { nl: 'Gratis WiFi', en: 'Free WiFi' },
    { nl: 'Koffie- en theefaciliteiten', en: 'Coffee and tea facilities' },
  ],
}

export const sharedRoomUpgrades: RoomOption[] = [
  {
    id: 'room-deluxe',
    name: { nl: 'Deluxe kamer', en: 'Deluxe room' },
    description: {
      nl: 'Een ruime, stijlvol ingerichte kamer met extra comfort en mooi uitzicht.',
      en: 'A spacious, stylishly furnished room with extra comfort and a beautiful view.',
    },
    upgradeDescription: {
      nl: 'Je hebt voor een Deluxe kamer gekozen. Een uitstekende keuze: meer ruimte, betere amenities en een mooi uitzicht.',
      en: 'You have chosen a Deluxe room. An excellent choice: more space, better amenities and a beautiful view.',
    },
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop',
    priceExtra: 75,
    isDefault: false,
    maxAvailable: 5,
    features: [
      { nl: 'Ruimere kamer (35 m²)', en: 'Larger room (35 m²)' },
      { nl: 'Comfortabele zithoek', en: 'Comfortable seating area' },
      { nl: 'Mooi uitzicht', en: 'Beautiful view' },
      { nl: 'Premium beddengoed', en: 'Premium bedding' },
    ],
  },
  {
    id: 'room-suite',
    name: { nl: 'Junior Suite', en: 'Junior Suite' },
    description: {
      nl: 'Een luxueuze suite met aparte zit- en slaapruimte — perfect voor een speciaal verblijf.',
      en: 'A luxurious suite with separate living and sleeping areas — perfect for a special stay.',
    },
    upgradeDescription: {
      nl: 'Je hebt een Junior Suite geselecteerd: het ultieme verblijf met extra ruimte, luxe interieur en een eersteklas badkamer.',
      en: 'You have selected a Junior Suite: the ultimate stay with extra space, luxury interior and a first-class bathroom.',
    },
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
    priceExtra: 149,
    isDefault: false,
    maxAvailable: 2,
    features: [
      { nl: 'Aparte zit- en slaapruimte', en: 'Separate living and sleeping area' },
      { nl: 'Luxueus kingsize bed', en: 'Luxurious king-size bed' },
      { nl: 'Elegante badkamer met bad', en: 'Elegant bathroom with bathtub' },
      { nl: 'Nespresso-koffiemachine', en: 'Nespresso coffee machine' },
      { nl: 'Minibar', en: 'Minibar' },
    ],
  },
]
