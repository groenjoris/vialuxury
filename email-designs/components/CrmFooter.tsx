import { Button, Column, Container, Img, Link, Row, Section, Text } from "@react-email/components";
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

// Concept (alleen in de voorbeeldmail "Dit moeten we vaker doen", prop `help`): het blok "Hulp
// nodig?" uit de mail en de klantenservice-informatie in de footer zijn samengevoegd. De footer
// blijft de footer, maar de klantenservice springt eruit. Zes varianten:
//   0  als 1, maar bellen en WhatsApp staan onder elkaar, elk op een eigen regel
//   1  lichtoranje band over de hele breedte, direct boven de zwarte footer
//   2  lichtoranje kaart bovenin de zwarte footer (het hulpblok zoals het in de mail stond)
//   3  in het zwart: titel en twee grote knoppen (bellen oranje, WhatsApp omlijnd)
//   4  de rechterkolom van de footer als lichtoranje kaart met grote nummers
//   5  beige band over de hele breedte met twee witte snelfilterknoppen (zoals Snel zoeken)
// Met `help` vervalt de gewone kolom "Hulp nodig?" rechtsboven; "Volg ons op" schuift daarheen
// (behalve in variant 4, waar de kaart op die plek staat).
export type FooterHelp = 0 | 1 | 2 | 3 | 4 | 5;

const TEL = { href: "tel:+31207052222", label: "+31 20 705 2222" };
const WA = { href: "https://wa.me/31208088809", label: "+31 20 808 8809" };
const HOURS = "ma t/m vr 8:00 – 18:00";
const WARM = "#FFF0E4";
const BEIGE = "#F4F1EC";

/** Plek van de gastquote “Dit moeten we vaker doen!” bij de footer: "boven" = beige band over de hele
 *  breedte direct boven de footer (en boven een eventuele hulpband), met de quote in een witte
 *  tekstballon; "in" = het bovenste deel van de zwarte footer, wit op zwart met een lijn eronder. */
export type FooterQuote = "boven" | "in";

type Props = {
  quote?: FooterQuote;
  /** Hulpblok in de footer opgenomen, variant 0 t/m 5 (zie boven). Leeg → de gewone footer. */
  help?: FooterHelp;
  recipientEmail: string;
  /** Afzenderreden die bij de trigger past, bijv. "omdat je bij ons boekte". */
  reason: string;
  /** Boekingsgerelateerde mail: geen nieuwsbrief-opt-out, wel de account-/boekingszin. */
  transactional?: boolean;
  mode?: EmailMode;
};

