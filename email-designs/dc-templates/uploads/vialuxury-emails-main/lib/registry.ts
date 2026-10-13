import type * as React from "react";
import BookingConfirmation from "@/emails/booking-confirmation";
import DealAlert from "@/emails/deal-alert";
import WelkomMail1A from "@/emails/welkom-mail-1a";

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

export const emails: EmailEntry[] = [
  {
    slug: "welkom-mail-1a",
    title: "Welkom (Mail 1A)",
    description: "Welkomstmail na eerste boeking: account, FAQ, deal-opt-in en thema-inspiratie. Naar Figma-ontwerp 'Nieuwsbrief'.",
    section: "designs",
    Component: WelkomMail1A,
  },
  {
    slug: "booking-confirmation",
    title: "Boekingsbevestiging",
    description: "Transactionele bevestiging na een geslaagde boeking, met reisdetails en totaalprijs.",
    section: "inspiration",
    Component: BookingConfirmation,
  },
  {
    slug: "deal-alert",
    title: "Deal van de week",
    description: "Commerciële nieuwsbrief rond één deal: hero-foto, USP's, oude vs. nieuwe prijs en CTA.",
    section: "inspiration",
    Component: DealAlert,
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
