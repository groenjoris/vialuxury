<script setup lang="ts">
// Fake door-test "variabel reisgezelschap": in plaats van zoekresultaten alleen de melding dat er
// (nog) geen arrangementen zijn voor een oneven aantal personen en/of voor kinderen, met een
// e-mailveld: laat je e-mailadres achter, zodra we een passend aanbod hebben sturen we het je toe
// (een aparte lijst, niet de nieuwsbrief). Prototype: versturen toont alleen een bedankje.
import { useFirstReleaseFakeDoor } from '~/composables-first-release/useFirstReleaseFakeDoor'
import { useFirstReleaseI18n } from '~/composables-first-release/useFirstReleaseI18n'

const { t } = useFirstReleaseI18n()
const { adults, children } = useFirstReleaseFakeDoor()
const odd = computed(() => adults.value % 2 === 1)
const kids = computed(() => children.value.length > 0)
/** Vult {n} (aantal), {m} (aantal + 1) en {persons} (persoon/personen) in. */
const fill = (key: string) => t(key)
  .replace('{n}', String(adults.value))
  .replace('{m}', String(adults.value + 1))
  .replace('{persons}', adults.value === 1 ? t('common.personSingular') : t('common.personPlural'))
const title = computed(() => odd.value && kids.value ? fill('fakeDoor.titleBoth') : odd.value ? fill('fakeDoor.titleOdd') : t('fakeDoor.titleChildren'))
const paragraphs = computed(() => {
  const out: string[] = []
  if (odd.value) out.push(fill('fakeDoor.textOdd'))
  if (kids.value) out.push(odd.value ? t('fakeDoor.textChildrenAlso') : t('fakeDoor.textChildren'))
  return out
})

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
      <h1 class="fdn__title">{{ title }}</h1>
      <p v-for="p in paragraphs" :key="p" class="fdn__text">{{ p }}</p>

      <form v-if="!sent" class="fdn__form" @submit.prevent="submit">
        <label class="fdn__label" for="fdn-email">{{ t('fakeDoor.signupTitle') }}</label>
        <p class="fdn__signup-text">{{ t('fakeDoor.signupText') }}</p>
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
      <p v-else class="fdn__thanks">{{ t('fakeDoor.thanks').replace('{email}', email.trim()) }}</p>
    </div>
  </section>
</template>

<style scoped>
.fdn { padding: 40px 0 72px; }
.fdn__card { max-width: 640px; margin: 0 auto; padding: 32px 36px 36px; border: 1px solid var(--color-border); border-radius: 12px; background: #fff; }
.fdn__title { margin: 0 0 14px; font-family: var(--font-heading); font-size: 30px; font-weight: 700; line-height: 1.2; color: var(--color-text-primary); }
.fdn__text { margin: 0 0 10px; font-size: 16px; line-height: 1.55; color: var(--color-text-primary); }
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
