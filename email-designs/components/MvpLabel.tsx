import { Container, Section } from "@react-email/components";
import * as React from "react";
import { font, newsletter, type EmailMode } from "./theme";

/** Variant-label "MHR MVP" bovenin een MVP-mail (niet voor de gast): dezelfde subtiele stijl als het
 *  label onder het logo op de MVP-pagina's, zodat developers altijd zien dat dit de MVP-variant is. */
export default function MvpLabel({ mode = "light" }: { mode?: EmailMode }) {
  const c = newsletter[mode];
  return (
    <Container style={{ width: "100%", maxWidth: "626px" }}>
      <Section style={{ padding: "8px 12px 6px" }}>
        <span style={{ display: "inline-block", padding: "2px 5px", border: `1px solid ${c.border}`, borderRadius: "3px", color: c.muted, fontFamily: font.body, fontSize: "9px", lineHeight: "11px", fontWeight: 600, letterSpacing: "1.3px", textTransform: "uppercase" }}>
          MHR MVP
        </span>
      </Section>
    </Container>
  );
}
