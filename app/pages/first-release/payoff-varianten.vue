<template>
  <div class="payoff-page">
    <div class="payoff-page__intro container">
      <h1 class="payoff-page__title">Pay-off &amp; subtitel — 12 varianten (R1)</h1>
      <p class="payoff-page__lead">
        Bovenkant van de zoekresultatenpagina per variant. Pay-off onder het logo:
        <em>“{{ PAYOFF }}”</em> — altijd precies even breed als het logo. De subtitel
        onder de titel staat in hetzelfde font. Variant 1 is de huidige situatie.
      </p>
    </div>

    <section
      v-for="(v, i) in variants"
      :key="v.id"
      class="payoff-variant"
    >
      <div class="payoff-variant__label">
        <div class="container payoff-variant__label-inner">
          <span class="payoff-variant__num">Variant {{ i + 1 }}</span>
          <span class="payoff-variant__name">{{ v.name }}</span>
          <span v-if="v.badge" class="payoff-variant__badge" :class="`payoff-variant__badge--${v.badgeKind}`">{{ v.badge }}</span>
        </div>
      </div>

      <div class="payoff-variant__frame">
        <FirstReleaseSiteHeader
          :payoff="v.font ? PAYOFF : undefined"
          :payoff-font="v.font ?? undefined"
        />

        <!-- Replica of the upper part of /first-release/search: breadcrumbs,
             sidebar column (placeholder) + results header with title,
             subtitle and Trustpilot. -->
        <main class="payoff-variant__main">
          <section class="payoff-variant__breadcrumbs container">
            <FirstReleaseBreadcrumbNav :items="breadcrumbs" />
          </section>
          <div class="payoff-variant__grid container">
            <aside class="payoff-variant__sidebar" aria-hidden="true">
              <span>Kaart + filters</span>
            </aside>
            <div class="payoff-variant__results">
              <div class="payoff-variant__header-row">
                <div class="payoff-variant__header-text">
                  <h2 class="payoff-variant__title">82 arrangementen</h2>
                  <p
                    class="payoff-variant__usp"
                    :class="{ 'payoff-variant__usp--body': !v.font }"
                    :style="v.font ? { fontFamily: v.font } : undefined"
                  >{{ SUBTITLE }}</p>
                </div>
                <div class="payoff-variant__trust">
                  <img src="/images/trustpilot-27c88d.svg" alt="Trustpilot" class="payoff-variant__trust-logo" />
                  <span class="payoff-variant__trust-text">15.294 beoordelingen</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * Decision page for the R1 pay-off / subtitle font. Stacked copies of the
 * top of the search-results page, each with a different handwritten
 * candidate (Google Fonts) — plus the current state as variant 1.
 */
const PAYOFF = 'Zorgvuldig samengestelde hotelervaringen'
const SUBTITLE = 'Samengesteld door het ViaLuxury Team'

type Variant = {
  id: string
  name: string
  /** CSS font-family; null = no pay-off + body-font subtitle (current). */
  font: string | null
  badge?: string
  badgeKind?: 'current' | 'pick'
}

const variants: Variant[] = [
  { id: 'current', name: 'Geen pay-off · subtitel in Basis Grotesque', font: null, badge: 'Huidig', badgeKind: 'current' },
  { id: 'bad-script', name: 'Bad Script', font: "'Bad Script', cursive", badge: 'Aanbevolen', badgeKind: 'pick' },
  // Round 2 — same spirit as Bad Script: refined pen-cursive, readable,
  // not the usual suspects. (Round 1's casual/rough ones were dropped.)
  { id: 'over-the-rainbow', name: 'Over the Rainbow', font: "'Over the Rainbow', cursive" },
  { id: 'la-belle-aurore', name: 'La Belle Aurore', font: "'La Belle Aurore', cursive" },
  { id: 'zeyada', name: 'Zeyada', font: "'Zeyada', cursive" },
  { id: 'ruthie', name: 'Ruthie', font: "'Ruthie', cursive" },
  { id: 'sacramento', name: 'Sacramento', font: "'Sacramento', cursive" },
  { id: 'rouge-script', name: 'Rouge Script', font: "'Rouge Script', cursive" },
  { id: 'petit-formal-script', name: 'Petit Formal Script', font: "'Petit Formal Script', cursive" },
  { id: 'euphoria-script', name: 'Euphoria Script', font: "'Euphoria Script', cursive" },
  { id: 'meddon', name: 'Meddon', font: "'Meddon', cursive" },
  { id: 'grand-hotel', name: 'Grand Hotel', font: "'Grand Hotel', cursive" },
]

const breadcrumbs = [
  { label: 'Home', href: '/first-release/home' },
  { label: 'Arrangementen', href: '/first-release/search' },
]

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2'
  + '?family=Bad+Script'
  + '&family=Over+the+Rainbow'
  + '&family=La+Belle+Aurore'
  + '&family=Zeyada'
  + '&family=Ruthie'
  + '&family=Sacramento'
  + '&family=Rouge+Script'
  + '&family=Petit+Formal+Script'
  + '&family=Euphoria+Script'
  + '&family=Meddon'
  + '&family=Grand+Hotel'
  + '&display=swap'

useHead({
  title: 'Pay-off varianten | ViaLuxury R1',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: GOOGLE_FONTS },
  ],
})
</script>

<style scoped>
.payoff-page {
  background: var(--color-background);
  padding-bottom: var(--space-3xl);
}

.payoff-page__intro {
  padding: var(--space-xl) 0 var(--space-lg);
}
.payoff-page__title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text-primary);
}
.payoff-page__lead {
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  max-width: 720px;
  margin: 0;
}

/* Label band above each frame */
.payoff-variant__label {
  background: var(--color-background-secondary);
  border-top: 1px solid var(--color-border, #e5e2da);
  border-bottom: 1px solid var(--color-border, #e5e2da);
  margin-top: var(--space-xl);
}
.payoff-variant__label-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
}
.payoff-variant__num {
  font-weight: 600;
  color: var(--color-text-primary);
}
.payoff-variant__name {
  color: var(--color-text-secondary);
}
.payoff-variant__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
}
.payoff-variant__badge--current { color: var(--color-text-secondary); }
.payoff-variant__badge--pick { color: var(--color-primary); }

/* Frame = the search page's top, 1:1 in structure */
.payoff-variant__breadcrumbs {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-sm);
}
.payoff-variant__grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-xl);
  align-items: start;
}
.payoff-variant__sidebar {
  height: 120px;
  border: 1px dashed var(--color-border, #e5e2da);
  border-radius: var(--radius-md, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  background: var(--color-background-secondary);
}
.payoff-variant__header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-lg);
}
.payoff-variant__header-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.payoff-variant__title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
}
/* Handwritten subtitle (candidate font via inline style). */
.payoff-variant__usp {
  font-size: 24px;
  line-height: 1.1;
  color: var(--color-text-secondary);
  margin: 0;
  padding-right: 6px; /* room for cursive terminal flourishes */
}
/* Variant 1: body font, as live today. */
.payoff-variant__usp--body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.4;
  padding-right: 0;
}
.payoff-variant__trust {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.payoff-variant__trust-logo {
  height: 56px;
  width: auto;
  display: block;
}
.payoff-variant__trust-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

@media (max-width: 800px) {
  .payoff-variant__grid {
    grid-template-columns: 1fr;
  }
  .payoff-variant__sidebar,
  .payoff-variant__trust {
    display: none;
  }
  .payoff-variant__title {
    font-size: 24px;
  }
  .payoff-variant__usp {
    font-size: 20px;
  }
}
</style>
