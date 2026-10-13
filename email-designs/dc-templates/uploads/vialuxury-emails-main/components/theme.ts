// ViaLuxury huisstijl-tokens voor e-mails (bron: vialuxury-brand skill)
export const brand = {
  tealDark: "#206861", // primaire merkkleur — headers, grote vlakken
  tealLight: "#80C5B7", // secundair — zachte vlakken
  cloud: "#F5F5F5", // achtergrond
  ink: "#1A1A1A", // bodytekst, footer
  white: "#FFFFFF", // kaartoppervlakken
  ember: "#FB862C", // uitsluitend CTA's en doorgehaalde oude prijzen
};

// Nieuwsbrief-specifieke tokens (bron: Figma "Nieuwsbrief"-bestand).
// Het donkere palet komt uit de dark-frames (Mail 1 FAN) in datzelfde bestand.
export type EmailMode = "light" | "dark";

export const newsletter = {
  light: {
    bg: "#FFFFFF",
    frame: "#141414", // header/footer-balk
    heading: "#141414",
    text: "#141414",
    muted: "#6B6B6B",
    border: "#D6D6D6",
    card: "#FFFFFF",
    cta: "#FB862C",
    link: "#FB862C",
    badgeBg: "#141414",
  },
  dark: {
    bg: "#1E1E1E",
    frame: "#1E1E1E",
    heading: "#FFFFFF",
    text: "#E0E0E0",
    muted: "#A8A8A8",
    border: "#3A3A3A",
    card: "#2D2D2D",
    cta: "#C96A2D",
    link: "#C96A2D",
    badgeBg: "#000000",
  },
} as const;

// E-mailclients hebben zelden custom fonts; Recoleta/Basis vallen terug
// op systeemfonts met vergelijkbaar karakter.
export const font = {
  heading: "'Recoleta', Georgia, 'Times New Roman', serif",
  body: "'Basis Grotesque Pro', Helvetica, Arial, sans-serif",
};

// Op Vercel worden afbeeldings-URL's absoluut, zodat gekopieerde HTML
// ook buiten de gallery werkt. Lokaal blijven ze relatief (werkt in de
// gallery-preview omdat een srcdoc-iframe de base-URL van de pagina erft).
export const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "";
