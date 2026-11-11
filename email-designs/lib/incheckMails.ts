// De incheckmails (dag vóór hotel 1, 2 en 3) voor de twee demo-reizen: de Opaalkust (auto) en
// Twente & Salland (fiets). Eén component (emails/vakantie-incheck-hotel.tsx) met per reis en
// hotel andere props. Adressen, telefoonnummers, parkeren en laadpunten zijn prototype-placeholders; de
// inclusies per hotel zijn die van de bevestigingsmail (zonder overnachting, kamer en parkeren).
import { baseUrl } from "../components/theme";
import { incheckPreheader, incheckSubject, type IncheckHotel, type IncheckProps } from "../emails/vakantie-incheck-hotel";

const PROTO = "https://vialuxury.vercel.app";

type TripData = {
  key: "auto" | "fiets";
  label: string;
  isBike: boolean;
  tripType: string;
  tripName: string;
  slug: string;
  /** Incheckdag per hotel ("dinsdag 18 mei"). */
  arrivalDates: string[];
  /** Etappe naar hotel 2 en 3. */
  travel: ({ km: number; duration: string } | undefined)[];
  homeTravel: string;
  hotels: IncheckHotel[];
  thumbs: { image: string; alt: string }[];
};

const TRIPS: TripData[] = [
  {
    key: "auto",
    label: "autovakantie",
    isBike: false,
    tripType: "Autovakantie",
    tripName: "Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
    slug: "ontdek-noord-frankrijk-en-de-opaalkust-in-7-dagen",
    arrivalDates: ["dinsdag 18 mei", "donderdag 20 mei", "zaterdag 22 mei"],
    travel: [undefined, { km: 53, duration: "ca. 45 minuten rijden" }, { km: 90, duration: "ca. 1 uur en 5 minuten rijden" }],
    homeTravel: "ca. 3 uur 45 min vanuit Utrecht",
    hotels: [
      {
        name: "Château Tilques", city: "Tilques", address: "Rue du Château, 62500 Tilques, Frankrijk",
        image: `${baseUrl}/images/mail/vakantie/tilques-t2.jpg`, phone: "+33 3 21 12 34 51",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Ch%C3%A2teau+Tilques%2C+Rue+du+Ch%C3%A2teau%2C+62500+Tilques",
        checkInTime: "15:00", checkOutTime: "14:00",
        includes: ["Dagelijks uitgebreid ontbijtbuffet", "3-gangendiner bij Le Vert Mesnil (dag van aankomst)", "Gebruik van het binnenzwembad", "Tennis & jeu de boules", "Late check-out tot 14:00 uur"],
        parking: "Je kunt gratis parkeren op het terrein van het kasteel, direct bij de ingang.",
        charging: "Er is een laadpunt bij het hotel (type 2, 11 kW); meld bij het inchecken dat je wilt laden. Snelladers vind je langs de A26 bij Saint-Omer.",
      },
      {
        name: "Château Cléry", city: "Hesdin-l'Abbé", address: "Rue du Château, 62360 Hesdin-l'Abbé, Frankrijk",
        image: `${baseUrl}/images/vakanties/001/clery-c1.jpg`, phone: "+33 3 21 12 34 52",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Ch%C3%A2teau+Cl%C3%A9ry%2C+Hesdin-l%27Abb%C3%A9",
        checkInTime: "15:00", checkOutTime: "14:00",
        includes: ["Dagelijks uitgebreid ontbijtbuffet", "3-gangendiner bij Le Berthier (dag van aankomst)", "Gebruik van de sauna", "Late check-out tot 14:00 uur"],
        parking: "Gratis parkeren op het landgoed, naast het hotel.",
        charging: "Laadpunt op 2 km (parkeerterrein van de supermarkt in Hesdin-l'Abbé); op aanvraag een stopcontact bij het hotel voor langzaam laden.",
      },
      {
        name: "Hotel Royal Beaulaincourt", city: "Béthune", address: "Rue de Beaulaincourt, 62400 Béthune, Frankrijk",
        image: `${baseUrl}/images/vakanties/001/beaulaincourt-b1.jpg`, phone: "+33 3 21 12 34 53",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hotel+Royal+Beaulaincourt%2C+B%C3%A9thune",
        checkInTime: "14:00", checkOutTime: "15:00",
        includes: ["Dagelijks ontbijt", "3-gangendiner in het restaurant van het hotel (dag van aankomst)", "Welkomstbubbels", "Late check-out tot 15:00 uur"],
        parking: "Gratis parkeren op het afgesloten terrein van het hotel.",
        charging: "Laadpunt op 3 km bij het winkelcentrum; snelladers langs de A26 richting huis.",
      },
    ],
    thumbs: [
      { image: `${baseUrl}/images/mail/vakantie/uitje-blancnez-3x2.jpg`, alt: "Cap Blanc-Nez" },
      { image: `${baseUrl}/images/mail/vakantie/uitje-boulogne-3x2.jpg`, alt: "Boulogne-sur-Mer" },
      { image: `${baseUrl}/images/mail/vakantie/routekaart-3x2.jpg`, alt: "Routekaart van de vakantie" },
    ],
  },
  {
    key: "fiets",
    label: "fietsvakantie",
    isBike: true,
    tripType: "Fietsvakantie",
    tripName: "7-daagse fietsvakantie Twente & Salland: Delden – Raalte – Markelo",
    slug: "fietsvakantie-twente-en-salland-delden-raalte-markelo",
    arrivalDates: ["maandag 7 juni", "woensdag 9 juni", "vrijdag 11 juni"],
    travel: [undefined, { km: 45, duration: "ca. 3 uur fietsen" }, { km: 35, duration: "ca. 2,5 uur fietsen" }],
    homeTravel: "ca. 1 uur 30 min met de auto vanuit Utrecht; gratis parkeren bij het hotel voor de hele vakantie",
    hotels: [
      {
        name: "Hotel Wapen van Delden", city: "Delden", address: "Langestraat 242, 7491 AM Delden",
        image: `${baseUrl}/images/vakanties/007/hotel-wapen-van-delden.jpg`, phone: "+31 74 376 1234",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hotel+Wapen+van+Delden%2C+Delden",
        checkInTime: "15:00", checkOutTime: "11:00",
        includes: ["Dagelijks uitgebreid ontbijtbuffet", "2× 3-gangendiner", "Welkomstfietstasje met water, regenponcho en bandenplaksetje", "ViaLuxury welkomstcadeau", "Bagagetransport naar Raalte"],
        bikeStorage: "Afgesloten fietsenstalling bij het hotel, met laadpunt voor e-bikes.",
      },
      {
        name: "Hotel de Zwaan", city: "Raalte", address: "Kerkstraat 2, 8102 EA Raalte",
        image: `${baseUrl}/images/vakanties/007/hotel-de-zwaan-gebouw.jpg`, phone: "+31 572 36 1234",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hotel+de+Zwaan%2C+Raalte",
        checkInTime: "15:00", checkOutTime: "12:00",
        includes: ["Dagelijks uitgebreid ontbijtbuffet", "2× 3-gangendiner", "Fietsroutes Salland op je telefoon", "Bagagetransport naar Markelo"],
        bikeStorage: "Overdekte, afgesloten stalling achter het hotel; e-bikes laad je in de stalling.",
      },
      {
        name: "Landhuishotel Herikerberg", city: "Markelo", address: "Herikerbergweg 5, 7475 TB Markelo",
        image: `${baseUrl}/images/vakanties/007/hotel-herikerberg.jpg`, phone: "+31 547 36 1234",
        mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Landhuishotel+Herikerberg%2C+Markelo",
        checkInTime: "15:00", checkOutTime: "11:00",
        includes: ["Dagelijks uitgebreid ontbijtbuffet", "2× 3-gangendiner", "Fietsroutes Twente op je telefoon", "Bagagetransport terug naar Delden"],
        bikeStorage: "Afgesloten fietsenstalling naast de ingang, met laadpunt voor e-bikes.",
      },
    ],
    thumbs: [
      { image: `${baseUrl}/images/mail/vakantie/fiets-twickel-3x2.jpg`, alt: "Kasteel Twickel" },
      { image: `${baseUrl}/images/mail/vakantie/fiets-ijssel-3x2.jpg`, alt: "De IJssel bij Deventer" },
      { image: `${baseUrl}/images/mail/vakantie/fiets-routekaart-3x2.jpg`, alt: "Routekaart van de fietsvakantie" },
    ],
  },
];

