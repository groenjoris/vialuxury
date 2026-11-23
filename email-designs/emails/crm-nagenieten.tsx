import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import { BeigeBand, crmCss, CrmHelp, Letter, PillGrid, s, site } from "../components/crm";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { baseUrl, font, newsletter } from "../components/theme";

// CRM mail 1: nagenietmail, 3 dagen na vertrek (vervangt A2 3 dagen).
// Eén doel: ophalen wanneer de volgende vakantie is, om latere mails te timen.
// Grote hotelfoto met "We hopen dat je genoten hebt van …", daarna de vraag met zes witte
// snelfilterknoppen op een beige vlak (zelfde stijl als de themakiezer): vijf tijdvakken en
// "Weet ik nog niet". Geen deals, geen code. Gelijkwaardige knoppen; elke knop gaat naar een
// bevestigingspagina met de keuze als parameter.
// Twee varianten (schakelaar in de preview): "Bericht" (standaard: een brief met aanhef en
// ondertekening, en in het blok alleen de vraag) en "Titel" (crm-nagenieten-titel: grote titel
// onder de foto).
// Onderwerp: "Wanneer ga je weer?"

type Props = {
  /** "bericht" (standaard): een brief met aanhef en ondertekening, en in het blok alleen de vraag
   *  als titel. "titel": grote titel onder de foto. */
  opening?: "titel" | "bericht";
  /** Leeg → kop zonder naam. */
  firstName?: string;
  recipientEmail: string;
  hotelName: string;
  image: string;
};

export default function CrmNagenieten({ firstName, recipientEmail, hotelName, image, opening = "bericht" }: Props) {
  const message = opening === "bericht";
  const c = newsletter.light;
  // Zes tijdvakken vanaf nu, in tijdsvolgorde: ze sluiten op elkaar aan (geen overlap, geen gat)
  // en kloppen in elk seizoen waarin de mail verstuurd wordt. "Weet ik nog niet" staat als laatste.
  // Elk antwoord gaat naar de bevestigingspagina met de keuze als parameter.
  const choices = [
    { key: "binnen-1-maand", label: "Binnen een maand" },
    { key: "1-3-maanden", label: "Over 1 tot 3 maanden" },
    { key: "3-6-maanden", label: "Over 3 tot 6 maanden" },
    { key: "6-12-maanden", label: "Over 6 tot 12 maanden" },
    { key: "over-een-jaar", label: "Over een jaar of later" },
    { key: "weet-ik-nog-niet", label: "Weet ik nog niet" },
  ].map((ch) => ({ label: ch.label, href: `${site}/crm/volgende-vakantie?keuze=${ch.key}` }));

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>Eén klik, dan sturen we je op het juiste moment inspiratie.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Grote foto van het hotel met het nagenietframe; geen datums of arrangement, dat weet de gast al */}
          <Img src={image} alt={hotelName} width="626" height="352" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "16 / 9", objectFit: "cover" }} />
          <Section className="m-pad" style={{ padding: "28px 32px 0" }}>
            {message ? (
              // Variant "Bericht": geen grote titel maar een brief met aanhef en ondertekening
              <Letter firstName={firstName}>
                We hopen dat je genoten hebt van {hotelName}. Laat weten wanneer je weer gaat, dan sturen we je op het juiste moment inspiratie.
              </Letter>
            ) : (
              <Heading as="h1" className="m-h1" style={s.h1}>
                {firstName ? `${firstName}, we hopen dat je genoten hebt van ${hotelName}` : `We hopen dat je genoten hebt van ${hotelName}`}
              </Heading>
            )}
          </Section>

        </Container>

        {/* De vraag op een beige band over de hele breedte: zelfde opbouw en knoppen als de themakiezer */}
        <BeigeBand top="36px">
          {/* In de variant "Bericht" alleen de vraag als titel: de brief erboven leidt hem al in */}
          {!message && <Text style={{ ...s.muted, margin: 0 }}>Om je nog beter te kunnen helpen, één vraag</Text>}
          <Text style={{ ...s.kop, margin: message ? 0 : "2px 0 0" }}>Wanneer is je volgende vakantie?</Text>
          <PillGrid items={choices} />
        </BeigeBand>

        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je bij ons boekte" />
      </Body>
    </Html>
  );
}

CrmNagenieten.PreviewProps = {
  firstName: "Sanne",
  recipientEmail: "sanne.devries@example.com",
  hotelName: "Hotel Ter Zand",
  image: `${baseUrl}/images/hotel-ter-zand-tower.jpg`,
} satisfies Props;

/** Variant "Titel": grote titel onder de foto in plaats van de brief. */
export const titelProps = { ...CrmNagenieten.PreviewProps, opening: "titel" as const };
