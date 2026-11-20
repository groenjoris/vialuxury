import { type RowDeal, site } from "../components/crm";

// Echte arrangementen uit app/data/deals.json (prijzen, plaatsen, sterren en foto's) als
// voorbeelddata voor de CRM-mails, inclusief inclusies, korting en kamerprijs voor de uitgebreide kaart. De prijs in deals.json is het totaal voor 2 personen.
// Links gaan naar de R1-dealpagina (zachte landing).

export const dealUrl = (permalink: string, query = "") => `${site}/first-release/deal/${permalink}${query}`;
const img = (id: string) => `https://asset.vialuxury.com/assets/${id}?key=card`;
const from = (price: string) => `Vanaf ${price} voor 2 personen`;

export const lauswolt: RowDeal = {
  hotelName: "Landgoed Lauswolt",
  stars: 5,
  place: "Beetsterzwaag",
  packageTitle: "Culinair verblijf in een luxe 5*-hotel in het prachtige Friesland",
  line: from("€429"),
  image: img("57455675-0f6e-4334-aaa2-bc3d1747f31f"),
  url: dealUrl("landgoed-lauswolt-geniet-van-5-sterren-luxe-in-de-bosrijke-omgeving-van-friesland-incl-culinair-diner"),
  includes: ["Champagne ontbijt", "3-Gangen-MICHELIN-diner", "Gebruik van wellness", "Valetparking"],
  discount: "-38%",
  price: "€429",
  original: "€690",
  priceFor: "2 personen, 1 nacht",
};

export const vanOys: RowDeal = {
  hotelName: "Van Oys Maastricht Retreat",
  stars: 5,
  place: "Eijsden",
  packageTitle: "Ervaar wereldklasse comfort in een 5* Superior hotel",
  line: from("€519"),
  image: img("57faa15d-2992-49ef-87b4-1ae26418a12f"),
  url: dealUrl("van-oys-maastricht-retreat-ervaar-wereldklasse-comfort-in-een-5-sterren-superior-hotel"),
  includes: ["Kamerupgrade", "Uitgebreid ontbijtbuffet", "4-Gangendiner in Restaurant MAES (MICHELIN gids)", "10 Min. rijafstand van het centrum van Maastricht"],
  discount: "-36%",
  price: "€519",
  original: "€808",
  priceFor: "2 personen, 1 nacht",
};

export const villaRuimzicht: RowDeal = {
  hotelName: "Hotel Villa Ruimzicht",
  stars: 4,
  place: "Doetinchem",
  packageTitle: "Culinair verblijf in een monumentale villa, incl. 4-gangendiner",
  line: from("€229"),
  image: img("8e9e4c45-ae41-49a5-be41-3ec8d6fc915c"),
  url: dealUrl("hotel-villa-ruimzicht-2-daags-verblijf-in-een-monumentale-villa-incl-4-gangendiner"),
  includes: ["Uitgebreid ontbijtbuffet", "4-Gangendiner", "Late check out", "Nabij Arnhem"],
  discount: "-40%",
  price: "€229",
  original: "€382",
  priceFor: "2 personen, 1 nacht",
};

export const steenenburg: RowDeal = {
  hotelName: "Kasteel Steenenburg",
  stars: 4,
  place: "Nieuwkuijk",
  packageTitle: "Culinair verblijf in een 4*-kasteelhotel op een prachtig landgoed, incl. 3-gangendiner",
  line: from("€249"),
  image: img("67fadf3c-0b73-4afa-9c44-9eebbf26ad8f"),
  url: dealUrl("kasteel-steenenburg-culinair-verblijf-in-middeleeuws-4-kasteelhotel-op-prachtig-landgoed"),
  includes: ["Uitgebreid ontbijtbuffet", "3-Gangendiner in Orangerie Steenenburg", "Gratis parkeren", "Onbeperkt toegang tot Safaripark Beekse Bergen"],
  discount: "-49%",
  price: "€249",
  original: "€489",
  priceFor: "2 personen, 1 nacht",
};

export const desIndes: RowDeal = {
  hotelName: "Hotel Des Indes",
  stars: 5,
  place: "Den Haag",
  packageTitle: "Verken en beleef Den Haag vanuit een luxe 5*-hotel, incl. 3-gangendiner",
  line: from("€499"),
  image: img("ec2bfd91-fc7d-4fa4-91b9-9fc61298b804"),
  url: dealUrl("hotel-des-indes-verken-en-beleef-den-haag-vanuit-luxe-5-hotel-incl-3-gangendiner"),
  includes: ["Kamerupgrade", "Dagelijks luxe ontbijt", "3-Gangendiner in de Lounge (dag van aankomst)", "Late check-out"],
  discount: "-47%",
  price: "€499",
  original: "€940",
  priceFor: "2 personen, 2 nachten",
};

export const voco: RowDeal = {
  hotelName: "voco® The Hague",
  stars: 4,
  place: "Den Haag",
  packageTitle: "Verblijf in het mooiste hotel van Nederland",
  line: from("€319"),
  image: img("37e3155c-a965-4518-b38e-b9e93483766f"),
  url: dealUrl("voco-the-hague-1-1-gratis-verblijf-in-het-mooiste-hotel-van-nederland"),
  includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner in Ultramarijn", "Welkomstattentie", "Late check-out"],
  discount: "-47%",
  price: "€319",
  original: "€601",
  priceFor: "2 personen, 2 nachten",
};

export const dePlesman: RowDeal = {
  hotelName: "Hotel De Plesman",
  stars: 4,
  place: "Den Haag",
  packageTitle: "Gloednieuw hotel in het voormalige KLM-hoofdkantoor, incl. 3-gangendiner",
  line: from("€309"),
  image: img("e14b892d-4bfd-423d-9789-4e36ca5599af"),
  url: dealUrl("de-plesman-openingsactie-beleef-den-haag-in-stijl-vanuit-een-nieuw-5-hotel-incl-3-gangendiner"),
  includes: ["Dagelijks ontbijtbuffet", "3-Gangendiner", "Gratis parkeren", "Voormalig kantoor van KLM"],
  discount: "-41%",
  price: "€309",
  original: "€526",
  priceFor: "2 personen, 2 nachten",
};

/** Een deal als afgerond verblijf: alleen hotel, plaats en dealtitel met de verblijfsdatums, zonder
 *  aanbod (prijs, korting, inclusies), zodat het de kale kaart blijft. */
export const asStay = (d: RowDeal, dates: string): RowDeal => ({
  hotelName: d.hotelName, stars: d.stars, place: d.place, packageTitle: d.packageTitle, image: d.image, url: d.url, line: dates,
});
