import { Column, Container, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

// Footer van de CRM- en vakantiemails. Staat buiten de 626px-container van de mail: het zwarte
// vlak loopt over de hele breedte, de inhoud blijft 626px breed. Links logo, "Volg ons op" en
// onderaan de afzenderreden; rechts "Hulp nodig?", de kleine lettertjes en de opt-out. Op mobiel
// (klassen stack/m-center uit de responsiveCss van de vakantiemails) staan de kolommen onder elkaar.

type Props = {
  recipientEmail: string;
  /** Afzenderreden die bij de trigger past, bijv. "omdat je bij ons boekte". */
  reason: string;
  mode?: EmailMode;
};

export default function CrmFooter({ recipientEmail, reason, mode = "light" }: Props) {
  const c = newsletter[mode];
  const text = { fontFamily: font.body, color: "#FFFFFF", fontSize: "12px", lineHeight: "16px", margin: "0 0 8px" };
  const bold = { ...text, fontWeight: 700 };
  const link = { color: "#FFFFFF", textDecoration: "underline" };
  const icon = { display: "inline", verticalAlign: "middle", marginRight: "10px" } as const;

  return (
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className="m-pad" style={{ padding: "32px" }}>
          <Row>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: "top" }}>
              <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-mx-auto" style={{ height: "auto" }} />
              <Text className="m-center" style={{ ...bold, margin: "22px 0 10px" }}>Volg ons op</Text>
              <Link href="https://www.instagram.com/vialuxury">
                <Img src={`${baseUrl}/images/mail/icon-instagram.png`} alt="Instagram" width="19" height="19" style={{ display: "inline", marginRight: "10px" }} />
              </Link>
              <Link href="https://www.facebook.com/vialuxury">
                <Img src={`${baseUrl}/images/mail/icon-facebook.png`} alt="Facebook" width="19" height="19" style={{ display: "inline" }} />
              </Link>
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "top" }}>
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
            </Column>
          </Row>
          <Row style={{ marginTop: "28px" }}>
            <Column className="stack m-center" style={{ width: "50%", verticalAlign: "bottom", paddingRight: "24px" }}>
              <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                Je ontvangt deze e-mail op <strong>{recipientEmail}</strong> {reason}.
              </Text>
            </Column>
            <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "bottom" }}>
              <Text className="m-center m-small" style={text}>Prijswijzigingen en/of zetfouten voorbehouden.</Text>
              <Text className="m-center m-small" style={text}>Copyright © ViaLuxury, All Rights Reserved</Text>
              <Text className="m-center m-small" style={text}>Liever geen updates meer? Ontvang onze nieuwsbrief minder vaak, of helemaal niet meer.</Text>
              <Text className="m-center m-small" style={{ ...text, margin: 0 }}>
                <Link href="https://vialuxury.nl" style={link}>Wijzig e-mailvoorkeuren</Link> |{" "}
                <Link href="https://vialuxury.nl" style={link}>Uitschrijven</Link> |{" "}
                <Link href="https://vialuxury.nl" style={link}>Webversie</Link>
              </Text>
            </Column>
          </Row>
        </Section>
      </Container>
    </Section>
  );
}
