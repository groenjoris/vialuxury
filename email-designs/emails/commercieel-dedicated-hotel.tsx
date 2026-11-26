import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import * as React from "react";
import CrmFooter from "../components/CrmFooter";
import CrmHeader from "../components/CrmHeader";
import { BeigeBand, CampaignOpening, commercieelCss, crmCss, FeaturedDeal, Letter, TextLink, type OpeningVariant, type Pill, PillGrid, type RowDeal, s, site } from "../components/crm";
import { font, newsletter } from "../components/theme";

// Commerciële mail 2: Dedicated hotel. De hele mail gaat over één hotel. Hij opent met het headerbeeld
// van het hotel met daarin kort wat de actie is ("2 nachten op de Veluwe voor €319") en een knop:
// daar wordt de eerste interesse gewekt, boven de vouw, en daar wordt vaak op geklikt. Drie varianten
// van die opening, dezelfde als de Content-mail (`CampaignOpening`: Native, Header-titel,
// Titel op foto; die laatste met een ronde sticker met de korting). Daarna de brief (aanhef, een korte,
// krachtige alinea met het aanbod vet), de tekstlink "Boek deze hoteldeal" en het arrangement op de
// verticale dealkaart met ALLE inclusies (dat kunnen er acht tot tien zijn). Onder de kaart een beige
// band met knoppen naar het andere aanbod van dit hotel (1 nacht, 3 nachten). Geen "Snel zoeken".
// Onderwerp: "Ons beste hotelarrangement van de maand"

type Props = {
  /** Opzet van de opening (schakelaar in de preview). */
  variant?: OpeningVariant;
  /** Mobiele versie: kortere knop in de prijsrij van de kaart, anders past de rij niet. */
  mobile?: boolean;
  recipientEmail: string;
  /** Leeg → "Beste gast,". */
  firstName?: string;
  /** Headerbeeld van het hotel. */
  hero: string;
  heroAlt: string;
  /** De actie in het kort, in de opening. */
  title: string;
  /** Eerste zin van de brief, tot aan het aanbod. */
  lead: string;
  /** Het aanbod, vet in de brief. */
  offer: string;
  /** De rest van de alinea: waarom dit hotel. */
  pitch: string;
  deal: RowDeal;
  /** Het andere aanbod van dit hotel, als knoppen onder de kaart. */
  others: Pill[];
};

export default function CommercieelDedicatedHotel({ variant = "native", mobile, recipientEmail, firstName, hero, heroAlt, title, lead, offer, pitch, deal, others }: Props) {
  const c = newsletter.light;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss + commercieelCss}</style>
      </Head>
      <Preview>2 nachten voor 2 personen op de Veluwe, inclusief diner.</Preview>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: 0, fontFamily: font.body }}>
        <CrmHeader pad={32} title={variant === "header-titel" ? title : undefined} />
        {/* Opening over de hele breedte van de mail, buiten de <Container> */}
        <CampaignOpening variant={variant} hero={hero} heroAlt={heroAlt} title={title} cta="Bekijk aanbieding" href={deal.url} sticker={deal.discount ? { big: deal.discount, small: "korting" } : undefined} />
        <Container style={{ width: "100%", maxWidth: "626px" }}>

          {/* Brief: aanhef, het aanbod (vet) met één zin over het hotel */}
          <Section className="m-pad" style={{ padding: "32px 32px 0" }}>
            <Letter firstName={firstName}>
              {lead} <strong>{offer}</strong> {pitch}
            </Letter>

            {/* Onder het bericht een tekstlink, geen tweede knop (de knop staat al in de opening en in de kaart) */}
            <Section style={{ marginTop: "6px" }}>
              <TextLink href={deal.url}>Boek deze hoteldeal</TextLink>
            </Section>
          </Section>

          {/* Het arrangement op de verticale kaart, met alle inclusies */}
          <Section className="m-pad" style={{ padding: "20px 32px 0" }}>
            <FeaturedDeal allIncludes deal={deal} cta={mobile ? "Bekijk" : "Bekijk aanbieding"} />
          </Section>
        </Container>

        {/* Het andere aanbod van dit hotel: witte knoppen op een beige band over de hele breedte */}
        <BeigeBand top="40px">
          <Text style={s.kop}>Meer van {deal.hotelName}</Text>
          <Text style={{ ...s.body, margin: "2px 0 0" }}>Liever korter of juist langer weg?</Text>
          <PillGrid items={others} />
        </BeigeBand>

        <CrmFooter recipientEmail={recipientEmail} reason="omdat je je hebt aangemeld voor onze nieuwsbrief" help={2} quote />
      </Body>
    </Html>
  );
}

const asset = (id: string) => `https://asset.vialuxury.com/assets/${id}?key=card`;
const dealUrl = (permalink: string) => `${site}/first-release/deal/${permalink}`;

// Voorbeelddata: Veluwe Hotel Stakenberg staat niet in deals.json; dit zijn de arrangementen van het
// vergelijkbare Veluwe Hotel de Beyaerd (echte prijzen, inclusies en foto's, links naar de R1-dealpagina).
CommercieelDedicatedHotel.PreviewProps = {
  recipientEmail: "sanne.devries@example.com",
  firstName: "Sanne",
  hero: asset("fb2d11b7-1881-40cb-98f4-28a384b8c3f6"),
  heroAlt: "Veluwe Hotel de Beyaerd",
  title: "2 nachten op de Veluwe voor €319",
  lead: "Dit is ons beste hotelarrangement van de maand:",
  offer: "2 nachten voor 2 personen op de Veluwe, inclusief diner, voor €319.",
  pitch: "Bij Veluwe Hotel de Beyaerd stap je vanuit je kamer zo het bos in en schuif je 's avonds aan voor een 3-gangendiner.",
  deal: {
    hotelName: "Veluwe Hotel de Beyaerd",
    stars: 4,
    place: "Hulshorst",
    packageTitle: "Een oase van rust en ontspanning midden in de Veluwse natuur",
    image: asset("1503e7ca-fe15-40c8-82dd-4a705dea1254"),
    url: dealUrl("veluwe-hotel-de-beyaerd-een-oase-van-rust-en-ontspanning-midden-in-de-veluwse-natuur-incl-diner"),
    includes: ["2 x Overnachting", "Kamerupgrade naar Relax Room (o.b.v.b.)", "Dagelijks ontbijt", "3-Gangendiner (aankomstdag)", "Gebruik buitenzwembad (seizoensgebonden)", "Early check-in vanaf 12:00 uur (o.b.v.b.)", "Late check-out tot 14:00 (o.b.v.b.)"],
    discount: "-29%",
    price: "€319",
    original: "€449",
    priceFor: "2 personen, 2 nachten",
  },
  others: [
    { label: "1 nacht met wellness, vanaf €194", href: dealUrl("veluwe-hotel-de-beyaerd-kom-tot-rust-op-de-veluwe-incl-dag-wellness-bij-de-zwaluwhoeve") },
    { label: "3 nachten met diner, vanaf €444", href: dealUrl("veluwe-hotel-de-beyaerd-4-daags-verblijf-in-een-natuurparadijs-op-de-veluwe-incl-diner") },
  ],
} satisfies Props;
