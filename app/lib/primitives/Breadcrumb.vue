<template>
  <nav class="vl-breadcrumb" aria-label="Breadcrumb">
    <ol class="vl-breadcrumb__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="vl-breadcrumb__item"
      >
        <a
          v-if="item.href"
          :href="item.href"
          class="vl-breadcrumb__link"
        >{{ item.label }}</a>
        <span
          v-else
          class="vl-breadcrumb__current"
          aria-current="page"
        >{{ item.label }}</span>
        <span
          v-if="index < items.length - 1"
          class="vl-breadcrumb__separator"
          aria-hidden="true"
        >❯</span>
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
.vl-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-body);
  font-size: 13px;
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

.vl-breadcrumb__item {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

/* Last item gets remaining row space and ellipsizes. */
.vl-breadcrumb__item:last-child {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: block;
}

.vl-breadcrumb__item:last-child .vl-breadcrumb__current,
.vl-breadcrumb__item:last-child .vl-breadcrumb__link {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.vl-breadcrumb__link {
  color: var(--color-text-link);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.vl-breadcrumb__link:hover {
  color: var(--color-primary-hover);
}

.vl-breadcrumb__current {
  color: var(--color-text-muted);
}

.vl-breadcrumb__separator {
  color: var(--color-text-muted);
  font-size: 10px;
}
</style>
