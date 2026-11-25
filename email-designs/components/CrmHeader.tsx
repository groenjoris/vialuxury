import { Column, Container, Img, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

/** Headervariant van de commerciële mails (schakelaar "Header 1 | 2 | 3" in de preview):
 *   1  de gewone header (liggend logo links, Trustpilot rechts) met het Trustpilot-logo 1,5 keer zo groot
 *   2  een lage balk, ongeveer 60% van de hoogte, met een iets kleiner logo; het Trustpilot-logo is
 *      daar zo groot als de hoogte toelaat
 *   3  zo hoog als 1, met het vierkante logo helemaal links en de hoofdtitel van de mail (`title`)
 *      in de balk, tussen het logo en Trustpilot
 *  Zonder `variant` (CRM- en vakantiemails) blijft de header zoals hij was. */
export type HeaderVariant = 1 | 2 | 3;

/** Header van de CRM-, vakantie- en commerciële mails: zwarte balk over de hele breedte (inhoud 626px)
 *  met logo links en de Trustpilot-score rechts. */
export default function CrmHeader({ mode = "light", variant, title }: { mode?: EmailMode; variant?: HeaderVariant; /** Hoofdtitel van de mail, alleen in variant 3. */ title?: string }) {
  const c = newsletter[mode];
  // Trustpilot: 106 × 50 in de gewone header, 1,5 keer zo groot (159 × 75) in variant 1 en 3, en in
  // de lage balk (variant 2) 42 px hoog, want meer past er niet in
  const tp = variant === 2 ? { w: 89, h: 42 } : variant ? { w: 159, h: 75 } : { w: 106, h: 50 };
  const padding = variant === 2 ? "6px 24px" : variant === 3 ? "12px 24px 12px 0" : variant ? "12px 24px" : "20px 24px";
  return (
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section style={{ padding }}>
          <Row>
            {variant === 3 ? (
              <>
                <Column style={{ width: "95px", verticalAlign: "middle" }}>
                  <Img src={`${baseUrl}/images/mail/logo-vialuxury-square.png`} alt="ViaLuxury" width="95" height="75" style={{ display: "block" }} />
                </Column>
                <Column style={{ verticalAlign: "middle", padding: "0 20px" }}>
                  {title && <Text style={{ fontFamily: font.heading, fontWeight: 600, fontSize: "20px", lineHeight: "1.25", color: "#FFFFFF", margin: 0 }}>{title}</Text>}
                </Column>
              </>
            ) : (
              <Column style={{ verticalAlign: "middle" }}>
                <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width={variant === 2 ? "168" : "201"} className="m-logo" style={{ height: "auto" }} />
              </Column>
            )}
            <Column align="right" style={{ verticalAlign: "middle", width: variant === 3 ? `${tp.w}px` : undefined }}>
              <Img src={`${baseUrl}/images/mail/trustpilot-16000.png`} alt="Trustpilot 4,5/5, 16.000+ reviews" width={tp.w} height={tp.h} className="m-trustpilot" />
            </Column>
          </Row>
        </Section>
      </Container>
    </Section>
  );
}
