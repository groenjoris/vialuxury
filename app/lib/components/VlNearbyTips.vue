<template>
  <section class="tips-section">
    <div class="tips-section__header">
      <h2 class="tips-section__title">{{ heading ?? 'In de buurt' }}</h2>
      <p v-if="hotelName" class="tips-section__subtitle">
        {{ tips.length }} tips in de buurt van {{ hotelName }}
      </p>
    </div>

    <div class="tips-section__grid">
      <div
        v-for="(tip, index) in tips"
        :key="tip.id ?? index"
        class="tip-card"
        :class="{ 'tip-card--active': openKey === keyFor(tip, index) }"
      >
        <div class="tip-card__image">
          <img :src="tip.image" :alt="tip.title" loading="lazy" />
        </div>

        <div class="tip-card__panel">
          <div class="tip-card__accent" />
          <h3 class="tip-card__panel-title">{{ tip.title }}</h3>
          <p class="tip-card__desc">{{ tip.description }}</p>
          <button
            type="button"
            class="tip-card__more"
            @click="toggle(keyFor(tip, index))"
          >
            {{ openKey === keyFor(tip, index) ? 'Lees minder' : 'Lees meer' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface NearbyTip {
  id?: string
  title: string
  description: string
  image: string
}

defineProps<{
  tips: NearbyTip[]
  hotelName?: string
  heading?: string
}>()

const openKey = ref<string | null>(null)

function keyFor(tip: NearbyTip, index: number): string {
  return tip.id ?? String(index)
}

function toggle(key: string) {
  openKey.value = openKey.value === key ? null : key
}
</script>

<style scoped>
.tips-section {
  position: relative;
  padding: var(--space-xl) var(--space-lg);
}
.tips-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-lg);
  right: var(--space-lg);
  height: 1px;
  background: var(--color-border-light);
}

.tips-section__header {
  text-align: left;
  margin-bottom: var(--space-md);
}

.tips-section__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.tips-section__subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Responsive grid of equal-width tip cards. */
.tips-section__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  align-items: start;
}

.tip-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.tip-card__image {
  position: relative;
  height: 200px;
  flex: 0 0 auto;
  overflow: hidden;
}

.tip-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tip-card:hover .tip-card__image img {
  transform: scale(1.04);
}

.tip-card__panel {
  flex: 1 1 auto;
  padding: var(--space-lg);
}

.tip-card__accent {
  width: 40px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  margin-bottom: var(--space-md);
}

.tip-card__panel-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.3;
}

.tip-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tip-card--active .tip-card__desc {
  -webkit-line-clamp: initial;
  overflow: visible;
}

.tip-card__more {
  align-self: flex-start;
  margin-top: var(--space-sm);
  padding: 0;
  background: none;
  border: 0;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.tip-card__more:hover {
  color: var(--color-primary-hover);
}

@media (max-width: 1024px) {
  .tip-card__image {
    height: 170px;
  }
  .tip-card__desc {
    font-size: 13px;
  }
}

@media (max-width: 800px) {
  .tips-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  .tips-section__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .tip-card__image {
    height: 160px;
  }
  .tip-card__image img {
    transform: none !important;
  }
}
</style>
