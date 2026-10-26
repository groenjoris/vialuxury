<script setup lang="ts">
// Multi Hotel Trip — "Mijn ViaLuxury" (accountomgeving): sitekop zonder zoekbalk (wel de
// navigatie en het hamburgermenu), links het accountmenu, rechts de inhoud, de uitgebreide
// sitefooter eronder. Alleen "Boekingen" is in het prototype uitgewerkt; de overige items zijn
// placeholders.
defineProps<{ active?: 'mijn' | 'boekingen' | 'gegevens' | 'favorieten' }>()

const items = [
  { id: 'mijn', label: 'Mijn ViaLuxury', to: '/mvp-trip/account/boekingen', icon: 'user' },
  { id: 'boekingen', label: 'Boekingen', to: '/mvp-trip/account/boekingen', icon: 'bag' },
  { id: 'gegevens', label: 'Gegevens & voorkeuren', icon: 'gear' },
  { id: 'favorieten', label: 'Favorieten', icon: 'heart' },
  { id: 'uitloggen', label: 'Uitloggen', icon: 'logout' },
] as const
</script>

<template>
  <div class="acc">
    <MvpTripSiteHeader hide-search-dock />
    <MvpTripFlowLink />

    <div class="container acc__main">
      <nav class="acc__nav" aria-label="Mijn ViaLuxury">
        <ul class="acc__list">
          <li v-for="item in items" :key="item.id">
            <component
              :is="'to' in item ? 'NuxtLink' : 'a'"
              class="acc__item"
              :class="{ 'acc__item--on': item.id === active }"
              v-bind="'to' in item ? { to: item.to } : { href: '#' }"
              :aria-current="item.id === active ? 'page' : undefined"
              @click="'to' in item ? undefined : $event.preventDefault()"
            >
              <svg v-if="item.icon === 'user'" class="acc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
              <svg v-else-if="item.icon === 'bag'" class="acc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18" /></svg>
              <svg v-else-if="item.icon === 'gear'" class="acc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
              <svg v-else-if="item.icon === 'heart'" class="acc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
              <svg v-else class="acc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              <span>{{ item.label }}</span>
            </component>
          </li>
        </ul>
      </nav>
      <section class="acc__content">
        <slot />
      </section>
    </div>

    <MvpTripSiteFooter />
  </div>
</template>

<style scoped>
.acc { position: relative; min-height: 100vh; display: flex; flex-direction: column; background: #fff; color: var(--color-text-primary); }
/* Zonder zoekbalk hoeft de kop geen ruimte voor de uitstekende balk te reserveren. */
.acc :deep(.site-header) { padding-bottom: 0; margin-bottom: 0; }
.acc__main { flex: 1; width: 100%; display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 56px; padding-top: 56px; padding-bottom: 80px; }
.acc__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.acc__item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-left: 3px solid transparent; border-radius: 0 8px 8px 0; color: var(--color-text-primary); text-decoration: none; font-size: 16px; transition: background var(--transition-fast), color var(--transition-fast); }
.acc__item:hover { background: #f7f7f7; }
.acc__item--on { border-left-color: var(--color-primary); color: var(--color-primary); font-weight: 600; }
.acc__icon { flex-shrink: 0; width: 20px; height: 20px; }
/* min-width: 0 — anders rekt het (scrollende) menu de kolom op tot zijn volle breedte op mobiel. */
.acc__nav, .acc__content { min-width: 0; }

@media (max-width: 900px) {
  .acc__main { grid-template-columns: minmax(0, 1fr); gap: 24px; padding-top: 24px; padding-bottom: 48px; }
  .acc__list { flex-direction: row; overflow-x: auto; gap: 4px; padding-bottom: 4px; }
  .acc__item { border-left: 0; border-bottom: 3px solid transparent; border-radius: 8px 8px 0 0; padding: 10px 12px; font-size: 14px; white-space: nowrap; }
  .acc__item--on { border-bottom-color: var(--color-primary); }
}
</style>
