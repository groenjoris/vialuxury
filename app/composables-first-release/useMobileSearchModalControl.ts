/**
 * Shared control for the mobile search modal.
 *
 * The modal itself is mounted once inside `SiteHeader.vue` (so its
 * extensive prop wiring stays in one place). Any other page can
 * open / close it through this module-level singleton without
 * re-mounting a second instance.
 *
 * Used by:
 *   - SiteHeader.vue → binds the modal's `:open` and `@close`.
 *   - MobileSearchSummary.vue (search page) → calls `open()` when the
 *     user taps the summary bar.
 *
 * Also exposes `searchNavInProgress`: a module-level flag flipped to
 * `true` by `commitSearch()` while a navigation away from the
 * current page is in flight. The deal page's `store.queryParams`
 * watcher reads this so it doesn't fire a competing
 * `router.replace` (which would re-assert the deal URL and cancel
 * the search-results navigation).
 */
import { ref } from 'vue'

const isOpen = ref(false)
const searchNavInProgress = ref(false)

export function useMobileSearchModalControl() {
  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}

export function useSearchNavLock() {
  return {
    searchNavInProgress,
    begin: () => { searchNavInProgress.value = true },
    end: () => { searchNavInProgress.value = false },
  }
}
