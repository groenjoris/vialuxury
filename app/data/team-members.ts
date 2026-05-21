/**
 * First-Release team members ("Experience Makers").
 *
 * Used as:
 *  - Avatar row on `/first-release/search` (hover-tooltip team strip).
 *  - Deal-page Experience Creator business card (v6, picked by slug).
 *
 * Promoted to a shared module so both consumers reference one source.
 */
export interface TeamMember {
  name: string
  initials: string
  photo: string
  role: string
  /** Long-form role used in the search-page tooltip. */
  score: string
  /** Possessive pronoun for the "<pronoun> experiences scoren …" line. */
  pronoun: 'zijn' | 'haar'
  /** Average experience score shown on the creator card (e.g. "9.8"). */
  avgScore: string
  /** Short specialisation phrase for the card front (max ~30 chars). */
  specialisation: string
  /** First-person quote shown on the back of the card. */
  quote: string
}

export const teamMembers: readonly TeamMember[] = [
  {
    name: 'Yvette',
    initials: 'YV',
    photo: '/images/yvette.jpeg',
    role: '15 jaar Experience Maker bij ViaLuxury',
    score: 'Gemiddelde score voor haar experiences: 9.8',
    pronoun: 'haar',
    avgScore: '9.8',
    specialisation: 'Hotels met een verhaal',
    quote: 'Een goed hotel verzin je niet aan een bureau — dat ontdek je ter plekke, soms op de meest onverwachte plaatsen.',
  },
  {
    name: 'Jan',
    initials: 'JA',
    photo: '/images/team/jan.avif',
    role: 'Gespecialiseerd in oude kastelen en landgoederen',
    score: 'Gemiddelde score voor zijn experiences: 9.6',
    pronoun: 'zijn',
    avgScore: '9.6',
    specialisation: 'Kastelen en landgoederen',
    quote: 'We reden hier eigenlijk toevallig langs, maar zijn meteen omgekeerd. Soms zie je een plek en weet je het direct: dit hoort bij ViaLuxury.',
  },
  {
    name: 'Anoeska',
    initials: 'AN',
    photo: '/images/team/anoeska.jpeg',
    role: 'Onze België-kenner — van de Ardennen tot de kust',
    score: 'Gemiddelde score voor haar experiences: 9.7',
    pronoun: 'haar',
    avgScore: '9.7',
    specialisation: 'De Ardennen en de Belgische kust',
    quote: 'In België zit de magie in de details — een ontbijt op het terras, een wandeling door het bos achter het hotel, een wijnkaart die je nergens anders vindt.',
  },
  {
    name: 'Alyssa',
    initials: 'AL',
    photo: '/images/team/alyssa.jpeg',
    role: 'Specialist wellness & romantische weekendjes',
    score: 'Gemiddelde score voor haar experiences: 9.5',
    pronoun: 'haar',
    avgScore: '9.5',
    specialisation: 'Wellness en romantiek',
    quote: 'De beste wellness-adresjes komen niet uit een gids. Die deel je fluisterend met de mensen die er ook van houden.',
  },
  {
    name: 'Esther',
    initials: 'ES',
    photo: '/images/team/esther.jpeg',
    role: 'Culinaire hotspots en stedentrips',
    score: 'Gemiddelde score voor haar experiences: 9.4',
    pronoun: 'haar',
    avgScore: '9.4',
    specialisation: 'Culinaire stedentrips',
    quote: 'Een hotel kies ik altijd op de plek waar je ontbijt. Dáár begint je dag — en dáár voel je of een hotel z’n gasten echt kent.',
  },
] as const

/**
 * Deterministic team-member pick from a deal slug.
 *
 * Same slug → same creator across reloads / sessions. Used by the
 * v6 deal page to surface "Samengesteld door …" without storing a
 * creator on every mocked deal.
 */
export function creatorForSlug(dealSlug: string): TeamMember {
  let hash = 0
  for (let i = 0; i < dealSlug.length; i++) {
    hash = (hash * 31 + dealSlug.charCodeAt(i)) | 0
  }
  const idx = Math.abs(hash) % teamMembers.length
  return teamMembers[idx]!
}
