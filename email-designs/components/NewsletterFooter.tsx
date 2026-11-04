import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

type Props = {
  recipientEmail: string;
  /** Afzenderreden die bij de trigger past, bijv. "omdat je bij ons boekte". */
  reason?: string;
  mode?: EmailMode;
};

export default function NewsletterFooter({ recipientEmail, reason, mode = "light" }: Props) {
  const c = newsletter[mode];
  const small = {
    color: "#FFFFFF",
    fontSize: "12px",
    lineHeight: "16px",
    margin: 0,
  };
  const iconText = { ...small, margin: "0 0 8px" };
  const footerLink = {
    color: "#FFFFFF",
    textDecoration: "underline",
    fontSize: "12px",
  };

  return (
    <Section
      className="m-pad"
      style={{ backgroundColor: c.frame, padding: "32px", fontFamily: font.body }}
    >
      {/* Rij 1: logo en social (links), hulp nodig (rechts) */}
      <Row>
        <Column className="stack m-center" style={{ width: "50%", verticalAlign: "top" }}>
          <Img
            src={`${baseUrl}/images/logo-vialuxury-horizontal.png`}
            alt="ViaLuxury"
            width="201"
            className="m-mx-auto m-flogo"
            style={{ height: "auto" }}
          />
          <Text className="m-center m-small" style={{ ...small, fontWeight: 700, margin: "20px 0 8px" }}>
            Volg ons op
          </Text>
          <Text className="m-center" style={{ ...small, margin: 0 }}>
            <Link href="https://www.instagram.com/vialuxury">
              <Img src={`${baseUrl}/images/mail/icon-instagram.png`} alt="Instagram" width="19" height="19" style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
            <span style={{ display: "inline-block", width: "8px" }} />
            <Link href="https://www.facebook.com/vialuxury">
              <Img src={`${baseUrl}/images/mail/icon-facebook.png`} alt="Facebook" width="19" height="19" style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </Text>
        </Column>
        <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "top" }}>
          <Text className="m-center" style={{ ...small, fontWeight: 700, margin: "0 0 8px" }}>
            Hulp nodig?
          </Text>
          <Text className="m-center m-small" style={iconText}>
            <Img
              src={`${baseUrl}/images/mail/icon-phone.png`}
              alt=""
              width="18"
              height="18"
              style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
            />
            +31 20 705 2222
          </Text>
          <Text className="m-center m-small" style={iconText}>
            <Img
              src={`${baseUrl}/images/mail/icon-whatsapp.png`}
              alt=""
              width="18"
              height="18"
              style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }}
            />
            +31 20 808 8809
          </Text>
          <Text className="m-center m-small" style={{ ...small, margin: 0 }}>
            Ma t/m Vr: 8:00 — 18:00
          </Text>
        </Column>
      </Row>

      {/* Scheidingslijn: alleen op mobiel */}
      <div
        className="m-only"
        style={{ display: "none", borderTop: "1px solid rgba(255,255,255,0.25)", margin: "24px 0 0" }}
      />

      {/* Rij 2: afzenderregel (links, onderaan uitgelijnd) en kleine lettertjes + links (rechts) */}
      <Row>
        <Column className="stack m-center m-mt" style={{ width: "50%", verticalAlign: "bottom", paddingTop: "28px", paddingRight: "16px" }}>
          <Text className="m-center m-small" style={small}>
            Je ontvangt deze e-mail op <strong>{recipientEmail}</strong>{reason ? ` ${reason}` : ""}.
          </Text>
        </Column>
        <Column className="stack m-center" style={{ width: "50%", verticalAlign: "bottom", paddingTop: "28px" }}>
          <Text className="m-center m-small" style={{ ...small, margin: "0 0 8px" }}>
            Prijswijzigingen en/of zetfouten voorbehouden.
          </Text>
          <Text className="m-center m-small" style={{ ...small, margin: "0 0 8px" }}>
            Copyright © ViaLuxury, All Rights Reserved
          </Text>
          <Text className="m-center m-small" style={{ ...small, margin: "0 0 8px" }}>
            Te veel mail? Ontvang voortaan minder vaak, of helemaal niet meer.
          </Text>
          <Text className="m-center m-small" style={small}>
            <Link href="https://vialuxury.nl" style={footerLink}>
              Wijzig e-mailvoorkeuren
            </Link>{" "}
            |{" "}
            <Link href="https://vialuxury.nl" style={footerLink}>
              Uitschrijven
            </Link>{" "}
            |{" "}
            <Link href="https://vialuxury.nl" style={footerLink}>
              Webversie
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
