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
    // First Release prototype — actively developed. All components
    // auto-imported with a `FirstRelease` prefix.
    {
      path: '~/components-first-release',
      prefix: 'FirstRelease',
      pathPrefix: false,
    },
    // Second Release prototype — full independent copy of First Release.
    // All components auto-imported with a `SecondRelease` prefix.
    {
      path: '~/components-second-release',
      prefix: 'SecondRelease',
      pathPrefix: false,
    },
    // Huisstijl variants — frozen snapshot of the 5-homepage prototype.
    {
      path: '~/components-huisstijl',
      prefix: 'Huisstijl',
      pathPrefix: false,
    },
    // Northstar concept — frozen snapshot of the user-test prototype.
    {
      path: '~/components-northstar',
      prefix: 'Northstar',
      pathPrefix: false,
    },
    // NOTE: the reusable component library (~/lib/primitives + ~/lib/
    // components) is intentionally NOT auto-imported. Its components use
    // plain, prefix-less names (Button, Input, DealCard, …) — some of
    // which collide with ~/components — so consumers import them by path:
    //   import Button from '~/lib/primitives/Button.vue'
  ],

  // Auto-import each prototype's composables + stores. Function names
  // are renamed per-prototype (`useFirstRelease*`, `useHuisstijl*`,
  // `useNorthstar*`) so they never collide.
  imports: {
    dirs: [
      'composables-first-release/**',
      'composables-second-release/**',
      'composables-huisstijl/**',
      'composables-northstar/**',
      'stores-first-release/**',
      'stores-second-release/**',
      'stores-huisstijl/**',
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
    '~/assets/css/fr-variant-6.css',
    '~/assets/css/fr-home-variants.css',
    '~/assets/css/sr-variant-6.css',
    '~/assets/css/sr-home-variants.css',
    '~/assets/css/home-categories.css',
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
      // `data-fr-variant="6"` is set during SSR so the v6 design CSS
      // (1200 px container etc.) applies on first paint — without it,
      // the page briefly renders at the legacy 1137 px width and then
      // jumps to 1200 px once the client-side watcher mounts.
      htmlAttrs: { lang: 'nl', 'data-fr-variant': '6', 'data-sr-variant': '6' },
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
