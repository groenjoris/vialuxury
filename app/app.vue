<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale'

const localeStore = useLocaleStore()

useHead({
  htmlAttrs: {
    lang: computed(() => localeStore.locale),
  },
})
</script>
