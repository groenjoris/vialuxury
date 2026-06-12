import { reactive } from 'vue'

/**
 * Session-wide favourites stored as a shared reactive Set of string ids,
 * persisted to localStorage so they survive reloads within the session.
 * Toggling simply adds/removes — there is no login or confirmation step.
 *
 * State is keyed by `storageKey`, so distinct keys yield independent,
 * isolated favourite sets (each with its own module-level cache).
 *
 * @param storageKey localStorage key under which favourites are persisted.
 *   Defaults to `'vl-favorites'`.
 * @returns `{ favorites, isFavorite, toggle }`.
 *
 * @example
 *   const { favorites, isFavorite, toggle } = useFavorites()
 *   toggle('hotel-slug')
 *   isFavorite('hotel-slug') // true
 */
interface FavoritesStore {
  favorites: Set<string>
  restored: boolean
}

const stores = new Map<string, FavoritesStore>()

function getStore(storageKey: string): FavoritesStore {
  let store = stores.get(storageKey)
  if (!store) {
    store = { favorites: reactive(new Set<string>()), restored: false }
    stores.set(storageKey, store)
  }
  return store
}

export function useFavorites(storageKey = 'vl-favorites') {
  const store = getStore(storageKey)
  const { favorites } = store

  function restore() {
    if (store.restored || !import.meta.client) return
    store.restored = true
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) (JSON.parse(raw) as string[]).forEach(s => favorites.add(s))
    } catch { /* ignore */ }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(storageKey, JSON.stringify([...favorites]))
    } catch { /* ignore */ }
  }

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
