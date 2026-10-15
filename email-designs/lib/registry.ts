import type * as React from "react";
import VakantieBevestiging from "../emails/vakantie-bevestiging";
import VakantiePreTravel from "../emails/vakantie-pre-travel";
import VakantieIncheckHotel1 from "../emails/vakantie-incheck-hotel-1";

export type EmailSection = "designs" | "inspiration";

export type EmailEntry = {
  slug: string;
  title: string;
  description: string;
  section: EmailSection;
  // Elke e-mail exporteert PreviewProps met representatieve voorbeelddata
  // en accepteert een optionele `mode`-prop ("light" | "dark").
  Component: React.ComponentType<any> & { PreviewProps?: Record<string, unknown> };
};

// Alleen de e-mails van de multi-hotel vakanties; de overige ViaLuxury-mails
// staan in het losse project vialuxury-emails.
export const emails: EmailEntry[] = [
  {
    slug: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie",
    description: "Bevestiging na het boeken van een auto- of fietsvakantie met meerdere hotels: kassabon per hotel (adres, nachten, inclusies, check-in/out), flexibel annuleren, prijs, routes, boeking terugvinden, cadeaukaart en FAQ.",
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
  {
    slug: "vakantie-incheck-hotel-1",
    title: "Incheck hotel 1 (dag voor aankomst)",
    description: "De dag vóór aankomst: morgen is het zover. Zonder hoofdfoto; de gegevens van je eerste hotel (adres, route, telefoon, inchecken, parkeren, opladen, wat je nog betaalt), de persoonlijke pagina met praktische informatie en tips, en veelgestelde vragen.",
    section: "designs",
    Component: VakantieIncheckHotel1,
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
