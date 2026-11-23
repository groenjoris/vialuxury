import { Body, Container, Head, Html, Preview, Section } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { crmCss, CrmHelp, FeaturedDeal, Letter, PrimaryButton, type RowDeal, site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// Commerciële mail 2: Dedicated hotel. De hele mail gaat over één hotel. Hij begint als brief
// (aanhef, een korte, krachtige alinea met het aanbod vet, ondertekening), daaronder de knop
// "Bekijk aanbieding" en dan het arrangement op de verticale dealkaart (grote foto, daaronder de
// uitgebreide kaart). Zelfde bouwstenen en regels als de CRM-mails (zie components/crm.tsx).
// Onderwerp: "Ons beste hotelarrangement van de maand"

type Props = {
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Eerste zin van de brief, tot aan het aanbod. */
  lead: string;
  /** Het aanbod, vet in de brief. */
  offer: string;
  /** De rest van de alinea: waarom dit hotel. */
  pitch: string;
  deal: RowDeal;
};

export default function CommercieelDedicatedHotel({ recipientEmail, firstName, lead, offer, pitch, deal }: Props) {
  const c = newsletter.light;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Preview>2 nachten voor 2 personen op de Veluwe, inclusief diner.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader />
        <Container style={{ width: "100%", maxWidth: "626px" }}>
          {/* Brief: aanhef, het aanbod (vet) met één zin over het hotel, ondertekening */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {lead} <strong>{offer}</strong> {pitch}
            </Letter>

            {/* De knop onder het bericht, boven de kaart */}
            <Section style={{ marginTop: "24px" }}>
              <PrimaryButton href={deal.url}>Bekijk aanbieding</PrimaryButton>
            </Section>
          </Section>

          {/* Het arrangement op de verticale kaart */}
          <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
            <FeaturedDeal deal={deal} />
          </Section>

          {/* Hulplijn */}
          <CrmHelp top="36px" />
        </Container>
        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" />
      </Body>
    </Html>
  );
}

// Voorbeelddata: Veluwe Hotel Stakenberg staat niet in deals.json; dit is het vergelijkbare
// arrangement van Veluwe Hotel de Beyaerd (echte prijs, inclusies en foto, link naar de R1-dealpagina).
CommercieelDedicatedHotel.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  lead: "Dit is ons beste hotelarrangement van de maand:",
  offer: "2 nachten voor 2 personen op de Veluwe, inclusief diner, voor €319.",
  pitch: "Bij Veluwe Hotel de Beyaerd stap je vanuit je kamer zo het bos in en schuif je 's avonds aan voor een 3-gangendiner.",
  deal: {
    hotelName: "Veluwe Hotel de Beyaerd",
    stars: 4,
    place: "Hulshorst",
    packageTitle: "Een oase van rust en ontspanning midden in de Veluwse natuur",
    image: "https://asset.vialuxury.com/assets/1503e7ca-fe15-40c8-82dd-4a705dea1254?key=card",
    url: `${site}/first-release/deal/veluwe-hotel-de-beyaerd-een-oase-van-rust-en-ontspanning-midden-in-de-veluwse-natuur-incl-diner`,
    includes: ["Dagelijks ontbijt", "3-Gangendiner", "Kamerupgrade", "Buitenzwembad"],
    discount: "-29%",
    price: "€319",
    original: "€449",
    priceFor: "2 personen, 2 nachten",
  },
} satisfies Props;
