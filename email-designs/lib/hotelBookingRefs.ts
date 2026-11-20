// Hotelboekingsnummer (10 cijfers) per voorbeeldhotel: elk hotel heeft zijn eigen nummer (demo; dezelfde
// nummers als app/utils-*/bookingRef.ts). Staat op de bevestigingspagina en in de bevestigings-, pre-travel-
// en incheckmails.
export const HOTEL_BOOKING_REFS: Record<string, string> = {
  "Château Tilques": "4837201956",
  "Château Cléry": "7291048365",
  "Hotel Royal Beaulaincourt": "1568039274",
  "Hotel Wapen van Delden": "9024617385",
  "Hotel de Zwaan": "3376185920",
  "Landhuishotel Herikerberg": "6150932847",
};
export const hotelBookingRef = (hotelName: string) => HOTEL_BOOKING_REFS[hotelName] ?? "0000000000";
