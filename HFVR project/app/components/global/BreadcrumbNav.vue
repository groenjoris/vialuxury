<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb__list">
      <li v-for="(item, index) in items" :key="index" class="breadcrumb__item">
        <NuxtLink v-if="item.href" :to="item.href" class="breadcrumb__link">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="breadcrumb__current" aria-current="page">
          {{ item.label }}
        </span>
        <span v-if="index < items.length - 1" class="breadcrumb__separator">❯</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  href?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 13px;
}

.breadcrumb__link {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.breadcrumb__link:hover {
  color: var(--color-primary);
}

.breadcrumb__current {
  color: var(--color-text-muted);
}

.breadcrumb__separator {
  color: var(--color-text-muted);
  font-size: 10px;
}
</style>
