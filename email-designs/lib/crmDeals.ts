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

export const desIndes: CrmDeal = {
  hotelName: "Hotel Des Indes",
  packageTitle: "Verken en beleef Den Haag vanuit een luxe 5*-hotel, incl. 3-gangendiner",
  place: "Den Haag",
  nights: 2,
  fromPrice: "€499",
  discount: "-47%",
  label: "Populair",
  image: "https://asset.vialuxury.com/assets/ec2bfd91-fc7d-4fa4-91b9-9fc61298b804?key=card",
  url: dealUrl("hotel-des-indes-verken-en-beleef-den-haag-vanuit-luxe-5-hotel-incl-3-gangendiner"),
};

export const voco: CrmDeal = {
  hotelName: "voco® The Hague",
  packageTitle: "Verblijf in het mooiste hotel van Nederland",
  place: "Den Haag",
  nights: 2,
  fromPrice: "€319",
  discount: "-47%",
  image: "https://asset.vialuxury.com/assets/37e3155c-a965-4518-b38e-b9e93483766f?key=card",
  url: dealUrl("voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland"),
};

export const dePlesman: CrmDeal = {
  hotelName: "Hotel De Plesman",
  packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor, incl. 3-gangendiner",
  place: "Den Haag",
  nights: 2,
  fromPrice: "€309",
  discount: "-41%",
  label: "Nieuw",
  image: "https://asset.vialuxury.com/assets/e14b892d-4bfd-423d-9789-4e36ca5599af?key=card",
  url: dealUrl("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
};
