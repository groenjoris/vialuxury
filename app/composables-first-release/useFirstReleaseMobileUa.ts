/**
 * First Release checkout — "zit de bezoeker op een telefoon?" op basis van de
 * user-agent, precies zoals middleware/fr-mobile.global.ts de checkoutstappen
 * datum/kamers naar de mobiele site omleidt. Server-side uit de request-header,
 * client-side uit navigator.userAgent; via useState zodat SSR en hydratie
 * dezelfde waarde zien. Gebruikt door de gegevensstap (één pagina voor beide)
 * om de mobiele kop en de eenkoloms-opmaak te tonen.
 */
export function useFirstReleaseMobileUa() {
  return useState<boolean>('fr-mobile-ua', () => {
    const ua = import.meta.server
      ? (useRequestHeaders(['user-agent'])['user-agent'] ?? '')
      : navigator.userAgent
    return /iPhone|iPod|Windows Phone|Android.*Mobile/i.test(ua)
  })
}
