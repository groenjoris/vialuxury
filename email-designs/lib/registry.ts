import type * as React from "react";
import VakantieBevestiging, { fietsPreviewProps as bevestigingFiets } from "../emails/vakantie-bevestiging";
import VakantiePreTravel, { fietsPreviewProps as preTravelFiets } from "../emails/vakantie-pre-travel";
import VakantieIncheckHotel from "../emails/vakantie-incheck-hotel";
import MvpVakantieBevestiging from "../emails/mvp-vakantie-bevestiging";
import CrmNagenieten, { titelProps } from "../emails/crm-nagenieten";
import CrmJaarGeleden, { persoonlijkProps } from "../emails/crm-jaar-geleden";
import CrmWinkelmandje, { naamOnbekendProps } from "../emails/crm-winkelmandje";
import CrmWinkelmandje2Dagen, { naamOnbekendProps as naamOnbekend2DagenProps } from "../emails/crm-winkelmandje-2-dagen";
import CrmThemaStedentrips from "../emails/crm-thema-stedentrips";
import CrmReview, { knoppenProps } from "../emails/crm-review";
import CrmTerugkomactie, { herinneringProps } from "../emails/crm-terugkomactie";
import CrmZoekopdracht from "../emails/crm-zoekopdracht";
import CrmFavorieten from "../emails/crm-favorieten";
import CommercieelContentMultiDeal from "../emails/commercieel-content-multi-deal";
import CommercieelActie from "../emails/commercieel-actie";
import CommercieelTekst from "../emails/commercieel-tekst";
import CommercieelCadeaukaart from "../emails/commercieel-cadeaukaart";
import CommercieelDedicatedHotel, { metTitelProps, zonderPrijsMetTitelProps, zonderPrijsProps } from "../emails/commercieel-dedicated-hotel";
import { incheckMails } from "./incheckMails";

/** MVP: geen accountdetailpagina, boekingslinks gaan naar het boekingenoverzicht. */
const MVP_ACCOUNT = "https://vialuxury.vercel.app/mvp-trip/account/boekingen";

// "crm": concept-mails voor het CRM-project (alleen light, eigen lijst app/data/crm-emails.json).
// "commercieel": commerciële mails (nieuwsbrieven en acties; alleen light, eigen lijst
// app/data/commercieel-emails.json, preview /commercieel/<slug>).
export type EmailSection = "designs" | "inspiration" | "crm" | "commercieel";

export type EmailEntry = {
  slug: string;
  title: string;
  description: string;
  section: EmailSection;
  /** Onderwerpregel en preheader zoals de ontvanger ze in de inbox ziet (de preheader staat ook
   *  als <Preview> in de mail zelf; hier dezelfde tekst met de voorbeelddata ingevuld). */
  subject?: string;
  preheader?: string;
  /** Variant van een andere mail (slug), bijv. de niet-terugbetaalbare versie `<slug>-nonflex`; de
   *  preview toont die bij de schakelaar Non-flex, in lijsten blijft hij verborgen. */
  variantOf?: string;
  /** Label van deze mail in de variantschakelaar van de preview (sectie "commercieel"). Met " / "
   *  ertussen zijn het meerdere, los te combineren schakelaars: "Met prijs / Zonder titel". */
  variantLabel?: string;
  // Elke e-mail exporteert PreviewProps met representatieve voorbeelddata
  // en accepteert een optionele `mode`-prop ("light" | "dark").
  Component: React.ComponentType<any> & { PreviewProps?: Record<string, unknown> };
  /** Props voor deze variant (anders de PreviewProps van het component). */
  props?: Record<string, unknown>;
};

