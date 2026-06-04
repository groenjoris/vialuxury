import { reactive } from 'vue'

/**
 * Session-wide favourites for the First Release prototype. A module-level
 * reactive Set of hotel/deal slugs, shared across every card, the deal /
 * hotel pages and the map sidebar, and persisted to localStorage so it
 * survives reloads within the session. Tapping a heart just toggles —
 * NO login popup.
 */
const STORAGE_KEY = 'vl_fr_favorites'
const favorites = reactive(new Set<string>())
let restored = false

function restore() {
  if (restored || !import.meta.client) return
  restored = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) (JSON.parse(raw) as string[]).forEach(s => favorites.add(s))
  } catch { /* ignore */ }
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]))
  } catch { /* ignore */ }
}

export function useFirstReleaseFavorites() {
  restore()

  function isFavorite(id: string | undefined | null): boolean {
    return !!id && favorites.has(id)
  }

  function toggle(id: string | undefined | null) {
    if (!id) return
    if (favorites.has(id)) favorites.delete(id)
    else favorites.add(id)
    persist()
  }

  return { favorites, isFavorite, toggle }
}
