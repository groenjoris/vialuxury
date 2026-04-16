// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/variables.css',
    '~/assets/css/typography.css',
    '~/assets/css/base.css',
    'leaflet/dist/leaflet.css',
    'leaflet.markercluster/dist/MarkerCluster.css',
    '~/assets/css/leaflet-overrides.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      title: 'Via Luxury - Luxe Hotel Arrangementen',
      meta: [
        { name: 'description', content: 'Ontdek exclusieve hotelarrangementen bij Via Luxury. Boek luxe verblijven met ontbijt, diner en meer.' },
      ],
    },
  },
})
