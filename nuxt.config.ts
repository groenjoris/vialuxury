// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true,

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    // Northstar concept — frozen snapshot of the prototype. All
    // components are auto-imported with a `Northstar` prefix so they
    // never collide with the active version.
    {
      path: '~/components-northstar',
      prefix: 'Northstar',
      pathPrefix: false,
    },
  ],

  // Auto-import the Northstar composables + stores. Their exported
  // names are renamed (`useNorthstar*`) so they don't collide with the
  // active version.
  imports: {
    dirs: [
      'composables-northstar/**',
      'stores-northstar/**',
    ],
  },

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
    '~/assets/css/variant-2.css',
  ],

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/images/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
      '/fonts/**':  { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      title: 'Via Luxury - Luxe Hotel Arrangementen',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '',
          href: '/fonts/recoleta/Recoleta-SemiBold.ttf' },
        { rel: 'preload', as: 'font', type: 'font/ttf', crossorigin: '',
          href: '/fonts/basis-grotesque/basisgrotesque-regular.ttf' },
      ],
      meta: [
        { name: 'description', content: 'Ontdek exclusieve hotelarrangementen bij Via Luxury. Boek luxe verblijven met ontbijt, diner en meer.' },
        { property: 'og:type',  content: 'website' },
        { property: 'og:title', content: 'Via Luxury — Luxe hotel experiences' },
        { property: 'og:description', content: 'Unieke arrangementen, samengesteld door het ViaLuxury team' },
        { property: 'og:url', content: 'https://vialuxury.nl' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },
})
