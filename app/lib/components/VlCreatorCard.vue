<template>
  <div
    class="creator-card"
    :class="{ 'creator-card--flipped': flippable && isFlipped }"
    :role="flippable ? 'button' : undefined"
    :tabindex="flippable ? 0 : undefined"
    :aria-pressed="flippable ? isFlipped : undefined"
    :aria-label="flippable ? `Samengesteld door ${name} — tik om te draaien` : undefined"
    @click="flip"
    @keydown.enter.prevent="flip"
    @keydown.space.prevent="flip"
  >
    <div class="creator-card__inner">
      <!-- Front — photo left, text right -->
      <article class="creator-card__face creator-card__face--front">
        <img :src="photo" :alt="name" class="creator-card__avatar" />
        <div class="creator-card__body">
          <p class="creator-card__lede">
            Samengesteld door
            <span class="creator-card__name">{{ name }}</span>
          </p>
          <div class="creator-card__field">
            <span class="creator-card__field-label">Specialisatie:</span>
            <span class="creator-card__field-value">{{ specialty }}</span>
          </div>
          <p v-if="score" class="creator-card__score-line">
            Beoordeling: <span class="creator-card__score">{{ score }}</span>
          </p>
        </div>
      </article>

      <!-- Back — bio quote (only rendered when a bio is supplied) -->
      <article v-if="flippable" class="creator-card__face creator-card__face--back">
        <svg class="creator-card__quote-mark" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.4 7.5C6.4 8.7 4.5 11.2 4.5 14c0 1.7 1 3 2.6 3 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.3-2.2-2.3.2-1.7 1.6-3 3.4-3.8l-1.3-1zM18.4 7.5c-3 1.2-4.9 3.7-4.9 6.5 0 1.7 1 3 2.6 3 1.4 0 2.4-1 2.4-2.4 0-1.3-.9-2.3-2.2-2.3.2-1.7 1.6-3 3.4-3.8l-1.3-1z" fill="currentColor" />
        </svg>
        <p class="creator-card__quote">"{{ bio }}"</p>
        <p class="creator-card__signature">— {{ name }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  photo: string
  specialty: string
  bio?: string
  score?: string
}>()

const isFlipped = ref(false)

const flippable = computed(() => Boolean(props.bio))

function flip() {
  if (!flippable.value) return
  isFlipped.value = !isFlipped.value
}
</script>

<style scoped>
.creator-card {
  perspective: 900px;
  width: 286px;
  height: 110px;
  user-select: none;
  outline: none;
}

.creator-card[role='button'] {
  cursor: pointer;
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
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
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
  box-shadow: var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.06));
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  box-sizing: border-box;
  overflow: hidden;
}

/* Front face — photo left, text right */
.creator-card__face--front {
  display: flex;
  align-items: center;
  padding: 0 0 0 12px;
  gap: 12px;
}

.creator-card__avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.creator-card__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
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
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 22px;
  color: var(--color-text-primary, #1a1a1a);
  line-height: 1.05;
  margin-top: 2px;
}

.creator-card__field {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.creator-card__field-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary, #6a6a6a);
  line-height: 1.2;
}

.creator-card__field-value {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary, #1a1a1a);
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

/* Back face */
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
  color: var(--color-text-primary, #1a1a1a);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.creator-card__signature {
  margin: 4px 0 0;
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--color-text-primary, #1a1a1a);
  line-height: 1;
}

@media (max-width: 800px) {
  .creator-card {
    width: 100%;
    height: 150px;
  }
  .creator-card__avatar {
    width: 116px;
    height: 116px;
  }
  .creator-card__lede,
  .creator-card__field-label,
  .creator-card__score-line {
    font-size: 14px;
  }
  .creator-card__name {
    font-size: 28px;
  }
  .creator-card__field-value {
    font-size: 15px;
  }
  .creator-card__score {
    font-size: 16px;
  }
}
</style>
