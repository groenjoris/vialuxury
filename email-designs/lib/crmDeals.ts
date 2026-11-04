import { site } from "../components/crm";

// Echte arrangementen uit app/data/deals.json (prijzen, plaatsen en foto's), als voorbeelddata
// voor de CRM-mails. Links gaan naar de R1-dealpagina (zachte landing).

export type CrmDeal = {
  hotelName: string;
  packageTitle: string;
  place: string;
  nights: number;
  /** "€429" */
  fromPrice: string;
  /** "-38%" */
  discount: string;
  label?: "Populair" | "Nieuw" | "Aanbevolen" | "Samengesteld door ViaLuxury";
  image: string;
  url: string;
};

export const dealUrl = (permalink: string, query = "") => `${site}/first-release/deal/${permalink}${query}`;

export const lauswolt: CrmDeal = {
  hotelName: "Landgoed Lauswolt",
  packageTitle: "Culinair verblijf in een luxe 5*-hotel in het prachtige Friesland",
  place: "Beetsterzwaag",
  nights: 1,
  fromPrice: "€429",
  discount: "-38%",
  image: "https://asset.vialuxury.com/assets/57455675-0f6e-4334-aaa2-bc3d1747f31f?key=card",
  url: dealUrl("landgoed-lauswolt-geniet-van-5-sterren-luxe-in-de-bosrijke-omgeving-van-friesland-incl-culinair-diner"),
};

export const vanOys: CrmDeal = {
  hotelName: "Van Oys Maastricht Retreat",
  packageTitle: "Ervaar wereldklasse comfort in een 5* Superior hotel",
  place: "Eijsden",
  nights: 1,
  fromPrice: "€519",
  discount: "-36%",
  label: "Aanbevolen",
  image: "https://asset.vialuxury.com/assets/57faa15d-2992-49ef-87b4-1ae26418a12f?key=card",
  url: dealUrl("van-oys-maastricht-retreat-ervaar-wereldklasse-comfort-in-een-5-sterren-superior-hotel"),
};

export const villaRuimzicht: CrmDeal = {
  hotelName: "Hotel Villa Ruimzicht",
  packageTitle: "Culinair verblijf in een monumentale villa, incl. 4-gangendiner",
  place: "Doetinchem",
  nights: 1,
  fromPrice: "€229",
  discount: "-40%",
  label: "Populair",
  image: "https://asset.vialuxury.com/assets/8e9e4c45-ae41-49a5-be41-3ec8d6fc915c?key=card",
  url: dealUrl("hotel-villa-ruimzicht-2-daags-verblijf-in-een-monumentale-villa-incl-4-gangendiner"),
};

export const steenenburg: CrmDeal = {
  hotelName: "Kasteel Steenenburg",
  packageTitle: "Culinair verblijf in een 4*-kasteelhotel op een prachtig landgoed, incl. 3-gangendiner",
  place: "Nieuwkuijk",
  nights: 1,
  fromPrice: "€249",
  discount: "-49%",
  label: "Nieuw",
  image: "https://asset.vialuxury.com/assets/c090e6d0-3705-42e1-bf8a-b1e8a3f90db8?key=card",
  url: dealUrl("kasteel-steenenburg-culinair-verblijf-in-middeleeuws-4-kasteelhotel-op-prachtig-landgoed"),
};

export const winselerhof: CrmDeal = {
  hotelName: "Hotel Winselerhof",
  packageTitle: "Ervaar luxe en rust in een 16e-eeuwse herenboerderij in Zuid-Limburg, incl. 4-gangendiner",
  place: "Landgraaf",
  nights: 2,
  fromPrice: "€279",
  discount: "-48%",
  label: "Populair",
  image: "https://asset.vialuxury.com/assets/91f33df7-dfbc-454d-9ebc-8b6e8708a18c?key=card",
  url: dealUrl("winselerhof-een-oase-van-luxe-en-rust-in-het-hart-van-limburg-incl-culinair-4-gangendiner"),
};
