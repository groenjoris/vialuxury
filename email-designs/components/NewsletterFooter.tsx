import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

type Props = {
  recipientEmail: string;
  mode?: EmailMode;
};

export default function NewsletterFooter({ recipientEmail, mode = "light" }: Props) {
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
      <Row>
        <Column className="stack m-center" style={{ width: "50%", verticalAlign: "top" }}>
          <Img
            src={`${baseUrl}/images/logo-vialuxury-horizontal.png`}
            alt="ViaLuxury"
            width="201"
            className="m-mx-auto"
            style={{ height: "auto" }}
          />
          <Text className="m-center m-small" style={{ ...small, fontWeight: 700, margin: "20px 0 8px" }}>
            Volg ons op
          </Text>
          <Row className="m-mx-auto" style={{ width: "54px" }}>
            <Column>
              <Link href="https://www.instagram.com/vialuxury">
                <Img src={`${baseUrl}/images/mail/icon-instagram.png`} alt="Instagram" width="19" height="19" />
              </Link>
            </Column>
            <Column style={{ paddingLeft: "8px" }}>
              <Link href="https://www.facebook.com/vialuxury">
                <Img src={`${baseUrl}/images/mail/icon-facebook.png`} alt="Facebook" width="19" height="19" />
              </Link>
            </Column>
          </Row>
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
          <Text className="m-center m-small" style={{ ...small, margin: "0 0 16px" }}>
            Ma t/m Vr: 8:00 — 18:00
          </Text>
          <div
            className="m-only"
            style={{ display: "none", borderTop: "1px solid rgba(255,255,255,0.25)", margin: "0 0 16px" }}
          />
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
      <Row>
        <Column className="m-center">
          <Text className="m-center m-small" style={{ ...small, margin: "24px 0 0" }}>
            Je ontvangt deze e-mail op <strong>{recipientEmail}</strong>.
          </Text>
        </Column>
      </Row>
    </Section>
  );
}
