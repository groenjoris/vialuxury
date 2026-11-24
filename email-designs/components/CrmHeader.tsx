import { Column, Container, Img, Row, Section } from "@react-email/components";
import * as React from "react";
import { baseUrl, newsletter, type EmailMode } from "./theme";

/** Header van de CRM- en vakantiemails: zwarte balk over de hele breedte (inhoud 626px) met logo links en de Trustpilot-score rechts. */
export default function CrmHeader({ mode = "light" }: { mode?: EmailMode }) {
  const c = newsletter[mode];
  return (
    <Section style={{ backgroundColor: c.frame, width: "100%" }}>
      <Container style={{ width: "100%", maxWidth: "626px" }}>
        <Section style={{ padding: "20px 24px" }}>
          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" className="m-logo" style={{ height: "auto" }} />
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
