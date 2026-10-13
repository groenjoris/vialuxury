import { Column, Img, Row, Section } from "@react-email/components";
import * as React from "react";
import { baseUrl, newsletter, type EmailMode } from "./theme";

type Props = {
  mode?: EmailMode;
};

export default function NewsletterHeader({ mode = "light" }: Props) {
  const c = newsletter[mode];
  return (
    <Section style={{ backgroundColor: c.frame, padding: "16px 20px" }}>
      <Row>
        <Column>
          <Img
            src={`${baseUrl}/images/logo-vialuxury-horizontal.png`}
            alt="ViaLuxury"
            width="201"
            className="m-logo"
            style={{ height: "auto" }}
          />
        </Column>
        <Column align="right">
          <Img
            src={`${baseUrl}/images/mail/trustpilot.png`}
            alt="Trustpilot 4.5/5 — 15.500+ reviews"
            width="106"
            height="50"
            className="m-trustpilot"
          />
        </Column>
      </Row>
    </Section>
  );
}
