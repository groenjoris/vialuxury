/**
 * List of ~100 main Dutch cities and provinces for destination autosuggest.
 */
export interface DutchCity {
  name: string
  province: string
}

export const dutchCities: DutchCity[] = [
  // Noord-Holland
  { name: 'Amsterdam', province: 'Noord-Holland' },
  { name: 'Haarlem', province: 'Noord-Holland' },
  { name: 'Alkmaar', province: 'Noord-Holland' },
  { name: 'Zaandam', province: 'Noord-Holland' },
  { name: 'Hilversum', province: 'Noord-Holland' },
  { name: 'Hoorn', province: 'Noord-Holland' },
  { name: 'Den Helder', province: 'Noord-Holland' },
  { name: 'Purmerend', province: 'Noord-Holland' },
  { name: 'Amstelveen', province: 'Noord-Holland' },
  { name: 'Texel', province: 'Noord-Holland' },

  // Zuid-Holland
  { name: 'Rotterdam', province: 'Zuid-Holland' },
  { name: 'Den Haag', province: 'Zuid-Holland' },
  { name: 'Leiden', province: 'Zuid-Holland' },
  { name: 'Delft', province: 'Zuid-Holland' },
  { name: 'Dordrecht', province: 'Zuid-Holland' },
  { name: 'Gouda', province: 'Zuid-Holland' },
  { name: 'Scheveningen', province: 'Zuid-Holland' },
  { name: 'Noordwijk', province: 'Zuid-Holland' },
  { name: 'Katwijk', province: 'Zuid-Holland' },

  // Utrecht
  { name: 'Utrecht', province: 'Utrecht' },
  { name: 'Amersfoort', province: 'Utrecht' },
  { name: 'Zeist', province: 'Utrecht' },
  { name: 'Nieuwegein', province: 'Utrecht' },
  { name: 'Veenendaal', province: 'Utrecht' },

  // Noord-Brabant
  { name: 'Eindhoven', province: 'Noord-Brabant' },
  { name: 'Tilburg', province: 'Noord-Brabant' },
  { name: 'Breda', province: 'Noord-Brabant' },
  { name: "'s-Hertogenbosch", province: 'Noord-Brabant' },
  { name: 'Helmond', province: 'Noord-Brabant' },
  { name: 'Roosendaal', province: 'Noord-Brabant' },
  { name: 'Bergen op Zoom', province: 'Noord-Brabant' },
  { name: 'Oss', province: 'Noord-Brabant' },
  { name: 'Oisterwijk', province: 'Noord-Brabant' },

  // Limburg
  { name: 'Maastricht', province: 'Limburg' },
  { name: 'Venlo', province: 'Limburg' },
  { name: 'Heerlen', province: 'Limburg' },
  { name: 'Roermond', province: 'Limburg' },
  { name: 'Sittard', province: 'Limburg' },
  { name: 'Valkenburg', province: 'Limburg' },
  { name: 'Thorn', province: 'Limburg' },
  { name: 'Gulpen', province: 'Limburg' },
  { name: 'Vaals', province: 'Limburg' },

  // Gelderland
  { name: 'Arnhem', province: 'Gelderland' },
  { name: 'Nijmegen', province: 'Gelderland' },
  { name: 'Apeldoorn', province: 'Gelderland' },
  { name: 'Ede', province: 'Gelderland' },
  { name: 'Doetinchem', province: 'Gelderland' },
  { name: 'Zutphen', province: 'Gelderland' },
  { name: 'Wageningen', province: 'Gelderland' },
  { name: 'Harderwijk', province: 'Gelderland' },
  { name: 'Elburg', province: 'Gelderland' },
  { name: 'Otterlo', province: 'Gelderland' },

  // Overijssel
  { name: 'Zwolle', province: 'Overijssel' },
  { name: 'Enschede', province: 'Overijssel' },
  { name: 'Deventer', province: 'Overijssel' },
  { name: 'Hengelo', province: 'Overijssel' },
  { name: 'Almelo', province: 'Overijssel' },
  { name: 'Kampen', province: 'Overijssel' },
  { name: 'Giethoorn', province: 'Overijssel' },
  { name: 'Ootmarsum', province: 'Overijssel' },

  // Drenthe
  { name: 'Assen', province: 'Drenthe' },
  { name: 'Emmen', province: 'Drenthe' },
  { name: 'Hoogeveen', province: 'Drenthe' },
  { name: 'Meppel', province: 'Drenthe' },
  { name: 'Coevorden', province: 'Drenthe' },
  { name: 'Dwingelo', province: 'Drenthe' },

  // Friesland
  { name: 'Leeuwarden', province: 'Friesland' },
  { name: 'Sneek', province: 'Friesland' },
  { name: 'Heerenveen', province: 'Friesland' },
  { name: 'Harlingen', province: 'Friesland' },
  { name: 'Dokkum', province: 'Friesland' },
  { name: 'Terschelling', province: 'Friesland' },
  { name: 'Ameland', province: 'Friesland' },
  { name: 'Schiermonnikoog', province: 'Friesland' },

  // Groningen
  { name: 'Groningen', province: 'Groningen' },
  { name: 'Delfzijl', province: 'Groningen' },
  { name: 'Winschoten', province: 'Groningen' },

  // Flevoland
  { name: 'Almere', province: 'Flevoland' },
  { name: 'Lelystad', province: 'Flevoland' },
  { name: 'Urk', province: 'Flevoland' },

  // Zeeland
  { name: 'Middelburg', province: 'Zeeland' },
  { name: 'Vlissingen', province: 'Zeeland' },
  { name: 'Goes', province: 'Zeeland' },
  { name: 'Domburg', province: 'Zeeland' },
  { name: 'Renesse', province: 'Zeeland' },
  { name: 'Zierikzee', province: 'Zeeland' },
  { name: 'Cadzand', province: 'Zeeland' },
  { name: 'Veere', province: 'Zeeland' },
  { name: 'Sluis', province: 'Zeeland' },
]

/** All 12 Dutch provinces as searchable destinations */
export const dutchProvinces: string[] = [
  'Noord-Holland',
  'Zuid-Holland',
  'Utrecht',
  'Noord-Brabant',
  'Limburg',
  'Gelderland',
  'Overijssel',
  'Drenthe',
  'Friesland',
  'Groningen',
  'Flevoland',
  'Zeeland',
]
