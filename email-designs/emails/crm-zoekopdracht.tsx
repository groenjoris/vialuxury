import { Body, Column, Container, Head, Heading, Html, Img, Link, Preview, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, DealLabel, Icon, PrimaryButton, s, SecondaryButton, site, CrmHeader } from "../components/crm";
import NewsletterFooter from "../components/NewsletterFooter";
import { font, newsletter } from "../components/theme";
import { steenenburg, vanOys, winselerhof, type CrmDeal } from "../lib/crmDeals";

// CRM A5 Zoekopdracht (retargeting_abandonedsearch_1). Trigger: 1 minuut na het verlaten van de
// site (de sheet zegt "na het zoeken"; hier bewust na het verlaten, zodat de mail de bezoeker
// niet midden in de sessie raakt).
// De zoekopdracht (S18) staat bovenaan als herkenbare samenvatting: zoekterm, datum en personen
// met icoontjes, en "Bekijk alle resultaten" als primaire knop. Daaronder drie resultaten als
// rij-kaarten (foto links, tekst rechts), anders dan de verticale kaarten in de andere mails.
// Themasectie (S7) staat uit.
// Onderwerp: "Jouw zoekopdracht: [zoekterm]"
//
// Terugvallen (tab Mergevelden):
//   [zoekterm]       leeg → "jouw zoekopdracht" (onderwerp, samenvatting en kop)
//   [aankomstdatum]  leeg → datumregel valt weg, ook in de preheader ("De beste arrangementen voor je zoekopdracht.")
//   [personen]       leeg → personenregel valt weg

type Props = {
  recipientEmail: string;
  searchTerm?: string;
  /** "20 november" */
  arrivalDate?: string;
  persons?: number;
  resultsUrl: string;
  results: CrmDeal[];
};

export default function CrmZoekopdracht({ recipientEmail, searchTerm, arrivalDate, persons, resultsUrl, results }: Props) {
  const c = newsletter.light;
  const term = searchTerm ?? "jouw zoekopdracht";
  const preheader = arrivalDate ? `De beste arrangementen voor ${arrivalDate}.` : "De beste arrangementen voor jouw zoekopdracht.";
  const rows = [
    { icon: "magnifier-donker", text: term, strong: true },
    arrivalDate ? { icon: "calendar-donker", text: arrivalDate, strong: false } : null,
    persons ? { icon: "users-donker", text: `${persons} personen`, strong: false } : null,
  ].filter(Boolean) as { icon: string; text: string; strong: boolean }[];

  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>{preheader}</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          <CrmHeader />

          <Section className="m-pad" style={{ padding: "36px 32px 0" }}>
            <Heading as="h1" className="m-h1" style={s.h1}>Dit vonden we voor je</Heading>
          </Section>

          {/* S18: zoekopdracht als samenvatting */}
          <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
            <Section style={{ backgroundColor: "#F5F5F5", borderRadius: "8px", padding: "20px 20px 22px" }}>
              <Text style={{ ...s.muted, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Jouw zoekopdracht</Text>
              {rows.map((r) => (
                <Text key={r.text} style={{ fontFamily: r.strong ? font.heading : font.body, fontWeight: r.strong ? 600 : 400, fontSize: r.strong ? "22px" : "16px", color: c.text, margin: r.strong ? "8px 0 0" : "6px 0 0" }}>
                  <Icon name={r.icon} size={r.strong ? 22 : 18} /> <span style={{ marginLeft: "6px" }}>{r.text}</span>
                </Text>
              ))}
              <Section style={{ marginTop: "20px" }}>
                <PrimaryButton href={resultsUrl}>Bekijk alle resultaten</PrimaryButton>
              </Section>
            </Section>
          </Section>

          {/* Drie resultaten als rij-kaarten, populairste eerst */}
          <Section className="m-pad" style={{ padding: "36px 32px 44px" }}>
            <Text style={{ ...s.title, margin: "0 0 4px", color: c.muted }}>De arrangementen die het best passen bij wat je zoekt</Text>
            {results.map((d, i) => (
              <Section key={d.url} style={{ marginTop: "20px", borderTop: i ? `1px solid ${c.border}` : "none", paddingTop: i ? "20px" : 0 }}>
                <Row>
                  <Column className="stack" style={{ width: "200px", verticalAlign: "top" }}>
                    <Link href={d.url}>
                      <Img src={d.image} alt={d.packageTitle} width="200" height="130" style={{ display: "block", width: "100%", height: "130px", objectFit: "cover", borderRadius: "6px" }} />
                    </Link>
                  </Column>
                  <Column className="stack" style={{ verticalAlign: "top", paddingLeft: "18px" }}>
                    {d.label && <DealLabel>{d.label}</DealLabel>}
                    <Text style={{ ...s.name, fontFamily: font.heading, fontWeight: 600, fontSize: "18px", margin: d.label ? "8px 0 0" : 0 }}>{d.hotelName}</Text>
                    {d.place && (
                      <Text style={{ ...s.muted, margin: "2px 0 0" }}><Icon name="map-pin-donker" size={14} /> {d.place}</Text>
                    )}
                    <Text style={{ ...s.title, fontSize: "13px", margin: "6px 0 0" }}>{d.packageTitle}</Text>
                    <Text style={{ ...s.title, margin: "8px 0 10px" }}>
                      <span style={{ color: c.muted }}>vanaf </span><strong>{d.fromPrice}</strong><span style={{ color: c.muted }}> p.p.</span>
                    </Text>
                    <SecondaryButton href={d.url}>Bekijk arrangement</SecondaryButton>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>

          <NewsletterFooter recipientEmail={recipientEmail} reason="omdat je een account hebt bij ViaLuxury" />
        </Container>
      </Body>
    </Html>
  );
}

CrmZoekopdracht.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  searchTerm: "Zuid-Limburg",
  arrivalDate: "20 november",
  persons: 2,
  resultsUrl: `${site}/first-release/search?utm_source=email&utm_medium=crm&utm_campaign=retargeting_abandonedsearch_1`,
  results: [{ ...winselerhof, label: "Populair" }, vanOys, { ...steenenburg, label: undefined }],
} satisfies Props;
