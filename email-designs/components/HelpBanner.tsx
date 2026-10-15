import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

/** "Hulp nodig?" — één regel in een warm vlak met het telefoonicoon, zoals op de reispagina. */
export default function HelpBanner({ mode = "light" }: { mode?: EmailMode }) {
  const c = newsletter[mode];
  const dark = mode === "dark";
  const link = { color: c.text, textDecoration: "underline", fontWeight: 700 };
  return (
    <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
      <Section style={{ backgroundColor: dark ? "#3A3A3A" : "#FFF0E4", borderRadius: "8px", padding: "14px 18px" }}>
        <Row>
          <Column style={{ width: "48px", verticalAlign: "middle" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "18px", backgroundColor: dark ? "#2D2D2D" : "#FFFFFF", textAlign: "center", lineHeight: "36px" }}>
              <Img src={`${baseUrl}/images/mail/icon-phone-orange.png`} alt="" width="18" height="18" style={{ display: "inline-block", verticalAlign: "middle" }} />
            </div>
          </Column>
          <Column style={{ verticalAlign: "middle" }}>
            <Text style={{ fontFamily: font.body, fontSize: "15px", lineHeight: "1.45", color: c.text, margin: 0 }}>
              <strong>Hulp nodig?</strong> Bel{" "}
              <Link href="tel:+31207052222" style={link}>+31 20 705 2222</Link> of WhatsApp{" "}
              <Link href="https://wa.me/31208088809" style={link}>+31 20 808 8809</Link>
              <span style={{ color: c.muted }}> · ma t/m vr 8:00 – 18:00</span>
            </Text>
          </Column>
        </Row>
      </Section>
    </Section>
  );
}
