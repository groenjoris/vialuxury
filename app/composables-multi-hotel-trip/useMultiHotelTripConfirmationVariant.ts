/**
 * Multi Hotel Trip — variant van de bevestigingspagina na het boeken van een
 * vakantie (checkout/bevestiging), om aan de opdrachtgever te tonen (zwevende
 * schakelaar linksboven op die pagina). Alle drie volgen dezelfde opbouw uit
 * skills/How_to_design_thank_you_pages.md (bevestigen → vieren → verwachtingen
 * → vervolgstap → contact); ze verschillen in presentatie en in de manier
 * waarop de vervolgstap wordt aangeboden:
 *  - 'calm'    : "Rustig" — witte pagina, vinkje, samenvatting links en
 *                verwachtingen rechts; vervolgstap met een concreet voordeel
 *  - 'photo'   : "Beeld" — hoofdfoto van de reis als kop met de bevestiging
 *                erover, hotelfoto's in de samenvatting; vervolgstap met
 *                nieuwsgierigheid + sociaal bewijs
 *  - 'journey' : "Reis" — alles als één tijdlijn van vandaag tot thuiskomst
 *                (mails, documenten, hotels); vervolgstap als "nog één stap"
 * Keuze wordt in localStorage bewaard.
 */
export type ConfirmationVariant = 'calm' | 'photo' | 'journey'

export const CONFIRMATION_VARIANTS: { id: ConfirmationVariant; label: string }[] = [
  { id: 'calm', label: 'Rustig' },
  { id: 'photo', label: 'Beeld' },
  { id: 'journey', label: 'Reis' },
]

const STORAGE_KEY = 'vl_mht_confirmation_variant'

export function useMultiHotelTripConfirmationVariant() {
  const variant = useState<ConfirmationVariant>('mht-confirmation-variant', () => 'calm')

  // Na hydratie de bewaarde keuze terugzetten (alleen in een component-setup).
  if (import.meta.client && getCurrentInstance()) {
    onMounted(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'calm' || saved === 'photo' || saved === 'journey') variant.value = saved
      } catch { /* localStorage niet beschikbaar */ }
    })
  }

  function setVariant(v: ConfirmationVariant) {
    variant.value = v
    if (import.meta.client) {
      try { localStorage.setItem(STORAGE_KEY, v) } catch { /* noop */ }
    }
  }

  return { variant, setVariant }
}
