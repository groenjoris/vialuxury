import { Column, Img, Row, Section } from "@react-email/components";
import * as React from "react";
import { baseUrl, newsletter } from "./theme";

/** Header van de CRM-mails: zwarte balk met logo links en de Trustpilot-score rechts. */
export default function CrmHeader() {
  const c = newsletter.light;
  return (
    <Section style={{ backgroundColor: c.frame, padding: "20px 24px" }}>
      <Row>
        <Column style={{ verticalAlign: "middle" }}>
          <Img src={`${baseUrl}/images/logo-vialuxury-horizontal.png`} alt="ViaLuxury" width="201" style={{ height: "auto" }} />
        </Column>
        <Column align="right" style={{ verticalAlign: "middle" }}>
          <Img src={`${baseUrl}/images/mail/trustpilot-16000.png`} alt="Trustpilot 4,5/5, 16.000+ reviews" width="106" height="50" />
        </Column>
      </Row>
    </Section>
  );
}
