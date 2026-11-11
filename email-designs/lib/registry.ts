import type * as React from "react";
import VakantieBevestiging, { fietsPreviewProps as bevestigingFiets } from "../emails/vakantie-bevestiging";
import VakantiePreTravel, { fietsPreviewProps as preTravelFiets } from "../emails/vakantie-pre-travel";
import VakantieIncheckHotel from "../emails/vakantie-incheck-hotel";
import MvpVakantieBevestiging from "../emails/mvp-vakantie-bevestiging";
import CrmNagenieten from "../emails/crm-nagenieten";
import CrmJaarGeleden from "../emails/crm-jaar-geleden";
import CrmWinkelmandje from "../emails/crm-winkelmandje";
import CrmWinkelmandje2Dagen from "../emails/crm-winkelmandje-2-dagen";
import CrmThemaStedentrips from "../emails/crm-thema-stedentrips";
import CrmReview from "../emails/crm-review";
import CrmTerugkomactie, { herinneringProps } from "../emails/crm-terugkomactie";
import CrmZoekopdracht from "../emails/crm-zoekopdracht";
import CrmVerlanglijst from "../emails/crm-verlanglijst";
import { incheckMails } from "./incheckMails";

// "crm": concept-mails voor het CRM-project (alleen light, eigen lijst app/data/crm-emails.json).
export type EmailSection = "designs" | "inspiration" | "crm";

export type EmailEntry = {
  slug: string;
  title: string;
  description: string;
  section: EmailSection;
  /** Onderwerpregel en preheader zoals de ontvanger ze in de inbox ziet (de preheader staat ook
   *  als <Preview> in de mail zelf; hier dezelfde tekst met de voorbeelddata ingevuld). */
  subject?: string;
  preheader?: string;
  /** Variant van een andere mail (slug), bijv. de niet-terugbetaalbare versie `<slug>-nonflex`; de
   *  preview toont die bij de schakelaar Non-flex, in lijsten blijft hij verborgen. */
  variantOf?: string;
  // Elke e-mail exporteert PreviewProps met representatieve voorbeelddata
  // en accepteert een optionele `mode`-prop ("light" | "dark").
  Component: React.ComponentType<any> & { PreviewProps?: Record<string, unknown> };
  /** Props voor deze variant (anders de PreviewProps van het component). */
  props?: Record<string, unknown>;
};

