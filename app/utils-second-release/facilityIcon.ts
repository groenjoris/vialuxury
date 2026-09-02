/**
 * Facility label → local icon, for the Second Release deal/hotel pages.
 *
 * The deals data ships an `iconUrl` per amenity (a filled glyph on
 * asset.vialuxury.com), but those don't match this prototype's line-icon
 * set — and 47 labels share only 19 of them, so several facilities end up
 * with a generic icon. We ignore `iconUrl` here and match on the LABEL
 * instead, which lets "Sauna" get a spa icon and "Bowlingcentrum" a
 * bowling ball regardless of what the feed happened to attach.
 *
 * `deals-mapper.ts` is shared with Huisstijl / Northstar, so the
 * substitution deliberately lives here rather than in the mapper.
 *
 * ORDER MATTERS — first match wins, so negatives ("niet toegestaan",
 * "Geen lift") are listed before the concept they negate.
 */

const ICONS = '/icons/facilities/'

type Rule = { re: RegExp; icon: string }

const RULES: Rule[] = [
  // ── negatives first ──
  { re: /huisdieren\s+zijn\s+niet|geen\s+huisdieren/i, icon: 'not-allowed' },
  { re: /geen\s+lift/i, icon: 'not-allowed' },

  // ── concepts ──
  { re: /wifi|wi-fi|internet/i, icon: 'wifi' },
  { re: /parkeer|parkeren|garage/i, icon: 'parking' },
  { re: /laadpaal|laadpalen|laadstation|snellaad|e-?bikes?\s*oplaad/i, icon: 'ev-charging' },
  { re: /fietsverhuur|fietsenstalling|fiets/i, icon: 'bike' },
  { re: /fitness|sportschool|gym/i, icon: 'fitness' },
  { re: /zwembad|pool/i, icon: 'pool' },
  { re: /wellness|sauna|spa|beauty|massage|solarium|thermen/i, icon: 'wellness' },
  { re: /restaurant|brasserie|bistro|à-?la-?carte|a-?la-?carte|ontbijtruimte|diner/i, icon: 'restaurant' },
  { re: /\bbar\b|lounge|borrel/i, icon: 'bar' },
  { re: /mindervalide|toegankelijk|rolstoel/i, icon: 'accessibility' },
  { re: /\blift\b/i, icon: 'lift' },
  { re: /airconditioning|airco/i, icon: 'airco' },
  { re: /huisdier|hond/i, icon: 'pets' },
  { re: /extra\s+bed|kind|kinder|baby/i, icon: 'kids' },
  { re: /spelactiviteit|spellen|games/i, icon: 'games' },
  { re: /bowling/i, icon: 'bowling' },
  { re: /golf/i, icon: 'golf' },
  { re: /cashless|pinpas|credit\s*card/i, icon: 'cashless' },
  { re: /shuttle|receptie|bagage|concierge/i, icon: 'service' },
]

/**
 * Returns the local icon URL for a facility label, or `null` when nothing
 * matches — callers fall back to the green checkmark.
 */
export function facilityIcon(label: string | null | undefined): string | null {
  if (!label) return null
  const rule = RULES.find(r => r.re.test(label))
  return rule ? `${ICONS}${rule.icon}.svg` : null
}
