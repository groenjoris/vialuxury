<script setup lang="ts">
// Fake door-test "variabel reisgezelschap": in plaats van zoekresultaten alleen de melding dat er
// (nog) geen arrangement is voor een oneven aantal volwassenen en/of voor kinderen, met een
// e-mailveld: laat je e-mailadres achter, zodra we het hebben mailen we je (alleen dat mailtje,
// niet de nieuwsbrief). Prototype: versturen toont alleen een bedankje.
// Toon: kop echoot de keuze uit de personenselector ("Voor 3 volwassenen en 1 kind …", zachte
// landing), daaronder in één zin de reden, en bij een oneven aantal zonder kinderen een echte
// uitweg: "Zoek dan voor 4 volwassenen" (link) met de eerlijke consequentie erbij.
import { useFirstReleaseFakeDoor } from '~/composables-first-release/useFirstReleaseFakeDoor'
import { useFirstReleaseI18n } from '~/composables-first-release/useFirstReleaseI18n'
import { useFirstReleaseSearchState } from '~/composables-first-release/useFirstReleaseSearchState'

const { t } = useFirstReleaseI18n()
const { adults, children, setGroup } = useFirstReleaseFakeDoor()
const { setSearchGroup } = useFirstReleaseSearchState()
const odd = computed(() => adults.value % 2 === 1)
const kids = computed(() => children.value.length)
/** Het eerstvolgende even aantal volwassenen (3 → 4, 1 → 2). */
const even = computed(() => adults.value + 1)
/** "3 volwassenen en 1 kind" — precies wat in de personenselector staat. */
const sel = computed(() => {
  const a = adults.value
  const parts = [`${a} ${a === 1 ? t('fakeDoor.selAdultSingular') : t('fakeDoor.selAdultPlural')}`]
  if (kids.value) parts.push(`${kids.value} ${kids.value === 1 ? t('common.childSingular') : t('common.childPlural')}`)
  return parts.join(` ${t('fakeDoor.and')} `)
})
/** Vult {sel} (reisgezelschap) en {m} (even aantal) in. */
const fill = (key: string) => t(key).replace('{sel}', sel.value).replace('{m}', String(even.value))
const reason = computed(() => odd.value && kids.value ? t('fakeDoor.textBoth') : odd.value ? t('fakeDoor.textOdd') : t('fakeDoor.textChildren'))
/** Uitweg alleen bij een oneven aantal zonder kinderen: voor kinderen is er (nog) niets. */
const showAlt = computed(() => odd.value && !kids.value)
function searchEven() {
  const a = even.value
  setGroup(a, [])
  setSearchGroup(a, a / 2)
}

const email = ref('')
const sent = ref(false)
function submit() {
  if (!email.value.trim()) return
  sent.value = true
}
</script>

<template>
  <section class="fdn" aria-live="polite">
    <div class="fdn__card">
      <h1 class="fdn__title">{{ fill('fakeDoor.title') }}</h1>
      <p class="fdn__text">
        {{ reason }}
        <template v-if="showAlt">
          {{ t('fakeDoor.altIntro') }}
          <button type="button" class="fdn__link" @click="searchEven">{{ fill('fakeDoor.altLink') }}</button>. {{ t('fakeDoor.altNote') }}
        </template>
      </p>

      <form v-if="!sent" class="fdn__form" @submit.prevent="submit">
        <label class="fdn__label" for="fdn-email">{{ t('fakeDoor.signupTitle') }}</label>
        <p class="fdn__signup-text">{{ fill('fakeDoor.signupText') }}</p>
        <div class="fdn__row">
          <input
            id="fdn-email"
            v-model="email"
            class="fdn__input"
            type="email"
            required
            autocomplete="email"
            :placeholder="t('fakeDoor.emailPlaceholder')"
          />
          <button type="submit" class="fdn__btn">{{ t('fakeDoor.submit') }}</button>
        </div>
      </form>
      <p v-else class="fdn__thanks">{{ fill('fakeDoor.thanks').replace('{email}', email.trim()) }}</p>
    </div>
  </section>
</template>

<style scoped>
.fdn { padding: 40px 0 72px; }
.fdn__card { max-width: 640px; margin: 0 auto; padding: 32px 36px 36px; border: 1px solid var(--color-border); border-radius: 12px; background: #fff; }
.fdn__title { margin: 0 0 14px; font-family: var(--font-heading); font-size: 30px; font-weight: 700; line-height: 1.2; color: var(--color-text-primary); }
.fdn__text { margin: 0 0 10px; font-size: 16px; line-height: 1.55; color: var(--color-text-primary); }
.fdn__link { padding: 0; border: 0; background: none; font: inherit; color: inherit; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; transition: color var(--transition-fast); }
.fdn__link:hover { color: var(--color-primary); }
.fdn__form { margin-top: 26px; padding-top: 22px; border-top: 1px solid var(--color-border); }
.fdn__label { display: block; margin: 0 0 4px; font-size: 17px; font-weight: 700; }
.fdn__signup-text { margin: 0 0 14px; font-size: 15px; line-height: 1.5; color: var(--color-text-secondary); }
.fdn__row { display: flex; align-items: stretch; gap: 8px; }
.fdn__input { flex: 1; min-width: 0; height: 46px; padding: 0 14px; border: 1px solid #c9c9c9; border-radius: var(--radius-md); background: #fff; font-family: var(--font-body); font-size: 15px; color: var(--color-text-primary); }
.fdn__input::placeholder { color: #9a9a9a; }
.fdn__input:focus { outline: none; border-color: rgba(26, 26, 26, 0.6); }
.fdn__btn { flex-shrink: 0; height: 46px; padding: 0 20px; border: 0; border-radius: var(--radius-md); background: var(--color-primary); color: #fff; font-family: var(--font-body); font-size: 15px; font-weight: 700; cursor: pointer; transition: background var(--transition-fast); }
.fdn__btn:hover { background: var(--color-primary-hover); }
.fdn__thanks { margin: 26px 0 0; padding: 14px 16px; border-radius: var(--radius-md); background: #e4f5ec; color: #1f7a4d; font-size: 15px; font-weight: 600; line-height: 1.5; }

@media (max-width: 800px) {
  .fdn { padding: 20px 0 48px; }
  .fdn__card { padding: 22px 20px 24px; }
  .fdn__title { font-size: 24px; }
  .fdn__row { flex-direction: column; }
}
</style>