export type IncheckMailDef = { slug: string; title: string; description: string; subject: string; preheader: string; props: IncheckProps };

/** Zes mails: hotel 1, 2 en 3 voor de auto- en de fietsvakantie. */
export const incheckMails: IncheckMailDef[] = TRIPS.flatMap((trip) =>
  trip.hotels.map((hotel, i): IncheckMailDef => {
    const n = i + 1;
    const previousHotel = i > 0 ? trip.hotels[i - 1] : undefined;
    const slug = `vakantie-incheck-hotel-${n}${trip.key === "fiets" ? "-fiets" : ""}`;
    const what = n === 1
      ? "morgen begint je vakantie: de gegevens van je eerste hotel"
      : `terugblik op ${previousHotel!.name}, morgen door naar ${hotel.name}${trip.isBike ? " (bagage vóór 9:00 uur bij de receptie)" : ""}`;
    const props: IncheckProps = {
      recipientName: "Rijo Verburg",
      recipientEmail: "rijo.verburg@gmail.com",
      bookingNumber: trip.key === "fiets" ? "VL-85 584 493" : "VL-11 851 812",
      tripType: trip.tripType,
      tripName: trip.tripName,
      isBike: trip.isBike,
      hotelIndex: n,
      hotelCount: trip.hotels.length,
      hotel,
      previousHotel,
      arrivalDate: trip.arrivalDates[i]!,
      travel: trip.travel[i],
      homeTravel: n === 1 ? trip.homeTravel : undefined,
      thumbs: trip.thumbs,
      routesUrl: `${PROTO}/multi-hotel-trip/checkout/routes`,
      bookingUrl: `${PROTO}/multi-hotel-trip/account/boekingen/${trip.slug}`,
    };
    return {
      slug,
      // Zelfde titel voor auto en fiets (de reis staat in de beschrijving), zodat de schakelaar op de preview niet verspringt.
      title: `Incheck hotel ${n} (dag voor aankomst)`,
      description: `De dag vóór hotel ${n} van de ${trip.label}: ${what}. Kort: "Morgen in het kort", het hotelblok (adres, route, telefoon, inchecken, ${trip.isBike ? "stalling, bagagetransfer" : "parkeren, opladen"}, wat er inbegrepen is), praktische informatie en tips, je boeking online, Hulp nodig? en veelgestelde vragen (met de link Boeking annuleren).`,
      subject: incheckSubject(props),
      preheader: incheckPreheader(props),
      props,
    };
  }),
);