// Alleen de e-mails van de multi-hotel vakanties; de overige ViaLuxury-mails
// staan in het losse project vialuxury-emails.
export const emails: EmailEntry[] = [
  {
    slug: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie",
    description: "Bevestiging na het boeken van een auto- of fietsvakantie met meerdere hotels: kassabon per hotel (adres, nachten, inclusies, check-in/out), flexibel annuleren, prijs, tips voor je reis, bekijk je boeking online, niet inbegrepen, FAQ en onderaan het blok Annuleren of wijzigen (tekst per tarief, link Mijn boeking annuleren, daaronder de afsluiting).",
    section: "designs",
    subject: "Bedankt, jouw autovakantie is bevestigd! Ordernummer: VL-11 851 812",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
  },
  {
    slug: "vakantie-bevestiging-nonflex",
    variantOf: "vakantie-bevestiging",
    title: "Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "Niet-terugbetaalbare boeking: 'Niet terugbetaalbaar — Bij zowel wijzigen als annuleren ontvang je geen bedrag retour' op de kassabon, prijs zonder toeslag, FAQ zonder gratis annuleren.",
    section: "designs",
    subject: "Bedankt, jouw autovakantie is bevestigd! Ordernummer: VL-11 851 812",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: { ...VakantieBevestiging.PreviewProps, rate: "nonflex", listPrice: "€1.490", discount: "−€571", discountPct: 38, total: "€946,50" },
  },
  // Fietsvakantie (Twente & Salland): elke mail en pagina bestaat in een auto- én een fietsvariant. Zelfde titel als de
  // autoversie, zodat de schakelaar Auto | Fiets op de preview (naast de titel) niet verspringt.
  {
    slug: "vakantie-bevestiging-fiets",
    title: "Boekingsbevestiging vakantie",
    description: "Dezelfde boekingsbevestiging voor de fietsvakantie Twente & Salland: drie hotels met bagagetransport, fietshuur en de reis naar het eerste hotel niet inbegrepen.",
    section: "designs",
    subject: "Bedankt, jouw fietsvakantie is bevestigd! Ordernummer: VL-85 584 493",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: bevestigingFiets,
  },
  {
    slug: "vakantie-bevestiging-fiets-nonflex",
    variantOf: "vakantie-bevestiging-fiets",
    title: "Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "Fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Bedankt, jouw fietsvakantie is bevestigd! Ordernummer: VL-85 584 493",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: VakantieBevestiging,
    props: { ...bevestigingFiets, rate: "nonflex", listPrice: "€1.635", discount: "−€576", discountPct: 35, total: "€1.086,50" },
  },
  {
    slug: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Checklist voor je reis: identiteitsbewijs en ViaLuxury Ordernummer, inchecken bij het eerste hotel (adres, route, parkeren, opladen, wat je nog betaalt), de persoonlijke pagina met praktische informatie en tips, je boeking online, en veelgestelde vragen.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
  },
  {
    slug: "vakantie-pre-travel-nonflex",
    variantOf: "vakantie-pre-travel",
    title: "Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "Niet-terugbetaalbare boeking: FAQ 'Kan ik nog wijzigen of annuleren?' zonder gratis annuleren.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
    props: { ...VakantiePreTravel.PreviewProps, rate: "nonflex" },
  },
  {
    slug: "vakantie-pre-travel-fiets",
    title: "Pre-travel (14 dagen voor vertrek)",
    description: "Dezelfde pre-travelmail voor de fietsvakantie Twente & Salland: 'Je fiets' in de checklist, fietsenstalling in plaats van opladen, geen tol.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: preTravelFiets,
  },
  {
    slug: "vakantie-pre-travel-fiets-nonflex",
    variantOf: "vakantie-pre-travel-fiets",
    title: "Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "Fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: { ...preTravelFiets, rate: "nonflex" },
  },
  // Incheckmails: dag vóór hotel 1, 2 en 3, voor de auto- en de fietsvakantie.
  ...incheckMails.map((m) => ({ slug: m.slug, title: m.title, description: m.description, section: "designs" as const, subject: m.subject, preheader: m.preheader, Component: VakantieIncheckHotel, props: m.props })),
  // MVP 12-11-2026: eigen kopie van de boekingsbevestiging, los van de volledige versie uit te kleden.
  {
    slug: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging: kassabon per hotel (met alle inclusies), flexibel annuleren, prijs, bekijk je boeking online, niet inbegrepen, FAQ en onderaan het blok Annuleren of wijzigen — zonder het blok Tips voor je reis.",
    section: "designs",
    subject: "Bedankt, jouw autovakantie is bevestigd! Ordernummer: VL-11 851 812",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
  },
  {
    slug: "mvp-vakantie-bevestiging-nonflex",
    variantOf: "mvp-vakantie-bevestiging",
    title: "MVP — Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "MVP-versie voor een niet-terugbetaalbare boeking: 'Niet terugbetaalbaar' op de kassabon, prijs zonder toeslag, FAQ zonder gratis annuleren.",
    section: "designs",
    subject: "Bedankt, jouw autovakantie is bevestigd! Ordernummer: VL-11 851 812",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...MvpVakantieBevestiging.PreviewProps, rate: "nonflex", listPrice: "€1.490", discount: "−€571", discountPct: 38, total: "€946,50" },
  },
  {
    slug: "mvp-vakantie-bevestiging-fiets",
    title: "MVP — Boekingsbevestiging vakantie",
    description: "MVP-versie van de boekingsbevestiging voor de fietsvakantie Twente & Salland.",
    section: "designs",
    subject: "Bedankt, jouw fietsvakantie is bevestigd! Ordernummer: VL-85 584 493",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...bevestigingFiets, bookingUrl: "https://vialuxury.vercel.app/mvp-trip/account/boekingen?demo=fiets" },
  },
  {
    slug: "mvp-vakantie-bevestiging-fiets-nonflex",
    variantOf: "mvp-vakantie-bevestiging-fiets",
    title: "MVP — Boekingsbevestiging vakantie (niet terugbetaalbaar)",
    description: "MVP-versie, fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Bedankt, jouw fietsvakantie is bevestigd! Ordernummer: VL-85 584 493",
    preheader: "Hieronder alles over je 3 hotels.",
    Component: MvpVakantieBevestiging,
    props: { ...bevestigingFiets, bookingUrl: "https://vialuxury.vercel.app/mvp-trip/account/boekingen?demo=fiets", rate: "nonflex", listPrice: "€1.635", discount: "−€576", discountPct: 35, total: "€1.086,50" },
  },
  // MVP 12-11-2026 (definitie 2026-11-11: alles behalve de tips- en routespagina en de accountdetailpagina):
  // pre-travel en incheckmails zijn dezelfde componenten als de volledige versie met prop `mvp` (label "MHR MVP"
  // bovenin, zonder het blok "Praktische informatie en tips", boekingslinks naar het MVP-boekingenoverzicht).
  {
    slug: "mvp-vakantie-pre-travel",
    title: "MVP — Pre-travel (14 dagen voor vertrek)",
    description: "MVP-versie van de pre-travelmail: zonder het blok Praktische informatie en tips; 'Bekijk je boeking online' gaat naar het boekingenoverzicht.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
    props: { ...VakantiePreTravel.PreviewProps, mvp: true, bookingUrl: MVP_ACCOUNT },
  },
  {
    slug: "mvp-vakantie-pre-travel-nonflex",
    variantOf: "mvp-vakantie-pre-travel",
    title: "MVP — Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "MVP-versie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Noord-Frankrijk",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer en inchecken bij Château Tilques.",
    Component: VakantiePreTravel,
    props: { ...VakantiePreTravel.PreviewProps, mvp: true, bookingUrl: MVP_ACCOUNT, rate: "nonflex" },
  },
  {
    slug: "mvp-vakantie-pre-travel-fiets",
    title: "MVP — Pre-travel (14 dagen voor vertrek)",
    description: "MVP-versie van de pre-travelmail voor de fietsvakantie Twente & Salland.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: { ...preTravelFiets, mvp: true, bookingUrl: `${MVP_ACCOUNT}?demo=fiets` },
  },
  {
    slug: "mvp-vakantie-pre-travel-fiets-nonflex",
    variantOf: "mvp-vakantie-pre-travel-fiets",
    title: "MVP — Pre-travel (14 dagen voor vertrek, niet terugbetaalbaar)",
    description: "MVP-versie, fietsvakantie, niet-terugbetaalbare boeking.",
    section: "designs",
    subject: "Over 14 dagen vertrek je naar Twente & Salland",
    preheader: "Je checklist: identiteitsbewijs, ViaLuxury Ordernummer, je fiets en inchecken bij Hotel Wapen van Delden.",
    Component: VakantiePreTravel,
    props: { ...preTravelFiets, mvp: true, bookingUrl: `${MVP_ACCOUNT}?demo=fiets`, rate: "nonflex" },
  },
  ...incheckMails.map((m) => ({
    slug: `mvp-${m.slug}`,
    title: `MVP — ${m.title}`,
    description: `MVP-versie (zonder het blok Praktische informatie en tips): ${m.description}`,
    section: "designs" as const,
    subject: m.subject,
    preheader: m.preheader,
    Component: VakantieIncheckHotel,
    props: { ...m.props, mvp: true, bookingUrl: m.props.isBike ? `${MVP_ACCOUNT}?demo=fiets` : MVP_ACCOUNT },
  })),
  // CRM (concept, desktop + light mode): drie geautomatiseerde mails.
  {
    slug: "crm-review",
    title: "Reviewmail (1 dag na thuiskomst)",
    description: "Eén doel: de review. Vijf klikbare Trustpilot-sterren boven de vouw, daaronder het verblijf in een omlijnd blok. Gebaseerd op de reviewmail van Jesse.",
    section: "crm",
    subject: "Hoe was je verblijf?",
    preheader: "We horen graag hoe je het vond. Het kost je een minuut.",
    Component: CrmReview,
  },
  {
    slug: "crm-review-knoppen",
    title: "Reviewmail (1 dag na thuiskomst)",
    description: "Variant van de reviewmail: de vijf keuzes als witte knoppen met cijfer en ster in plaats van lege sterren.",
    section: "crm",
    variantOf: "crm-review",
    subject: "Hoe was je verblijf?",
    preheader: "We horen graag hoe je het vond. Het kost je een minuut.",
    Component: CrmReview,
    props: knoppenProps,
  },
  // Overgenomen van Jesse (origin/redesign-jesse), omgezet naar onze bouwstenen.
  {
    slug: "crm-terugkomactie",
    title: "Terugkomactie €20 (14 dagen na vertrek)",
    description: "Kortingscode als coupon, één knop, jouw verblijf, 'Tips voor je kortingscode' met drie groepjes van twee suggesties en de themakiezer.",
    section: "crm",
    subject: "Sanne, €20 cadeau voor je volgende verblijf",
    preheader: "Een persoonlijk bedankje, alleen voor jou. Geldig tot en met 16 december 2026.",
    Component: CrmTerugkomactie,
  },
  {
    slug: "crm-terugkomactie-herinnering",
    title: "Terugkomactie herinnering (30 dagen na vertrek)",
    description: "Voor wie de code nog niet gebruikte, op haast: dezelfde coupon met het aantal dagen dat hij nog geldig is, één knop en dezelfde groepjes suggesties.",
    section: "crm",
    subject: "Sanne, je €20 cadeau verloopt over 14 dagen",
    preheader: "Na 16 december 2026 vervalt je code.",
    Component: CrmTerugkomactie,
    props: herinneringProps,
  },
  {
    slug: "crm-zoekopdracht",
    title: "Zoekopdracht (1 minuut na verlaten)",
    description: "Briefopening (Beste Sanne, intro, Groetjes Yvette), de zoekopdracht als samenvatting met één knop naar alle resultaten, daaronder de titel 'Dit vonden we voor je' met de drie best passende arrangementen.",
    section: "crm",
    subject: "Jouw zoekopdracht: Den Haag",
    preheader: "Kijk of er iets voor je bij zit.",
    Component: CrmZoekopdracht,
  },
  {
    slug: "crm-favorieten",
    title: "Favorieten €10 en €15 (3 dagen na eerste mail)",
    description: "Twee coupons boven het eerste favoriet: €10 op de eerste boeking (24 uur geldig) en €15 op de tweede (code volgt per mail na de eerste boeking); daaronder de andere favorieten en twee vergelijkbare deals. Copy op haast.",
    section: "crm",
    subject: "Alsjeblieft Sanne, €10 korting op Kasteel Steenenburg",
    preheader: "Je code is geldig tot 12 november 2026 10:24 uur.",
    Component: CrmFavorieten,
  },
  {
    slug: "crm-nagenieten",
    title: "Nagenietmail (3 dagen na vertrek)",
    description: "Haalt één gegeven op: wanneer de volgende vakantie is, om latere mails te timen. Grote foto van het hotel met \"We hopen dat je genoten hebt van …\", daarna één vraag met zes gelijkwaardige knoppen. Geen deals, geen code.",
    section: "crm",
    subject: "Wanneer ga je weer?",
    preheader: "Eén klik, dan sturen we je op het juiste moment inspiratie.",
    Component: CrmNagenieten,
  },
  {
    slug: "crm-nagenieten-titel",
    title: "Nagenietmail (3 dagen na vertrek)",
    description: "Variant: onder de foto een grote titel in plaats van de brief, en in het blok een regel boven de vraag.",
    section: "crm",
    variantOf: "crm-nagenieten",
    subject: "Wanneer ga je weer?",
    preheader: "Eén klik, dan sturen we je op het juiste moment inspiratie.",
    Component: CrmNagenieten,
    props: titelProps,
  },
  {
    slug: "crm-jaar-geleden",
    title: "Precies een jaar geleden",
    description: "On this day-herinnering op de aankomstdatum +1 jaar: grote foto, datum en hotel, één knop naar het arrangement met dezelfde periode en personen vooringevuld. Kortingsregel alleen bij een actieve code; drie deals met frame-titel.",
    section: "crm",
    subject: "Vandaag een jaar geleden 🎉",
    preheader: "Je verblijf in Hotel Des Indes, en een code voor €25 korting.",
    Component: CrmJaarGeleden,
  },
  {
    slug: "crm-jaar-geleden-persoonlijk",
    title: "Precies een jaar geleden",
    description: "Variant: onder de titel een brief met het verblijf van vorig jaar en een link naar de beschikbare datums, de coupon, en de suggesties onder 'Geselecteerd voor Sanne'.",
    section: "crm",
    variantOf: "crm-jaar-geleden",
    subject: "Vandaag een jaar geleden 🎉",
    preheader: "Je verblijf in Hotel Des Indes, en een code voor €25 korting.",
    Component: CrmJaarGeleden,
    props: persoonlijkProps,
  },
  {
    slug: "crm-winkelmandje",
    title: "Winkelmandje (2 uur na verlaten)",
    description: "Eén doel: de boeking afronden. Titel met voornaam, de vraag met de hotelnaam, datums, nachten en personen, de besparing en één knop terug naar de boeking; daaronder de deal op de uitgebreide kaart zonder prijsrij. Gastenoordeel met Trustpilot-sterren en drie reviews. Geen alternatieve deals.",
    section: "crm",
    subject: "Sanne, we hebben deze nog even voor je bewaard",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
  },
  {
    slug: "crm-winkelmandje-naam-onbekend",
    title: "Winkelmandje (2 uur na verlaten)",
    description: "Variant van de winkelmandjemail voor als de voornaam niet bekend is: titel en onderwerp zonder naam.",
    section: "crm",
    variantOf: "crm-winkelmandje",
    subject: "We hebben deze nog even voor je bewaard",
    preheader: "Je boeking staat klaar. Rond af wanneer het jou uitkomt.",
    Component: CrmWinkelmandje,
    props: naamOnbekendProps,
  },
  {
    slug: "crm-winkelmandje-2-dagen",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Na de mail van 2 uur nu alternatieven: titel 'Anderen boekten ook', korte persoonlijke intro met ondertekening, drie vergelijkbare deals en daaronder de bekeken deal.",
    section: "crm",
    subject: "Anderen die Hotel Des Indes bekeken, boekten vaak deze deals",
    preheader: "Misschien zit jouw volgende verblijf erbij.",
    Component: CrmWinkelmandje2Dagen,
  },
  {
    slug: "crm-winkelmandje-2-dagen-naam-onbekend",
    title: "Winkelmandje (2 dagen na verlaten)",
    description: "Variant voor als de voornaam niet bekend is: de intro begint met 'Beste gast,'.",
    section: "crm",
    variantOf: "crm-winkelmandje-2-dagen",
    subject: "Anderen die Hotel Des Indes bekeken, boekten vaak deze deals",
    preheader: "Misschien zit jouw volgende verblijf erbij.",
    Component: CrmWinkelmandje2Dagen,
    props: naamOnbekend2DagenProps,
  },
  {
    slug: "crm-thema-stedentrips",
    title: "Themamail stedentrips (A6)",
    description: "Briefopening met de reden (waar je op zocht), drie populaire stedentrips (één groot, twee als rij), daarna een ander thema kiezen met zes witte snelfilterknoppen in een raster.",
    section: "crm",
    subject: "Dit zijn de populairste stedentrips van dit moment",
    preheader: "Parijs, Den Haag en Amsterdam, vanaf €279 voor 2 personen.",
    Component: CrmThemaStedentrips,
  },
  // ── Commerciële mails (volgorde = volgorde in het paneel van /commercieel) ──
  {
    slug: "commercieel-content-multi-deal",
    title: "Content (Multi-deal)",
    description: "Meerdere deals rond één thema of selectie (kerstmarkten): sfeerfoto, campagnetitel, korte brief en vier dealrijen waarvan de dealtitel en de foto naar de kerstmarkt in de buurt verwijzen.",
    section: "commercieel",
    subject: "Winter Wonderweken: slapen bij de mooiste kerstmarkten",
    preheader: "Glühwein, lichtjes en een hotel om de hoek.",
    Component: CommercieelContentMultiDeal,
  },
  {
    slug: "commercieel-dedicated-hotel",
    title: "Dedicated hotel",
    description: "Eén hotel: korte brief met het aanbod, de knop 'Bekijk aanbieding' en het arrangement op de verticale dealkaart.",
    section: "commercieel",
    subject: "Ons beste hotelarrangement van de maand",
    preheader: "2 nachten voor 2 personen op de Veluwe, inclusief diner.",
    variantLabel: "Met prijs / Zonder titel",
    Component: CommercieelDedicatedHotel,
  },
  {
    slug: "commercieel-dedicated-hotel-zonder-prijs",
    title: "Dedicated hotel",
    description: "Variant zonder prijs: de brief maakt nieuwsgierig en noemt geen prijs, de kaart heeft geen prijsrij.",
    section: "commercieel",
    subject: "Ons beste hotelarrangement van de maand",
    preheader: "Midden in de bossen van de Veluwe. De prijs is lager dan je denkt.",
    variantOf: "commercieel-dedicated-hotel",
    variantLabel: "Zonder prijs / Zonder titel",
    Component: CommercieelDedicatedHotel,
    props: zonderPrijsProps,
  },
  {
    slug: "commercieel-dedicated-hotel-met-titel",
    title: "Dedicated hotel",
    description: "Variant met titel: 'Deal van de maand november' groot boven het bericht.",
    section: "commercieel",
    subject: "Ons beste hotelarrangement van de maand",
    preheader: "2 nachten voor 2 personen op de Veluwe, inclusief diner.",
    variantOf: "commercieel-dedicated-hotel",
    variantLabel: "Met prijs / Met titel",
    Component: CommercieelDedicatedHotel,
    props: metTitelProps,
  },
  {
    slug: "commercieel-dedicated-hotel-zonder-prijs-met-titel",
    title: "Dedicated hotel",
    description: "Variant met titel en zonder prijs.",
    section: "commercieel",
    subject: "Ons beste hotelarrangement van de maand",
    preheader: "Midden in de bossen van de Veluwe. De prijs is lager dan je denkt.",
    variantOf: "commercieel-dedicated-hotel",
    variantLabel: "Zonder prijs / Met titel",
    Component: CommercieelDedicatedHotel,
    props: zonderPrijsMetTitelProps,
  },
  {
    slug: "commercieel-actie",
    title: "Actie (Goodiebox)",
    description: "Een cadeau of extra bij een boeking: actiefoto, titel met de deadline, korte brief, de actiecode als coupon, vier geselecteerde deals en een knop naar alle aanbiedingen.",
    section: "commercieel",
    subject: "Sanne, je Goodiebox t.w.v. €150 staat klaar",
    preheader: "Boek voor 7 december en hij is van jou.",
    Component: CommercieelActie,
  },
  {
    slug: "commercieel-tekst",
    title: "Tekst (Zaterdagkorting)",
    description: "Mail zonder deals: actiegraphic (feestelijke coupon van €15), korte brief, de persoonlijke code als coupon, één knop en drie stappen om de code te verzilveren.",
    section: "commercieel",
    subject: "Sanne, alleen vandaag: €15 korting voor jou",
    preheader: "Je persoonlijke code vervalt om middernacht.",
    Component: CommercieelTekst,
  },
  {
    slug: "commercieel-cadeaukaart",
    title: "Cadeaukaart",
    description: "Cadeaukaarten verkopen: sfeerbeeld in twee helften, titel, brief met de uitleg, de staffel als tabel (waarde cadeaukaart en jouw persoonlijke korting), slotzin en knop.",
    section: "commercieel",
    subject: "Geef een cadeaukaart, krijg zelf tot €120 korting",
    preheader: "Het cadeau waar ze nog jaren over vertellen.",
    Component: CommercieelCadeaukaart,
  },
];

export function getEmail(slug: string): EmailEntry | undefined {
  return emails.find((e) => e.slug === slug);
}
