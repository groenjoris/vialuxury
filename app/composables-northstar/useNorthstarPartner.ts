/**
 * Co-branded session state for the user test.
 * When a tester arrives via the nu.nl ad mockup, we set partner='nu' so the
 * SiteHeader can render the partner logo. State is persisted in sessionStorage
 * so the badge survives a refresh; closing the tab clears it.
 */
type Partner = 'nu' | null

const STORAGE_KEY = 'vl_ns_partner'

export function useNorthstarPartner() {
  const partner = useState<Partner>('partner', () => null)

  function set(p: Partner) {
    partner.value = p
    if (import.meta.client) {
      if (p) sessionStorage.setItem(STORAGE_KEY, p)
      else sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  function clear() {
    set(null)
  }

  /** Read the flag from sessionStorage on the client; safe to call repeatedly. */
  function restore() {
    if (import.meta.client) {
      const v = sessionStorage.getItem(STORAGE_KEY) as Partner
      if (v && partner.value !== v) partner.value = v
    }
  }

  return { partner, set, clear, restore }
}
