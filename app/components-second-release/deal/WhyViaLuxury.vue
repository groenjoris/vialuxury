<template>
  <section class="why-vialuxury container">
    <h2 class="why-vialuxury__title">Waarom boeken bij ViaLuxury</h2>

    <div class="why-vialuxury__grid">
      <div class="why-vialuxury__body">
        <p class="why-vialuxury__intro">
          ViaLuxury stelt persoonlijk deals samen, die verder gaan dan
          alleen een hotel.
        </p>
        <p class="why-vialuxury__intro">
          Wanneer je de onderdelen los boekt, dan ben je niet alleen veel
          meer tijd kwijt, maar ook veel duurder uit.
        </p>

        <ul class="why-vialuxury__list">
          <li v-for="point in points" :key="point.title" class="why-vialuxury__item">
            <span class="why-vialuxury__check" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </span>
            <div class="why-vialuxury__copy">
              <span class="why-vialuxury__claim">{{ point.title }}</span>
              <span class="why-vialuxury__detail">{{ point.detail }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="why-vialuxury__photo">
        <!-- Vite-bundled team photo. Drop replacements in
             `app/assets/images/teams/`. -->
        <img
          :src="teamPhoto"
          alt="Het ViaLuxury team"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/** Team photo — Vite-imported from `app/assets/images/teams/` so the
 *  bundled URL is generated at build time. Drop additional team
 *  photos in that folder and swap this import to swap the picture. */
import teamPhoto from '~/assets/images/teams/team.avif'

const points = [
  {
    title: 'Zorgvuldig geselecteerde deals',
    detail: 'Alleen hotels die de moeite waard zijn, met arrangementen die écht iets toevoegen.',
  },
  {
    title: 'Elk hotel persoonlijk gecheckt',
    detail: 'Onze Experience Makers slapen er zelf voor het op de site komt.',
  },
  {
    title: 'Uitstekende klantenservice',
    detail: 'Echte mensen aan de telefoon, met hotelkennis uit eerste hand.',
  },
  {
    title: 'Altijd bereikbaar',
    detail: "Vragen op je vrije zondag? Wij zijn er, ook 's avonds en in het weekend.",
  },
  {
    title: 'Tevreden klanten',
    detail: 'Gemiddeld een 9.5 op Trustpilot, met meer dan 15.000 beoordelingen.',
  },
]
</script>

<style scoped>
.why-vialuxury {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.why-vialuxury__title {
  /* Match `.section-title` used on "Hotel faciliteiten" et al. */
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-lg);
  line-height: 1.2;
}

/* 50 / 50 split across the full container — photo and text columns
   each take half the width. */
.why-vialuxury__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: stretch;
}

.why-vialuxury__photo {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #f5f5f5;
  /* Height follows the text column so the picture stretches to the
     full block height, avoiding a short/tall mismatch. */
  height: 100%;
  min-height: 320px;
}

.why-vialuxury__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.why-vialuxury__body {
  display: flex;
  flex-direction: column;
  /* Plain text on white (no grey card): top-aligned with the photo and
     left-aligned with the section title (no padding, so it sits at the
     column's left edge). */
  justify-content: flex-start;
  gap: var(--space-md);
}

.why-vialuxury__intro {
  margin: 0;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.55;
}

.why-vialuxury__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.why-vialuxury__item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
}

.why-vialuxury__check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(233, 113, 50, 0.12);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.why-vialuxury__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.why-vialuxury__claim {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.why-vialuxury__detail {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.45;
}

@media (max-width: 800px) {
  .why-vialuxury__grid {
    grid-template-columns: 1fr;
  }
  /* Photo renders FIRST on mobile (above the body copy) — desktop
     keeps the side-by-side body-left / photo-right layout.
     Drop the desktop min-height + grey background so there's no
     empty grey band visible under the image on narrow viewports. */
  .why-vialuxury__photo {
    order: -1;
    max-width: 100%;
    min-height: 0;
    height: auto;
    background: transparent;
  }
  .why-vialuxury__photo img {
    aspect-ratio: 16 / 9;
    height: auto;
    object-fit: cover;
  }
}
</style>
