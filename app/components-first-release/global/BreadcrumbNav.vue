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
  /* Keep the row on a single line. The final item (= deal title)
     truncates with an ellipsis when it would overflow. */
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
}
.breadcrumb__item {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
/* Last item (= deal title) gets all remaining row space and
   ellipsizes its inner text. `display: block` on the <li> forces
   the inner inline-block span to inherit a constrained width so
   `text-overflow: ellipsis` actually fires. */
.breadcrumb__item:last-child {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: block;
}
.breadcrumb__item:last-child .breadcrumb__current,
.breadcrumb__item:last-child .breadcrumb__link {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
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
