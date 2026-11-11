import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { baseUrl, font, newsletter, type EmailMode } from "./theme";

/** "Hulp nodig?" — één regel in een warm vlak met het telefoonicoon, zoals op de reispagina. */
export default function HelpBanner({ mode = "light" }: { mode?: EmailMode }) {
  const c = newsletter[mode];
  const dark = mode === "dark";
  const link = { color: c.link, textDecoration: "underline", fontWeight: 700 }; // tekstlinks altijd oranje (huisstijl)
  return (
    <Section className="m-pad" style={{ padding: "24px 32px 0" }}>
      <Section style={{ backgroundColor: dark ? "#3A3A3A" : "#FFF0E4", borderRadius: "8px", padding: "14px 18px" }}>
        <Row>
          <Column style={{ width: "48px", verticalAlign: "middle" }}>
            {/* Witte cirkel als tabelcel, zodat het icoon (20px) in elke mailclient in het midden staat. */}
            <table role="presentation" cellPadding={0} cellSpacing={0} border={0} style={{ width: "36px", height: "36px", borderCollapse: "separate" }}>
              <tbody>
                <tr>
                  <td style={{ width: "36px", height: "36px", padding: 0, borderRadius: "18px", backgroundColor: dark ? "#2D2D2D" : "#FFFFFF", textAlign: "center", verticalAlign: "middle" }}>
                    <Img src={`${baseUrl}/images/mail/icon-phone-orange.png`} alt="" width="20" height="20" style={{ display: "block", margin: "0 auto" }} />
                  </td>
                </tr>
              </tbody>
            </table>
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
