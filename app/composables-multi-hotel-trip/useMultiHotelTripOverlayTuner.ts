/**
 * Multi Hotel Trip — TIJDELIJKE kaartlaag-tuner voor de dealcard-varianten
 * "Overlay" en "Inverse": kleur en dekking van land en water van het
 * routekaartje over de foto, live instelbaar (schuifjes onder de varianten-
 * schakelaar op de Rondreizen-zoekpagina). De waarden gaan als CSS-variabelen
 * op <html> (`--trm-overlay-land` enz.; zie TripRouteMap.vue) en worden in
 * localStorage bewaard. Zodra de definitieve waarden bekend zijn: overnemen in
 * TripRouteMap.vue en tuner + composable verwijderen.
 */
export type OverlayVariant = 'overlay' | 'inverse'
export interface OverlayTune { land: string; landAlpha: number; water: string; waterAlpha: number }

export const OVERLAY_TUNE_DEFAULTS: Record<OverlayVariant, OverlayTune> = {
  overlay: { land: '#f3efe6', landAlpha: 0.66, water: '#d7e6f0', waterAlpha: 0.55 },
  inverse: { land: '#00675f', landAlpha: 0.64, water: '#00464e', waterAlpha: 0.42 },
}

const STORAGE_KEY = 'vl_mht_overlay_tune'

export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const [r, g, b] = [m[1], m[2], m[3]].map(h => parseInt(h!, 16))
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`
}

function clone(): Record<OverlayVariant, OverlayTune> {
  return { overlay: { ...OVERLAY_TUNE_DEFAULTS.overlay }, inverse: { ...OVERLAY_TUNE_DEFAULTS.inverse } }
}

export function useMultiHotelTripOverlayTuner() {
  const tune = useState<Record<OverlayVariant, OverlayTune>>('mht-overlay-tune', clone)
  /** Kleurenkiezer zichtbaar? Schakelaar naast de variantenschakelaar; standaard uit. */
  const open = useState<boolean>('mht-overlay-tune-open', () => false)

  function apply() {
    if (!import.meta.client) return
    const st = document.documentElement.style
    for (const v of ['overlay', 'inverse'] as OverlayVariant[]) {
      st.setProperty(`--trm-${v}-land`, hexToRgba(tune.value[v].land, tune.value[v].landAlpha))
      st.setProperty(`--trm-${v}-water`, hexToRgba(tune.value[v].water, tune.value[v].waterAlpha))
    }
  }
  function persist() {
    if (!import.meta.client) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tune.value)) } catch { /* noop */ }
  }
  function reset(v: OverlayVariant) {
    tune.value[v] = { ...OVERLAY_TUNE_DEFAULTS[v] }
  }
  /** "land rgba(0, 103, 95, 0.64) · water rgba(0, 70, 78, 0.42)" — om over te nemen in de CSS. */
  function readout(v: OverlayVariant): string {
    const x = tune.value[v]
    return `land ${hexToRgba(x.land, x.landAlpha)} · water ${hexToRgba(x.water, x.waterAlpha)}`
  }

  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          for (const v of ['overlay', 'inverse'] as OverlayVariant[]) {
            if (parsed?.[v]) tune.value[v] = { ...OVERLAY_TUNE_DEFAULTS[v], ...parsed[v] }
          }
        }
      } catch { /* noop */ }
      apply()
    })
    watch(tune, () => { apply(); persist() }, { deep: true })
  }

  return { tune, open, reset, readout, apply }
}