// Alleen de e-mails van de multi-hotel vakanties; de overige ViaLuxury-mails
// staan in het losse project vialuxury-emails.
export const emails: EmailEntry[] = [
  {
    slug: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie",
    description: "Bevestiging na het boeken van een auto- of fietsvakantie met meerdere hotels: kassabon per hotel (adres, nachten, inclusies, check-in/out), flexibel annuleren, prijs, tips voor je reis, boeking terugvinden, niet inbegrepen, FAQ en onderaan het blok Annuleren of wijzigen (tekst per tarief, knop Mijn boeking annuleren).",
    section: "designs",
    subject: "Je boeking is bevestigd: Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
    preheader: "Boekingsnummer VL-11 851 812. Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
  },
  {
    slug: "vakantie-bevestiging-nonflex",
    variantOf: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "Niet-terugbetaalbare boeking: 'Niet terugbetaalbaar — De boeking kan niet geannuleerd worden' op de kassabon, prijs zonder toeslag, FAQ zonder gratis annuleren.",
    section: "designs",
    subject: "Je boeking is bevestigd: Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
    preheader: "Boekingsnummer VL-11 851 812. Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: { ...VakantieBevestiging.PreviewProps, rate: "nonflex", tripPrice: "€919", total: "€946,50" },
  },
  // Fietsvakantie (Twente & Salland): elke mail en pagina bestaat in een auto- én een fietsvariant. Zelfde titel als de
  // autoversie, zodat de schakelaar Auto | Fiets op de preview (naast de titel) niet verspringt.
  {
    slug: "vakantie-bevestiging-fiets",
    title: "Boekingsbevestiging vakantie",
    description: "Dezelfde boekingsbevestiging voor de fietsvakantie Twente & Salland: drie hotels met bagagetransport, fietshuur en de reis naar het eerste hotel niet inbegrepen.",
    section: "designs",
    subject: "Je boeking is bevestigd: 7-daagse fietsvakantie Twente & Salland",
    preheader: "Boekingsnummer VL-85 584 493. Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: bevestigingFiets,
  },
  {
    slug: "vakantie-bevestiging-fiets-nonflex",
    variantOf: "vakantie-bevestiging-fiets",
    title: "Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "Fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Je boeking is bevestigd: 7-daagse fietsvakantie Twente & Salland",
    preheader: "Boekingsnummer VL-85 584 493. Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: { ...bevestigingFiets, rate: "nonflex", tripPrice: "€1.059", total: "€1.086,50" },
  },
  {
    slug: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Checklist voor je reis: identiteitsbewijs en boekingsnummer, inchecken bij het eerste hotel (adres, route, parkeren, opladen, wat er inbegrepen is, wat je nog betaalt), de persoonlijke pagina met praktische informatie en tips, je boeking online, en veelgestelde vragen.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, boekingsnummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
  },
  {
    slug: "vakantie-pre-travel-nonflex",
    variantOf: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "Niet-terugbetaalbare boeking: FAQ 'Kan ik nog wijzigen of annuleren?' zonder gratis annuleren.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, boekingsnummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
    props: { ...VakantiePreTravel.PreviewProps, rate: "nonflex" },
  },
  {
    slug: "vakantie-pre-travel-fiets",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Dezelfde pre-travelmail voor de fietsvakantie Twente & Salland: 'Je fiets' in de checklist, fietsenstalling in plaats van opladen, geen tol.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, boekingsnummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: preTravelFiets,
  },
  {
    slug: "vakantie-pre-travel-fiets-nonflex",
    variantOf: "vakantie-pre-travel-fiets",
    title: "Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "Fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, boekingsnummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: { ...preTravelFiets, rate: "nonflex" },
  },
  // Incheckmails: dag vóór hotel 1, 2 en 3, voor de auto- en de fietsvakantie.
  ...incheckMails.map((m) => ({ slug: m.slug, title: m.title, description: m.description, section: "designs" as const, subject: m.subject, preheader: m.preheader, Component: VakantieIncheckHotel, props: m.props })),
  // MVP 12-11-2026: eigen kopie van de boekingsbevestiging, los van de volledige versie uit te kleden.
  {
    slug: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging: kassabon per hotel (met alle inclusies), flexibel annuleren, prijs, boeking terugvinden, niet inbegrepen, FAQ en onderaan het blok Annuleren of wijzigen — zonder het blok Tips voor je reis.",
    section: "designs",
    subject: "Je boeking is bevestigd: Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
    preheader: "Boekingsnummer VL-11 851 812. Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
  },
  {
    slug: "mvp-vakantie-bevestiging-nonflex",
    variantOf: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "MVP-versie voor een niet-terugbetaalbare boeking: 'Niet terugbetaalbaar' op de kassabon, prijs zonder toeslag, FAQ zonder gratis annuleren.",
    section: "designs",
    subject: "Je boeking is bevestigd: Ontdek Noord-Frankrijk en de Opaalkust in 7 dagen",
    preheader: "Boekingsnummer VL-11 851 812. Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...MvpVakantieBevestiging.PreviewProps, rate: "nonflex", tripPrice: "€919", total: "€946,50" },
  },
  {
    slug: "mvp-vakantie-bevestiging-fiets",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging voor de fietsvakantie Twente & Salland.",
    section: "designs",
    subject: "Je boeking is bevestigd: 7-daagse fietsvakantie Twente & Salland",
    preheader: "Boekingsnummer VL-85 584 493. Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...bevestigingFiets, bookingUrl: "https://vialuxury.vercel.app/mvp-trip/account/boekingen?demo=fiets" },
  },
  {
    slug: "mvp-vakantie-bevestiging-fiets-nonflex",
    variantOf: "mvp-vakantie-bevestiging-fiets",
    title: "MVP — Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "MVP-versie, fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Je boeking is bevestigd: 7-daagse fietsvakantie Twente & Salland",
    preheader: "Boekingsnummer VL-85 584 493. Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...bevestigingFiets, bookingUrl: "https://vialuxury.vercel.app/mvp-trip/account/boekingen?demo=fiets", rate: "nonflex", tripPrice: "€1.059", total: "€1.086,50" },
  },
  // CRM (concept, desktop + light mode): drie geautomatiseerde mails.
  {
    slug: "crm-review",
    title: "Reviewmail (1 dag na thuiskomst)",
    description: "Eén doel: de review. Vijf klikbare Trustpilot-sterren boven de vouw, daaronder het verblijf in een omlijnd blok. Gebaseerd op de reviewmail van Jesse.",
    section: "crm",
    subject: "Hoe was je verblijf?",
    preheader: "We horen graag hoe je het vond. Het kost je een minuut.",
    Component: CrmReview,
  },
  // Overgenomen van Jesse (origin/redesign-jesse), omgezet naar onze bouwstenen.
  {
    slug: "crm-terugkomactie",
    title: "Terugkomactie €20 (14 dagen na vertrek)",
    description: "Kortingscode als coupon, één knop, jouw verblijf, drie deals in de sfeer van dat hotel en de themakiezer.",
    section: "crm",
    subject: "Sanne, €20 cadeau voor je volgende verblijf",
    preheader: "Een persoonlijk bedankje, alleen voor jou. Geldig tot en met 16 december 2026.",
    Component: CrmTerugkomactie,
  },
  {
    slug: "crm-terugkomactie-herinnering",
    title: "Terugkomactie herinnering (30 dagen na vertrek)",
    description: "Voor wie de code nog niet gebruikte: dezelfde coupon met het aantal dagen dat hij nog geldig is, één knop en drie deals.",
    section: "crm",
    subject: "Sanne, je persoonlijke €20 cadeau verloopt op 16 december",
    preheader: "Je persoonlijke cadeau ligt nog klaar. Nog 14 dagen geldig.",
    Component: CrmTerugkomactie,
    props: herinneringProps,
  },
  {
    slug: "crm-zoekopdracht",
    title: "Zoekopdracht (1 minuut na verlaten)",
    description: "De zoekopdracht als samenvatting met één knop naar alle resultaten, daaronder de drie best passende arrangementen.",
    section: "crm",
    subject: "Jouw zoekopdracht: Den Haag",
    preheader: "De beste arrangementen voor 20 november.",
    Component: CrmZoekopdracht,
  },
  {
    slug: "crm-verlanglijst",
    title: "Verlanglijst €10 (3 dagen na eerste mail)",
    description: "Code voor het eerste favoriet, direct boven dat arrangement; daaronder de andere favorieten en twee vergelijkbare arrangementen.",
    section: "crm",
    subject: "€10 cadeau op Kasteel Steenenburg van je verlanglijst",
    preheader: "Jouw unieke code, geldig tot en met 12 november 2026.",
    Component: CrmVerlanglijst,
  },
  {
    slug: "crm-nagenieten",
    title: "Nagenietmail (3 dagen na vertrek)",
    description: "Haalt één gegeven op: wanneer de volgende vakantie is, om latere mails te timen. Grote foto van het hotel met \"We hopen dat je genoten hebt van …\", daarna één vraag met zes gelijkwaardige knoppen. Geen deals, geen code.",
    section: "crm",
    subject: "Wanneer ga je weer?",
    preheader: "Eén klik, dan sturen we je op het juiste moment inspiratie.",
    Component: CrmNagenieten,
  },
  {
    slug: "crm-jaar-geleden",
    title: "Precies een jaar geleden",
    description: "On this day-herinnering op de aankomstdatum +1 jaar: grote foto, datum en hotel, één knop naar het arrangement met dezelfde periode en personen vooringevuld. Kortingsregel alleen bij een actieve code; drie deals met frame-titel.",
    section: "crm",
    subject: "Vandaag een jaar geleden",
    preheader: "Je verblijf in Hotel Des Indes, en een code voor €25 korting.",
    Component: CrmJaarGeleden,
  },
  {
    slug: "crm-winkelmandje",
    title: "Winkelmandje (2 uur na verlaten)",
    description: "Eén doel: de boeking afronden. Winkelmandkaart met concrete datums, nachten, personen en totaalprijs en één knop terug naar de boeking. Gastenoordeel met Trustpilot-sterren en drie reviews. Overgenomen van Jesse. Geen alternatieve deals.",
    section: "crm",
    subject: "Hotel Des Indes op 20 nov: nog beschikbaar",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
  },
  {
    slug: "crm-winkelmandje-2-dagen",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Na de mail van 2 uur nu alternatieven: Door jou bekeken (de deal uit het winkelmandje met prijs en knop), daaronder drie vergelijkbare deals in de list view van de zoekkaarten.",
    section: "crm",
    subject: "Dit zijn 3 deals die lijken op Hotel Des Indes",
    preheader: "Ook in Den Haag en aan de kust, vanaf €309 voor 2 personen.",
    Component: CrmWinkelmandje2Dagen,
  },
  {
    slug: "crm-thema-stedentrips",
    title: "Themamail stedentrips (A6)",
    description: "Drie populaire stedentrips (één groot, twee als rij) met de reden onder de kop, daarna een ander thema kiezen met zes witte snelfilterknoppen in een raster.",
    section: "crm",
    subject: "Dit zijn de populairste stedentrips van dit moment",
    preheader: "Parijs, Den Haag en Amsterdam, vanaf €279 voor 2 personen.",
    Component: CrmThemaStedentrips,
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
