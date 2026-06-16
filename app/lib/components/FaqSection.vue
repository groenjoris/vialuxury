<template>
  <section class="faq-section">
    <h2 v-if="heading">{{ heading }}</h2>
    <div class="faq-list">
      <div
        v-for="(item, index) in items"
        :key="item.id ?? index"
        class="faq-item"
        :class="{ 'faq-item--open': openKey === keyFor(item, index) }"
      >
        <button class="faq-item__question" type="button" @click="toggle(keyFor(item, index))">
          <span>{{ item.question }}</span>
          <span class="faq-item__arrow">{{ openKey === keyFor(item, index) ? '−' : '+' }}</span>
        </button>
        <div v-if="openKey === keyFor(item, index)" class="faq-item__answer">
          <p>{{ item.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FaqItem {
  id?: string
  question: string
  answer: string
}

const props = defineProps<{
  items: FaqItem[]
  heading?: string
}>()

const openKey = ref<string | null>(null)

function keyFor(item: FaqItem, index: number): string {
  return item.id ?? String(index)
}

function toggle(key: string) {
  openKey.value = openKey.value === key ? null : key
}
</script>

<style scoped>
.faq-section {
  padding: var(--space-xl) 0;
  border-top: 1px solid var(--color-border);
}

.faq-section h2 {
  font-family: var(--font-heading);
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
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  color: var(--color-text-primary);
  background: none;
  border: 0;
  cursor: pointer;
}

/* Whole row (question text + the +/− glyph, which inherits this colour)
   turns orange on hover. By default the glyph is black. */
.faq-item__question:hover {
  color: var(--color-primary);
}

.faq-item__arrow {
  font-size: 20px;
  font-weight: 300;
  flex-shrink: 0;
  margin-left: var(--space-md);
  /* Inherit the question colour: black by default, orange on hover. */
  color: inherit;
}

.faq-item__answer {
  padding-bottom: var(--space-md);
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.faq-item__answer p {
  margin: 0;
}
</style>
