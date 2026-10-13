import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { baseUrl, brand, font, type EmailMode } from "./theme";

type Props = {
  preview: string;
  mode?: EmailMode;
  children: React.ReactNode;
};

export default function EmailLayout({ preview, mode = "light", children }: Props) {
  const dark = mode === "dark";
  return (
    <Html lang="nl">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: dark ? "#1E1E1E" : brand.cloud,
          margin: 0,
          padding: "24px 0",
          fontFamily: font.body,
        }}
      >
        <Container style={{ width: "600px", maxWidth: "600px" }}>
          <Section
            style={{
              backgroundColor: brand.tealDark,
              borderRadius: "12px 12px 0 0",
              padding: "24px 32px",
            }}
          >
            <Img
              src={`${baseUrl}/images/logo-vialuxury-horizontal.png`}
              alt="ViaLuxury"
              width="168"
              style={{ height: "auto" }}
            />
          </Section>

          {children}

          <Section
            style={{
              backgroundColor: dark ? "#111111" : brand.ink,
              borderRadius: "0 0 12px 12px",
              padding: "24px 32px",
            }}
          >
            <Text style={{ color: brand.white, fontSize: "13px", lineHeight: "20px", margin: 0 }}>
              ViaLuxury — luxe reizen voor de beste prijs
            </Text>
            <Text style={{ color: "#9B9B9B", fontSize: "12px", lineHeight: "18px", margin: "8px 0 0" }}>
              Je ontvangt deze e-mail omdat je een account of boeking hebt bij ViaLuxury.{" "}
              <Link href="https://vialuxury.nl" style={{ color: brand.tealLight, textDecoration: "underline" }}>
                Voorkeuren aanpassen
              </Link>{" "}
              ·{" "}
              <Link href="https://vialuxury.nl" style={{ color: brand.tealLight, textDecoration: "underline" }}>
                Uitschrijven
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
