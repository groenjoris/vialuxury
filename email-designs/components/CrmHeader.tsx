import { Column, Container, Img, Row, Section } from "@react-email/components";
import * as React from "react";
import { baseUrl, newsletter, type EmailMode } from "./theme";

/** Pay-off "Dit moeten we vaker doen!" onder het logo, als afbeelding (witte tekst, transparant) in
 *  een van zes lettertypes; gemaakt met scripts/mail-graphics/payoff-header.py. Elke afbeelding is
 *  precies even breed als het logo (201 px). Het uitroepteken hoort er in elk lettertype bij. `?v=`
 *  in de afbeeldings-URL ophogen als de afbeeldingen opnieuw gemaakt zijn (anders toont de browser de oude). */
export const payoffs = {
  "oooh-baby": "Oooh Baby",
  "la-belle-aurore": "La Belle Aurore",
  caveat: "Caveat",
  "bradley-hand": "Bradley Hand",
  "basis-grotesque": "Basis Grotesque",
  recoleta: "Recoleta",
} as const;
export type Payoff = keyof typeof payoffs;

/** Header van de CRM- en vakantiemails: zwarte balk over de hele breedte (inhoud 626px) met logo links en de Trustpilot-score rechts.
 *  `payoff`: de pay-off "Dit moeten we vaker doen!" onder het logo, in het gekozen lettertype. */
export default function CrmHeader({ mode = "light", payoff }: { mode?: EmailMode; payoff?: Payoff }) {
  const c = newsletter[mode];
  return (
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section style={{ padding: "20px 24px" }}>
          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-logo" style={{ height: "auto" }} />
              {payoff && (
                <Img src={`${baseUrl}/images/mail/crm/payoff-${payoff}.png?v=4`} alt="Dit moeten we vaker doen!" width="201" style={{ display: "block", width: "201px", height: "auto", marginTop: "8px" }} />
              )}
            </Column>
            <Column align="right" style={{ verticalAlign: "middle" }}>
              <Img src={`${baseUrl}/images/mail/trustpilot-16000.png`} alt="Trustpilot 4,5/5, 16.000+ reviews" width="106" height="50" className="m-trustpilot" />
            </Column>
          </Row>
        </Section>
      </Container>
    </Section>
  );
}
