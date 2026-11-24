import { Body, Head, Html, Text } from "@react-email/components";
import * as React from "react";
import { crmCss, DealRowFixed, type RowDeal, s } from "../components/crm";
import { font, newsletter } from "../components/theme";
import { carltonBeach, steenenburg, voco } from "../lib/crmDeals";

// Geen mail maar een voorbeeldweergave (onderaan het CRM-paneel): drie dealrijen met vaste hoogte
// naast elkaar, met een dealtitel van één, twee en drie regels, om ze te kunnen vergelijken. Elke
// kaart heeft links twee foto's onder elkaar (met witruimte ertussen) in plaats van één
// langwerpige foto en is exact even hoog; de ruimte tussen de laatste inclusie en de prijsrij
// vangt het verschil in titellengte op. Zie DealRowFixed in components/crm.tsx.
// De preview (/crm/crm-dealkaart-vaste-hoogte) toont dit blad zonder inboxframe en schaalt het in
// de breedte; de maten staan in `sheet` hieronder en in app/pages/crm/[slug].vue.

type Example = { label: string; deal: RowDeal; image2: string };
type Props = { examples: Example[] };

/** Breedte van één kaart (zoals in een mail: 626 − 2 × 32) en de ruimte ertussen. */
const cardWidth = 562;
const gap = 24;

export default function CrmDealkaartVasteHoogte({ examples }: Props) {
  const c = newsletter.light;
  return (
    <Html lang="nl">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{crmCss}</style>
      </Head>
      <Body style={{ backgroundColor: c.bg, margin: 0, padding: "24px", fontFamily: font.body }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              {examples.map((e, i) => (
                <td key={e.label} valign="top" style={{ width: `${cardWidth}px`, minWidth: `${cardWidth}px`, verticalAlign: "top", paddingLeft: i ? `${gap}px` : 0 }}>
                  <Text style={{ ...s.name, margin: 0 }}>{e.label}</Text>
                  <DealRowFixed deal={e.deal} image2={e.image2} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  );
}

const img = (id: string) => `https://asset.vialuxury.com/assets/${id}?key=card`;

CrmDealkaartVasteHoogte.PreviewProps = {
  examples: [
    { label: "Dealtitel van 1 regel", deal: { ...carltonBeach, packageTitle: "Uitwaaien in Scheveningen" }, image2: img("d30a6e61-eacd-471a-9305-8e8aa2fef321") },
    { label: "Dealtitel van 2 regels", deal: voco, image2: img("04007e67-62ca-4ffc-9ecf-a7b932695586") },
    {
      label: "Dealtitel van 3 regels",
      deal: { ...steenenburg, image: img("c090e6d0-3705-42e1-bf8a-b1e8a3f90db8"), includes: ["Uitgebreid ontbijtbuffet", "3-Gangendiner in de Orangerie", "Gratis parkeren", "Toegang tot Beekse Bergen"] },
      image2: img("da12201c-0b8f-47d6-8298-29931cc91d37"),
    },
  ],
} satisfies Props;
