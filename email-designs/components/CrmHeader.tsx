import { Column, Container, Img, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

/** Header van de CRM-, vakantie- en commerciële mails: zwarte balk over de hele breedte (inhoud 626px)
 *  met logo links en de Trustpilot-score rechts. Met `title` (variant "Header-titel" van de
 *  commerciële Content-mail): het vierkante logo (76 × 60) links en de hoofdtitel van de
 *  mail in de balk, 32 px en gecentreerd tussen het logo en Trustpilot. */
export default function CrmHeader({ mode = "light", title, pad = 24 }: { mode?: EmailMode; /** Marge links en rechts in px; de commerciële mails gebruiken 32, zodat het logo gelijk staat met de inhoud van de mail. */ pad?: number; /** Hoofdtitel van de mail in de header. */ title?: string }) {
  const c = newsletter[mode];
  const trustpilot = <Img src={`${baseUrl}/images/mail/trustpilot-16000.png`} alt="Trustpilot 4,5/5, 16.000+ reviews" width="106" height="50" className="m-trustpilot" />;
  return (
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section className={title ? "m-head-pad" : pad !== 24 ? "m-pad" : undefined} style={{ padding: title ? `15px ${pad}px` : `20px ${pad}px` }}>
          {title ? (
            <Row>
              <Column style={{ width: "76px", verticalAlign: "middle" }}>
                <Img src={`${baseUrl}/images/mail/logo-vialuxury-square.png`} alt="ViaLuxury" width="76" height="60" style={{ display: "block" }} />
              </Column>
              <Column align="center" className="m-head-cell" style={{ verticalAlign: "middle", padding: "0 20px", textAlign: "center" }}>
                <Text className="m-head-title" style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "32px", lineHeight: "1.2", color: "#FFFFFF", margin: 0, textAlign: "center" }}>{title}</Text>
              </Column>
              <Column align="right" style={{ verticalAlign: "middle", width: "106px" }}>{trustpilot}</Column>
            </Row>
          ) : (
            <Row>
              <Column style={{ verticalAlign: "middle" }}>
                <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-logo" style={{ height: "auto" }} />
              </Column>
              <Column align="right" style={{ verticalAlign: "middle" }}>{trustpilot}</Column>
            </Row>
          )}
        </Section>
      </Container>
    </Section>
  );
}
