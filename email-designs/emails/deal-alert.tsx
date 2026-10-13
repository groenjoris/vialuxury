import {
  Button,
  Column,
  Heading,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout from "../components/EmailLayout";
import { baseUrl, brand, font, type EmailMode } from "../components/theme";

type Props = {
  mode?: EmailMode;
  dealTitle: string;
  location: string;
  stars: string;
  description: string;
  oldPrice: string;
  newPrice: string;
  priceSuffix: string;
  perks: string[];
  imageUrl: string;
};

export default function DealAlert({
  dealTitle,
  location,
  stars,
  description,
  oldPrice,
  newPrice,
  priceSuffix,
  perks,
  imageUrl,
  mode = "light",
}: Props) {
  const dark = mode === "dark";
  const cardBg = dark ? "#2D2D2D" : brand.white;
  const boxBg = dark ? "#3A3A3A" : brand.cloud;
  const inkText = dark ? "#E0E0E0" : brand.ink;
  const headingColor = dark ? brand.tealLight : brand.tealDark;
  const mutedText = dark ? "#A8A8A8" : "#6B6B6B";
  return (
    <EmailLayout preview={`${dealTitle} — nu vanaf ${newPrice} ${priceSuffix}`} mode={mode}>
      <Section style={{ backgroundColor: cardBg }}>
        <Img
          src={imageUrl}
          alt={dealTitle}
          width="600"
          height="300"
          style={{ objectFit: "cover", width: "100%" }}
        />
      </Section>

      <Section style={{ backgroundColor: cardBg, padding: "28px 32px 32px" }}>
        <Text
          style={{
            color: headingColor,
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            margin: "0 0 8px",
          }}
        >
          Deal van de week · {stars}
        </Text>
        <Heading
          as="h1"
          style={{
            fontFamily: font.heading,
            fontWeight: 600,
            fontSize: "26px",
            lineHeight: "34px",
            color: inkText,
            margin: "0 0 4px",
          }}
        >
          {dealTitle}
        </Heading>
        <Text style={{ color: mutedText, fontSize: "14px", margin: "0 0 16px" }}>{location}</Text>

        <Text style={{ color: inkText, fontSize: "15px", lineHeight: "24px", margin: "0 0 20px" }}>
          {description}
        </Text>

        <Section style={{ backgroundColor: boxBg, borderRadius: "8px", padding: "16px 20px" }}>
          {perks.map((perk) => (
            <Text
              key={perk}
              style={{ color: inkText, fontSize: "14px", lineHeight: "24px", margin: 0 }}
            >
              <Img
                src={`${baseUrl}/images/mail/${dark ? "check-dark.png" : "check.png"}`}
                alt=""
                width="14"
                height="14"
                style={{ display: "inline", verticalAlign: "middle", marginRight: "10px" }}
              />
              {perk}
            </Text>
          ))}
        </Section>

        <Row style={{ marginTop: "24px" }}>
          <Column>
            <Text
              style={{
                color: brand.ember,
                fontSize: "15px",
                textDecoration: "line-through",
                margin: 0,
              }}
            >
              {oldPrice}
            </Text>
            <Text
              style={{
                fontFamily: font.heading,
                fontWeight: 600,
                color: headingColor,
                fontSize: "30px",
                lineHeight: "36px",
                margin: 0,
              }}
            >
              {newPrice}
              <span style={{ fontSize: "14px", color: mutedText, fontFamily: font.body, fontWeight: 400 }}>
                {" "}
                {priceSuffix}
              </span>
            </Text>
          </Column>
          <Column align="right" style={{ verticalAlign: "bottom" }}>
            <Button
              href="https://vialuxury.nl"
              style={{
                backgroundColor: brand.ember,
                borderRadius: "8px",
                color: brand.white,
                fontSize: "16px",
                fontWeight: 700,
                padding: "14px 28px",
                textDecoration: "none",
              }}
            >
              Bekijk deze deal
            </Button>
          </Column>
        </Row>
      </Section>
    </EmailLayout>
  );
}

DealAlert.PreviewProps = {
  dealTitle: "Amara Luxury Resort & Villas",
  location: "Bodrum, Turkije",
  stars: "5 sterren",
  description:
    "Wit design-resort direct aan de Egeïsche Zee, met privéstrand, drie infinity pools en een spa van 2.000 m². Nu tijdelijk met meer dan 40% korting op basis van halfpension.",
  oldPrice: "€ 1.279",
  newPrice: "€ 749",
  priceSuffix: "p.p. · 7 nachten",
  perks: [
    "Halfpension inbegrepen",
    "Gratis upgrade naar zeezicht (o.b.v. beschikbaarheid)",
    "Transfer van en naar de luchthaven",
    "Gratis annuleren tot 14 dagen voor vertrek",
  ],
  imageUrl: `${baseUrl}/images/mail/theme-sea.jpg`,
} satisfies Props;
