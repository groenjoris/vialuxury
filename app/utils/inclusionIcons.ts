/**
 * Maps inclusion text to an emoji icon based on keyword matching.
 * Used on search result cards for visual thumbnails next to checkmarks.
 */
export function getInclusionIcon(text: string): string {
  const lower = text.toLowerCase()

  // Overnight / room
  if (lower.includes('overnacht') || lower.includes('night') || lower.includes('kamer') || lower.includes('room')) return '🛏️'
  // Dinner
  if (lower.includes('diner') || lower.includes('dinner') || lower.includes('gangenmenu') || lower.includes('course')) return '🍽️'
  // Breakfast
  if (lower.includes('ontbijt') || lower.includes('breakfast')) return '🥐'
  // Lunch
  if (lower.includes('lunch')) return '🥗'
  // Wellness / spa
  if (lower.includes('wellness') || lower.includes('spa') || lower.includes('sauna')) return '🧖'
  // Pool / swimming
  if (lower.includes('zwembad') || lower.includes('pool') || lower.includes('zwem')) return '🏊'
  // Drinks / bubbles
  if (lower.includes('bubbel') || lower.includes('champagne') || lower.includes('prosecco') || lower.includes('drink') || lower.includes('borrel')) return '🥂'
  // Wine
  if (lower.includes('wijn') || lower.includes('wine')) return '🍷'
  // Coffee / tea
  if (lower.includes('koffie') || lower.includes('coffee') || lower.includes('thee') || lower.includes('tea')) return '☕'
  // Parking
  if (lower.includes('parking') || lower.includes('parkeer')) return '🅿️'
  // Bike / cycling
  if (lower.includes('fiets') || lower.includes('bike') || lower.includes('cycling')) return '🚲'
  // Hiking
  if (lower.includes('wandel') || lower.includes('hik')) return '🥾'
  // Late checkout
  if (lower.includes('late check') || lower.includes('uitslapen')) return '😴'
  // Gift / surprise
  if (lower.includes('cadeau') || lower.includes('gift') || lower.includes('verrassing') || lower.includes('surprise')) return '🎁'
  // Access / entry
  if (lower.includes('toegang') || lower.includes('access') || lower.includes('gebruik')) return '🎫'

  // Default
  return '✨'
}
