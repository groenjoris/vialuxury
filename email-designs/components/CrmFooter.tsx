import { Column, Container, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";
import { GuestQuote } from "./crm";

// Footer van de CRM- en vakantiemails. Staat buiten de 626px-container van de mail: het zwarte
// vlak loopt over de hele breedte, de inhoud blijft 626px breed. Links logo, "Volg ons op" en
// onderaan de afzenderreden; rechts "Hulp nodig?", de kleine lettertjes en de opt-out. Bij een
// boekingsgerelateerde mail (`transactional`, de post-bookingflow) vervalt de nieuwsbrief-opt-out
// rechts (zin + Wijzig e-mailvoorkeuren | Uitschrijven | Webversie) en staat daar de zin "Je
// ontvangt deze e-mail omdat je een account of boeking hebt bij ViaLuxury." (zoals in de
// transactionele mails van het CRM-project); de afzenderzin linksonder ("Je ontvangt deze e-mail op
// … omdat je bij ons boekte") vervalt dan, want die zou dubbelop zijn. De CRM-mails houden beide.
// Op mobiel (klassen stack/m-center uit de responsiveCss van de vakantiemails) staan de kolommen
// onder elkaar.

// Concept (alleen in de voorbeeldmail "Dit moeten we vaker doen", props `help` en `quote`): het blok
// "Hulp nodig?" uit de mail en de klantenservice-informatie in de footer zijn samengevoegd tot een
// lichtoranje band over de hele breedte, direct boven de zwarte footer. Drie varianten:
//   0  bellen en WhatsApp onder elkaar, elk op een eigen regel
//   1  bellen en WhatsApp op één regel
//   2  de band van 1; de gastquote staat niet op een eigen rij maar bovenaan de rechterkolom (alleen
//      de quote, zonder afzender) en "Volg ons op" staat links onder het logo
//      (2 en 3: lagere hulpband, en de footer is één rij: logo, "Volg ons op" en de afzenderreden
//      links, de quote en de kleine lettertjes rechts, onderaan uitgelijnd, om hoogte te sparen)
//   3  als 2, maar de quote is een geanimeerde gif: in 1 seconde van links naar rechts geschreven,
//      3 seconden rust, en opnieuw (scripts/mail-graphics/guest-quote-gif.py)
// Met `help` vervalt de gewone kolom "Hulp nodig?" rechtsboven; in 0 en 1 schuift "Volg ons op"
// daarheen en staat de gastquote als bovenste deel van de footer (wit op zwart, lijn eronder).
export type FooterHelp = 0 | 1 | 2 | 3;

const TEL = { href: "tel:+31207052222", label: "+31 20 705 2222" };
const WA = { href: "https://wa.me/31208088809", label: "+31 20 808 8809" };
const HOURS = "ma t/m vr 8:00 – 18:00";
const WARM = "#FFF0E4";

type Props = {
  /** Gastquote “Dit moeten we vaker doen!” in de footer (plek volgt uit `help`, zie boven). */
  quote?: boolean;
  /** Hulpblok als band boven de footer, variant 0 t/m 3 (zie boven). Leeg → de gewone footer. */
  help?: FooterHelp;
  /** Actiemails met een code: de geldigheid van de code en een link naar de actievoorwaarden,
   *  bovenaan de kleine lettertjes. */
  terms?: { text: string; url: string };
  recipientEmail: string;
  /** Afzenderreden die bij de trigger past, bijv. "omdat je bij ons boekte". */
  reason: string;
  /** Boekingsgerelateerde mail: geen nieuwsbrief-opt-out, wel de account-/boekingszin. */
  transactional?: boolean;
  mode?: EmailMode;
};

export default function CrmFooter({ recipientEmail, reason, transactional = false, mode = "light", help, quote, terms }: Props) {
  const hasHelp = help !== undefined;
  /** Variant 2 en 3: lagere hulpband en een footer van één rij, waarin de kolommen in elkaar schuiven. */
  const compact = help === 2 || help === 3;
  const c = newsletter[mode];
  const text = { fontFamily: font.body, color: "#FFFFFF", fontSize: "12px", lineHeight: "16px", margin: "0 0 8px" };
  const bold = { ...text, fontWeight: 700 };
  const link = { color: "#FFFFFF", textDecoration: "underline" };
  const icon = { display: "inline", verticalAlign: "middle", marginRight: "10px" } as const;

  // Bouwstenen van de hulpvarianten
  const serif = { fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.3", margin: 0 };
  const body16 = { fontFamily: font.body, fontSize: "16px", lineHeight: "1.45", margin: 0 };
  const orangeLink = { color: c.link, textDecoration: "underline", fontWeight: 700 };
  /** Wit rondje met het oranje telefoonicoon (tabelcel, zodat het in elke mailclient centreert). */
  const phoneCircle = (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ width: "44px", height: "44px", borderCollapse: "separate" }}>
      <tbody>
        <tr>
          <td style={{ width: "44px", height: "44px", padding: 0, borderRadius: "22px", backgroundColor: "#FFFFFF", textAlign: "center", verticalAlign: "middle" }}>
            <Img src={`${baseUrl}/images/mail/icon-phone-orange.png`} alt="" width="22" height="22" style={{ display: "block", margin: "0 auto" }} />
          </td>
        </tr>
      </tbody>
    </table>
  );
  /** Titel met daaronder "Bel … of WhatsApp …" en de openingstijden, op een lichte ondergrond. */
  const helpLines = (
    <>
      <Text style={{ ...serif, color: c.heading }}>Hulp nodig?</Text>
      {help === 0 ? (
        // Variant 0: bellen en WhatsApp onder elkaar
        <>
          <Text style={{ ...body16, color: c.text, marginTop: "2px" }}>
            Bel <Link href={TEL.href} style={orangeLink}>{TEL.label}</Link>
          </Text>
          <Text style={{ ...body16, color: c.text, marginTop: "2px" }}>
            WhatsApp <Link href={WA.href} style={orangeLink}>{WA.label}</Link>
          </Text>
        </>
      ) : (
        <Text style={{ ...body16, color: c.text, marginTop: "2px" }}>
          Bel <Link href={TEL.href} style={orangeLink}>{TEL.label}</Link> of WhatsApp <Link href={WA.href} style={orangeLink}>{WA.label}</Link>
        </Text>
      )}
      <Text style={{ ...body16, color: c.muted, marginTop: "2px" }}>Bereikbaar {HOURS}</Text>
    </>
  );
  const social = (
    <>
      <Text className="m-center" style={{ ...bold, margin: hasHelp ? "0 0 10px" : "22px 0 10px" }}>Volg ons op</Text>
      <Link href="https://www.instagram.com/vialuxury">
        <Img src={`${baseUrl}/images/mail/icon-instagram.png`} alt="Instagram" width="19" height="19" style={{ display: "inline", marginRight: "10px" }} />
      </Link>
      <Link href="https://www.facebook.com/vialuxury">
        <Img src={`${baseUrl}/images/mail/icon-facebook.png`} alt="Facebook" width="19" height="19" style={{ display: "inline" }} />
      </Link>
    </>
  );
  /** Afzenderreden (links onderaan) en de kleine lettertjes met de opt-out (rechts onderaan). */
  const reasonLine = (
    <>
              {!transactional && (
                <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                  Je ontvangt deze e-mail op <strong>{recipientEmail}</strong> {reason}.
                </Text>
              )}
    </>
  );
  const smallPrint = (
    <>
              {terms && (
                <Text className="m-center m-small" style={text}>
                  {terms.text}
                  <br />
                  <Link href={terms.url} style={link}>Bekijk de actievoorwaarden</Link>
                </Text>
              )}
              <Text className="m-center m-small" style={text}>Prijswijzigingen en/of zetfouten voorbehouden.</Text>
              <Text className="m-center m-small" style={text}>Copyright © ViaLuxury, All Rights Reserved</Text>
              {transactional ? (
                <Text className="m-center m-small" style={{ ...text, margin: 0 }}>Je ontvangt deze e-mail omdat je een account of boeking hebt bij ViaLuxury.</Text>
              ) : (
                <>
                  <Text className="m-center m-small" style={text}>Liever geen updates meer? Ontvang onze nieuwsbrief minder vaak, of helemaal niet meer.</Text>
                  <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                    <Link href="https://vialuxury.nl" style={link}>Wijzig e-mailvoorkeuren</Link> |{" "}
                    <Link href="https://vialuxury.nl" style={link}>Uitschrijven</Link> |{" "}
                    <Link href="https://vialuxury.nl" style={link}>Webversie</Link>
                  </Text>
                </>
              )}
    </>
  );
  /** Band over de hele breedte boven de zwarte footer. */
  const band = (bg: string, children: React.ReactNode, padding = "26px 32px 28px") => (
    <Section style={{ backgroundColor: bg, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding }}>{children}</Section>
      </Container>
    </Section>
  );

  return (
    <>
    {/* Hulpblok: lichtoranje band over de hele breedte, direct boven de footer */}
    {hasHelp &&
      band(WARM, (
        <Row>
          <Column style={{ width: "62px", verticalAlign: "middle" }}>{phoneCircle}</Column>
          <Column style={{ verticalAlign: "middle" }}>{helpLines}</Column>
        </Row>
      ), compact ? "14px 32px 16px" : undefined)}
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding: compact ? "24px 32px" : "32px" }}>
          {/* Gastquote als bovenste deel van de footer: wit op zwart, lijn eronder (niet in variant 2 en 3) */}
          {quote && !compact && (
            <Section style={{ marginBottom: "30px", paddingBottom: "28px", borderBottom: "1px solid #3A3A3A" }}>
              <GuestQuote tone="wit" />
            </Section>
          )}
          <Row>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: compact ? "bottom" : "top", paddingRight: compact ? "24px" : undefined }}>
              <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-mx-auto" style={{ height: "auto" }} />
              {!hasHelp ? social : null}
              {/* Variant 2 en 3: "Volg ons op" en de afzenderreden direct onder het logo, in dezelfde rij als de quote en de kleine lettertjes */}
              {compact && (
                <>
                  <Section style={{ marginTop: "16px" }}>{social}</Section>
                  <Section style={{ marginTop: "32px" }}>{reasonLine}</Section>
                </>
              )}
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: compact ? "bottom" : "top" }}>
              {!hasHelp && (
                <>
                  <Text className="m-center" style={bold}>Hulp nodig?</Text>
                  <Text className="m-center" style={text}>
                    <Img src={`${baseUrl}/images/mail/icon-phone.png`} alt="" width="18" height="18" style={icon} />
                    +31 20 705 2222
                  </Text>
                  <Text className="m-center" style={text}>
                    <Img src={`${baseUrl}/images/mail/icon-whatsapp.png`} alt="" width="18" height="18" style={icon} />
                    +31 20 808 8809
                  </Text>
                  <Text className="m-center" style={text}>Ma t/m Vr: 8:00 — 18:00</Text>
                </>
              )}
              {/* Variant 2 en 3 (3: geanimeerd): alleen de quote bovenaan de rechterkolom, passend in de kolom */}
              {compact && quote && <GuestQuote tone="wit" bare width={250} animated={help === 3} />}
              {compact && <Section style={{ marginTop: "32px" }}>{smallPrint}</Section>}
              {help === 0 || help === 1 ? social : null}
            </Column>
          </Row>
          {!compact && (
          <Row style={{ marginTop: "28px" }}>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: "bottom", paddingRight: "24px" }}>
              {reasonLine}
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "bottom" }}>
              {smallPrint}
            </Column>
          </Row>
          )}
        </Section>
      </Container>
    </Section>
    </>
  );
}