export default function CrmFooter({ recipientEmail, reason, transactional = false, mode = "light", help, quote }: Props) {
  const hasHelp = help !== undefined;
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
  /** Band over de hele breedte boven de zwarte footer (varianten 1 en 5). */
  const band = (bg: string, children: React.ReactNode) => (
    <Section style={{ backgroundColor: bg, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding: "26px 32px 28px" }}>{children}</Section>
      </Container>
    </Section>
  );

  return (
    <>
    {/* Gastquote boven de footer: beige band met de quote in een witte tekstballon */}
    {quote === "boven" && band(BEIGE, <GuestQuote balloon />)}
    {/* Variant 0 en 1: lichtoranje band over de hele breedte, direct boven de footer */}
    {(help === 0 || help === 1) &&
      band(WARM, (
        <Row>
          <Column style={{ width: "62px", verticalAlign: "middle" }}>{phoneCircle}</Column>
          <Column style={{ verticalAlign: "middle" }}>{helpLines}</Column>
        </Row>
      ))}
    {/* Variant 5: beige band met twee witte snelfilterknoppen */}
    {help === 5 &&
      band(BEIGE, (
        <>
          <Text style={{ ...serif, color: c.heading }}>Hulp nodig?</Text>
          <Text style={{ ...body16, color: c.text, marginTop: "2px" }}>We zitten voor je klaar, {HOURS}.</Text>
          <Row style={{ marginTop: "14px" }}>
            {[{ ...TEL, verb: "Bel" }, { ...WA, verb: "WhatsApp" }].map((k, i) => (
              <Column key={k.href} className="stack" style={{ width: "50%", verticalAlign: "top", paddingLeft: i ? "4px" : 0, paddingRight: i ? 0 : "4px" }}>
                <Link href={k.href} style={{ display: "block", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "4px", padding: "13px 16px", fontFamily: font.body, fontSize: "16px", lineHeight: "20px", color: c.text, textDecoration: "none" }}>
                  {k.verb} <strong>{k.label}</strong>
                </Link>
              </Column>
            ))}
          </Row>
        </>
      ))}
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding: "32px" }}>
          {/* Gastquote als bovenste deel van de footer: wit op zwart, lijn eronder */}
          {quote === "in" && (
            <Section style={{ marginBottom: "30px", paddingBottom: "28px", borderBottom: "1px solid #3A3A3A" }}>
              <GuestQuote tone="wit" />
            </Section>
          )}
          {/* Variant 2: het hulpblok als lichtoranje kaart bovenin de zwarte footer */}
          {help === 2 && (
            <Section style={{ backgroundColor: WARM, borderRadius: "8px", padding: "16px 18px", marginBottom: "30px" }}>
              <Row>
                <Column style={{ width: "62px", verticalAlign: "middle" }}>{phoneCircle}</Column>
                <Column style={{ verticalAlign: "middle" }}>{helpLines}</Column>
              </Row>
            </Section>
          )}
          {/* Variant 3: in het zwart, titel en twee grote knoppen */}
          {help === 3 && (
            <Section style={{ marginBottom: "30px", paddingBottom: "30px", borderBottom: "1px solid #3A3A3A" }}>
              <Text style={{ ...serif, color: "#FFFFFF" }}>Hulp nodig?</Text>
              <Text style={{ ...body16, color: "#FFFFFF", marginTop: "2px" }}>We zitten voor je klaar, {HOURS}.</Text>
              <Row style={{ marginTop: "16px" }}>
                <Column className="stack" style={{ width: "50%", verticalAlign: "top", paddingRight: "6px" }}>
                  <Button href={TEL.href} style={{ display: "block", backgroundColor: c.cta, color: "#FFFFFF", fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "20px", borderRadius: "6px", padding: "13px 16px", textAlign: "center", textDecoration: "none" }}>
                    <Img src={`${baseUrl}/images/mail/icon-phone.png`} alt="" width="18" height="18" style={{ display: "inline", verticalAlign: "-3px", marginRight: "8px" }} />
                    Bel {TEL.label}
                  </Button>
                </Column>
                <Column className="stack" style={{ width: "50%", verticalAlign: "top", paddingLeft: "6px" }}>
                  <Button href={WA.href} style={{ display: "block", backgroundColor: c.frame, color: "#FFFFFF", fontFamily: font.body, fontSize: "16px", fontWeight: 700, lineHeight: "20px", border: "1px solid #FFFFFF", borderRadius: "6px", padding: "12px 16px", textAlign: "center", textDecoration: "none" }}>
                    <Img src={`${baseUrl}/images/mail/icon-whatsapp.png`} alt="" width="18" height="18" style={{ display: "inline", verticalAlign: "-3px", marginRight: "8px" }} />
                    WhatsApp {WA.label}
                  </Button>
                </Column>
              </Row>
            </Section>
          )}
          <Row>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: "top" }}>
              <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-mx-auto" style={{ height: "auto" }} />
              {!hasHelp ? social : help === 4 ? <Section style={{ marginTop: "22px" }}>{social}</Section> : null}
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "top" }}>
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
              {/* Variant 4: de kolom als lichtoranje kaart met grote nummers */}
              {help === 4 && (
                <Section style={{ backgroundColor: WARM, borderRadius: "8px", padding: "16px 18px 18px" }}>
                  <Text style={{ ...serif, color: c.heading }}>Hulp nodig?</Text>
                  <Text style={{ ...body16, color: c.text, marginTop: "8px" }}>
                    Bel <Link href={TEL.href} style={orangeLink}>{TEL.label}</Link>
                  </Text>
                  <Text style={{ ...body16, color: c.text, marginTop: "4px" }}>
                    WhatsApp <Link href={WA.href} style={orangeLink}>{WA.label}</Link>
                  </Text>
                  <Text style={{ ...body16, color: c.muted, marginTop: "8px" }}>Bereikbaar {HOURS}</Text>
                </Section>
              )}
              {hasHelp && help !== 4 ? social : null}
            </Column>
          </Row>
          <Row style={{ marginTop: "28px" }}>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: "bottom", paddingRight: "24px" }}>
              {!transactional && (
                <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                  Je ontvangt deze e-mail op <strong>{recipientEmail}</strong> {reason}.
                </Text>
              )}
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "bottom" }}>
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
            </Column>
          </Row>
        </Section>
      </Container>
    </Section>
    </>
  );
}
