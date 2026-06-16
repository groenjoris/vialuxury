<template>
  <section class="why-section">
    <h2 v-if="heading" class="why-section__title">{{ heading }}</h2>

    <ul class="why-section__list">
      <li v-for="(item, index) in items" :key="index" class="why-section__item">
        <span class="why-section__check" aria-hidden="true">
          <span v-if="item.icon" class="why-section__icon">{{ item.icon }}</span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="5 12 10 17 19 7" />
          </svg>
        </span>
        <div class="why-section__copy">
          <span class="why-section__claim">{{ item.title }}</span>
          <span class="why-section__detail">{{ item.text }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface WhyItem {
  icon?: string
  title: string
  text: string
}

defineProps<{
  items: WhyItem[]
  heading?: string
}>()
</script>

<style scoped>
.why-section {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.why-section__title {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-lg);
  line-height: 1.2;
}

.why-section__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.why-section__item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 12px;
  align-items: start;
}

.why-section__check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(233, 113, 50, 0.12);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
}

.why-section__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.why-section__claim {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.why-section__detail {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.45;
}
</style>
