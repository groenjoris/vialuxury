<template>
  <div
    class="creator-card"
    :class="{ 'creator-card--flipped': isFlipped }"
    @click="isFlipped = !isFlipped"
    @keydown.enter.prevent="isFlipped = !isFlipped"
    @keydown.space.prevent="isFlipped = !isFlipped"
    role="button"
    tabindex="0"
    :aria-pressed="isFlipped"
    :aria-label="t('deal.curatedBy') + ' ' + creator.name + ' — tap to flip'"
  >
    <div class="creator-card__inner">
      <!-- ── Front — horizontal: photo left, text right ── -->
      <article class="creator-card__face creator-card__face--front">
        <img
          :src="creator.photo"
          :alt="creator.name"
          class="creator-card__avatar"
        />
        <div class="creator-card__body">
          <p class="creator-card__lede">
            {{ t('deal.curatedBy') }}
            <span class="creator-card__name">{{ creator.name }}</span>
          </p>
          <div class="creator-card__field">
            <span class="creator-card__field-label">{{ t('deal.specialisation') }}:</span>
            <span class="creator-card__field-value">{{ creator.specialisation }}</span>
          </div>
        </div>
      </article>

      <!-- ── Back ── -->
      <article class="creator-card__face creator-card__face--back">
        <svg class="creator-card__quote-mark" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.4 7.5C6.4 8.7 4.5 11.2 4.5 14c0 1.7 1 3 2.6 3 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.3-2.2-2.3.2-1.7 1.6-3 3.4-3.8l-1.3-1zM18.4 7.5c-3 1.2-4.9 3.7-4.9 6.5 0 1.7 1 3 2.6 3 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.3-2.2-2.3.2-1.7 1.6-3 3.4-3.8l-1.3-1z" fill="currentColor" />
        </svg>
        <p class="creator-card__quote">"{{ creator.quote }}"</p>
        <p class="creator-card__signature">— {{ creator.name }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMember } from '~/data/team-members'

const { t } = useFirstReleaseI18n()

const props = defineProps<{ creator: TeamMember }>()

const isFlipped = ref(false)

/** "Zijn" / "Haar" — capitalised pronoun for the front-of-card line. */
const pronounCapitalised = computed(() =>
  props.creator.pronoun.charAt(0).toUpperCase() + props.creator.pronoun.slice(1),
)
</script>

<style scoped>
.creator-card {
  /* Fixed dimensions per spec: 286 × 110. The flip animation needs
     perspective on the containing element. */
  perspective: 900px;
  width: 286px;
  height: 110px;
  cursor: pointer;
  user-select: none;
  outline: none;
}

.creator-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 14px;
}

.creator-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.creator-card--flipped .creator-card__inner {
  transform: rotateY(180deg);
}

.creator-card__face {
  position: absolute;
  inset: 0;
  background: #fff;
  border: 1px solid var(--color-border-light, #ececec);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-sizing: border-box;
  overflow: hidden;
}

/* ── Front face — horizontal: photo left, text right ── */
.creator-card__face--front {
  display: flex;
  align-items: stretch;
  padding: 0;
}

.creator-card__avatar {
  /* Full-height photo on the left. The 14 px corner-radius hugs the
     card's outer radius on the left side. */
  width: 110px;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
  display: block;
}

.creator-card__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 14px;
}

.creator-card__lede {
  margin: 0;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary, #6a6a6a);
  line-height: 1.2;
}

.creator-card__name {
  display: block;
  font-family: 'Oooh Baby', cursive;
  font-weight: 400;
  font-size: 26px;
  color: var(--color-text-primary, #0e0e0c);
  line-height: 1;
  margin-top: 2px;
}

.creator-card__field {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 4px 0;
}

.creator-card__field-label {
  /* Match the "Samengesteld door" caption above the handwritten name. */
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-secondary, #6a6a6a);
  line-height: 1.2;
}

.creator-card__field-value {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary, #0e0e0c);
  line-height: 1.3;
}

.creator-card__score-line {
  margin: 0;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary, #6a6a6a);
  line-height: 1.3;
}

.creator-card__score {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-body);
}

/* ── Back ── */
.creator-card__face--back {
  transform: rotateY(180deg);
  background: linear-gradient(180deg, #fff 0%, #faf6ee 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 14px 16px;
}

.creator-card__quote-mark {
  color: var(--color-primary);
  opacity: 0.6;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.creator-card__quote {
  margin: 0;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 400;
  font-style: italic;
  color: var(--color-text-primary, #0e0e0c);
  line-height: 1.35;
  /* Cap to the available height; if quote is longer, ellipsis. */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.creator-card__signature {
  margin: 4px 0 0;
  font-family: 'Oooh Baby', cursive;
  font-size: 18px;
  color: var(--color-text-primary, #0e0e0c);
  line-height: 1;
}
</style>
