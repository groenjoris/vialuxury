/**
 * Prototype toggle: show/hide the "Samengesteld door" (Experience Creator)
 * card on the deal page. Switched from the footer; persists in localStorage
 * so the choice survives navigation + reloads. When hidden, the deal title
 * takes the full content width.
 */
const STORAGE_KEY = 'vl_sr_creator_card'

const showCreatorCard = ref(true)

export function useSecondReleaseCreatorCard() {
  function setShowCreatorCard(v: boolean) {
    showCreatorCard.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v ? '1' : '0') } catch { /* ignore */ }
    }
  }

  function restoreShowCreatorCard() {
    if (!import.meta.client) return
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s !== null) showCreatorCard.value = s === '1'
    } catch { /* ignore */ }
  }

  return { showCreatorCard, setShowCreatorCard, restoreShowCreatorCard }
}
