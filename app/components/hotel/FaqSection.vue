<template>
  <section class="faq-section">
    <h2>Heb je meer vragen?</h2>
    <div class="faq-list">
      <div
        v-for="item in faqItems"
        :key="item.id"
        class="faq-item"
        :class="{ 'faq-item--open': openId === item.id }"
      >
        <button class="faq-item__question" @click="toggle(item.id)">
          <span>{{ item.question }}</span>
          <span class="faq-item__arrow">{{ openId === item.id ? '−' : '+' }}</span>
        </button>
        <div v-if="openId === item.id" class="faq-item__answer">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FaqItem } from '~/types/hotel'

defineProps<{
  faqItems: FaqItem[]
}>()

const openId = ref<string | null>(null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<style scoped>
.faq-section {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.faq-section h2 {
  margin-bottom: var(--space-xl);
}

.faq-list {
  max-width: 700px;
}

.faq-item {
  border-bottom: 1px solid var(--color-border-light);
}

.faq-item__question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-md) 0;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  color: var(--color-text-primary);
}

.faq-item__question:hover {
  color: var(--color-primary);
}

.faq-item__arrow {
  font-size: 20px;
  font-weight: 300;
  flex-shrink: 0;
  margin-left: var(--space-md);
}

.faq-item__answer {
  padding-bottom: var(--space-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
