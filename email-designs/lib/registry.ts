import type * as React from "react";
import VakantieBevestiging from "../emails/vakantie-bevestiging";
import VakantiePreTravel from "../emails/vakantie-pre-travel";
import VakantieIncheckHotel from "../emails/vakantie-incheck-hotel";
import MvpVakantieBevestiging from "../emails/mvp-vakantie-bevestiging";
import CrmNagenieten from "../emails/crm-nagenieten";
import CrmJaarGeleden from "../emails/crm-jaar-geleden";
import CrmWinkelmandje from "../emails/crm-winkelmandje";
import CrmReview from "../emails/crm-review";
import CrmTerugkomactie from "../emails/crm-terugkomactie";
import CrmTerugkomactieHerinnering from "../emails/crm-terugkomactie-herinnering";
import CrmZoekopdracht from "../emails/crm-zoekopdracht";
import CrmThemamail from "../emails/crm-themamail";
import CrmVerlanglijst from "../emails/crm-verlanglijst";
import { incheckMails } from "./incheckMails";

// "crm": concept-mails voor het CRM-project (alleen light, eigen lijst app/data/crm-emails.json).
export type EmailSection = "designs" | "inspiration" | "crm";

export type EmailEntry = {
  slug: string;
  title: string;
  description: string;
  section: EmailSection;
  /** Onderwerpregel (CRM-mails; de preheader staat in de mail zelf). */
  subject?: string;
  preheader?: string;
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
    description: "Bevestiging na het boeken van een auto- of fietsvakantie met meerdere hotels: kassabon per hotel (adres, nachten, inclusies, check-in/out), flexibel annuleren, prijs, tips voor je reis, boeking terugvinden, cadeaukaart en FAQ.",
    section: "designs",
    Component: VakantieBevestiging,
  },
  {
    slug: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Checklist voor je reis: identiteitsbewijs en boekingsnummer, inchecken bij het eerste hotel (adres, route, parkeren), wat je nog betaalt, de persoonlijke pagina met praktische informatie en tips, inloggen op je account om je boeking te beheren, en veelgestelde vragen.",
    section: "designs",
    Component: VakantiePreTravel,
  },
  // Incheckmails: dag vóór hotel 1, 2 en 3, voor de auto- en de fietsvakantie.
  ...incheckMails.map((m) => ({ slug: m.slug, title: m.title, description: m.description, section: "designs" as const, Component: VakantieIncheckHotel, props: m.props })),
  // MVP 12-11-2026: eigen kopie van de boekingsbevestiging, los van de volledige versie uit te kleden.
  {
    slug: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging: kassabon per hotel (met alle inclusies), flexibel annuleren, prijs, boeking terugvinden, cadeaukaart en FAQ — zonder het blok Tips voor je reis.",
    section: "designs",
    Component: MvpVakantieBevestiging,
  },
  // CRM-concepten (desktop + light mode), in de volgorde van de sheet "Automations in kaart": A1 t/m A7.
  {
    slug: "crm-review",
    title: "Reviewmail (1 dag na vertrek)",
    description: "Eén doel: de review. Vijf klikbare sterren boven de vouw (elke ster een eigen link, de score staat op de landingspagina al ingevuld), daaronder het vorige verblijf compact en zonder knop. Geen deals of thema's; alleen een servicelink als vangnet voor klachten.",
    section: "crm",
    subject: "Hoe was je verblijf in Landgoed Lauswolt?",
    preheader: "We horen graag hoe je het vond. Het kost je een minuut.",
    Component: CrmReview,
  },
  {
    slug: "crm-nagenieten",
    title: "Nagenietmail (3 dagen na vertrek)",
    description: "Haalt één gegeven op: wanneer de volgende vakantie is, om latere mails te timen. Grote foto van het hotel met \"We hopen dat je genoten hebt van …\", daarna één vraag met vier gelijkwaardige knoppen. Geen deals, geen code.",
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
    preheader: "Landgoed Lauswolt, Beetsterzwaag. Nog een keer?",
    Component: CrmJaarGeleden,
  },
  {
    slug: "crm-terugkomactie",
    title: "Terugkomactie €20 (14 dagen na vertrek)",
    description: "Bovenaan staat meteen wat je krijgt (€20 cadeau als kop), daaronder de code als selecteerbare tekst en de deadline, met het vorige verblijf als korte herinnering. Daarna drie deals in de sfeer van dat verblijf (1 uitgelicht, 2 compact) en onderaan zes themaknoppen.",
    section: "crm",
    subject: "Sanne, €20 cadeau voor je volgende verblijf",
    preheader: "Een persoonlijk bedankje, alleen voor jou. Geldig tot en met 16 december 2026.",
    Component: CrmTerugkomactie,
  },
  {
    slug: "crm-terugkomactie-herinnering",
    title: "Terugkomactie herinnering (30 dagen na vertrek)",
    description: "Kaal en met één doel: de code gebruiken voor de einddatum. \"Jouw €20 cadeau\", de code met het aantal dagen dat hij nog geldig is, één knop en drie grote arrangementen onder elkaar in de sfeer van het vorige verblijf. Alleen voor wie de eerste mail nog niet heeft gebruikt.",
    section: "crm",
    subject: "Sanne, je persoonlijke €20 cadeau verloopt op 16 december",
    preheader: "Je persoonlijke cadeau ligt nog klaar. Nog 14 dagen geldig.",
    Component: CrmTerugkomactieHerinnering,
  },
  {
    slug: "crm-winkelmandje",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Eén doel: de boeking afronden. Winkelmandkaart met concrete datums, nachten, personen en prijs, een beschikbaarheidsregel en één knop terug naar de boeking. Gastenoordeel met drie Trustpilot-reviews (sterren, schaal tot 5) als die er zijn. Geen alternatieve deals.",
    section: "crm",
    subject: "Hotel Des Indes op 20 nov: nog beschikbaar",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
  },
  {
    slug: "crm-winkelmandje-beschikbaar",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Variant \"Beschikbaar\": nog geen schaarste, wel populair op de aankomstdatum.",
    section: "crm",
    subject: "Hotel Des Indes op 20 nov: nog beschikbaar",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
    props: { ...CrmWinkelmandje.PreviewProps, availability: "available" },
  },
  {
    slug: "crm-zoekopdracht",
    title: "Zoekopdracht (1 minuut na verlaten)",
    description: "De zoekopdracht staat bovenaan als herkenbare samenvatting (zoekterm, datum, personen) met \"Bekijk alle resultaten\" als primaire knop. Daaronder drie resultaten als rij-kaarten, populairste eerst. Themasectie staat uit.",
    section: "crm",
    subject: "Jouw zoekopdracht: Den Haag",
    preheader: "De beste arrangementen voor 20 november.",
    Component: CrmZoekopdracht,
  },
  {
    slug: "crm-themamail",
    title: "Themamail best deals (2 uur na bekijken)",
    description: "Herbruikbaar thema-template (wellness, diner, bubbelbad en citytrip wisselen later alleen copy en beeld): kop en intro, 1 uitgelichte deal en 2 compacte deals, daaronder zes themaknoppen. Alleen als er 2 dagen geen andere retargetingmail is gestuurd.",
    section: "crm",
    subject: "Onze beste deals van dit moment",
    preheader: "Een selectie die bij je past.",
    Component: CrmThemamail,
  },
  {
    slug: "crm-verlanglijst",
    title: "Verlanglijst €10 (3 dagen na eerste mail)",
    description: "De code (€10) hoort bij één item: het eerste favoriet, bovenaan gemarkeerd. De overige favorieten (0, 1 of 2) eronder, dan het codeblok met knop naar dat item en twee vergelijkbare arrangementen. \"Nu te boeken\" is bewust niet gebouwd.",
    section: "crm",
    subject: "€10 cadeau op Kasteel Steenenburg van je verlanglijst",
    preheader: "Jouw unieke code, geldig tot en met 12 november 2026.",
    Component: CrmVerlanglijst,
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
