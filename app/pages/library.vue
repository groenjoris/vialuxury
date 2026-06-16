<template>
  <div class="lib">
    <!-- Sidebar nav -->
    <aside class="lib__sidebar">
      <NuxtLink to="/" class="lib__back">← Terug naar start</NuxtLink>
      <h1 class="lib__brand">ViaLuxury<br />Component Library</h1>
      <p class="lib__brand-sub">{{ totalCount }} herbruikbare Vue-componenten</p>
      <nav class="lib__nav">
        <a v-for="s in sections" :key="s.id" :href="`#${s.id}`" class="lib__nav-link">
          {{ s.title }} <span class="lib__nav-count">{{ s.count }}</span>
        </a>
      </nav>
    </aside>

    <!-- Content -->
    <main class="lib__main">
      <!-- ───────────── PRIMITIVES ───────────── -->
      <section id="primitives" class="lib__section">
        <h2 class="lib__section-title">Primitives</h2>
        <p class="lib__section-lead">Atomaire bouwstenen — geen business-logica, puur prop-gedreven.</p>

        <div class="lib__grid">
          <article class="demo">
            <header class="demo__head"><h3>Button</h3><code>variant · disabled · fullWidth</code></header>
            <div class="demo__body demo__body--row">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="dark">Donker</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Input</h3><code>v-model · footer-stijl</code></header>
            <div class="demo__body">
              <Input v-model="inputVal" placeholder="Jouw e-mailadres" type="email" />
              <p class="demo__note">Waarde: {{ inputVal || '—' }}</p>
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Badge</h3><code>variant: score · dark</code></header>
            <div class="demo__body demo__body--row">
              <Badge variant="score" label="9,2" />
              <Badge variant="dark" label="2 nachten" />
              <Badge variant="dark" label="Nog 1 beschikbaar" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Breadcrumb</h3><code>items</code></header>
            <div class="demo__body">
              <Breadcrumb :items="breadcrumbItems" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Icon</h3><code>name · size</code></header>
            <div class="demo__body demo__body--row demo__body--icons">
              <Icon v-for="n in iconNames" :key="n" :name="n" :size="24" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Tooltip</h3><code>ⓘ prijs-toelichting · variant</code></header>
            <div class="demo__body demo__body--row">
              <span class="demo__price">Vanaf €229 <Tooltip variant="deal" /></span>
            </div>
          </article>
        </div>
      </section>

      <!-- ───────────── CARDS ───────────── -->
      <section id="cards" class="lib__section">
        <h2 class="lib__section-title">Cards</h2>
        <p class="lib__section-lead">Deal-, map-preview- en creator-kaarten.</p>

        <div class="lib__grid lib__grid--wide">
          <article class="demo">
            <header class="demo__head"><h3>DealCard</h3><code>grid mode</code></header>
            <div class="demo__body" style="max-width: 360px;">
              <DealCard
                :deal="sampleDeal"
                :hotel="sampleHotel"
                grid-mode
                :is-favorite="dealFav"
                deal-href="#"
                @favorite="dealFav = !dealFav"
              />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>DealCard</h3><code>dateMismatch — grijs + rode melding</code></header>
            <div class="demo__body" style="max-width: 360px;">
              <DealCard
                :deal="sampleDeal"
                :hotel="sampleHotel"
                grid-mode
                date-mismatch
                :mismatch-messages="['Niet beschikbaar op 13 juni']"
                deal-href="#"
              />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>MapPreviewCard</h3><code>placement · soldOut · roomsLeft</code></header>
            <div class="demo__body demo__body--mappreview">
              <MapPreviewCard
                name="Grand Hotel Amrâth" :image="img.hero" :star-rating="5"
                city="Amsterdam" region="Noord-Holland"
                :price="229" :original-price="462" :discount-percentage="40"
                :nights="2" :rooms-left="2" placement="above"
              />
              <MapPreviewCard
                name="Carlton Beach" :image="img.sea" :star-rating="4"
                city="Scheveningen" region="Zuid-Holland"
                :price="0" :nights="2" sold-out placement="below"
              />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>CreatorCard</h3><code>experience creator</code></header>
            <div class="demo__body" style="max-width: 360px;">
              <CreatorCard
                name="Esther"
                :photo="img.esther"
                specialty="Culinaire stedentrips"
                bio="Esther stelt al 8 jaar de mooiste culinaire verblijven samen."
                score="Beoordeeld met 9,4"
              />
            </div>
          </article>
        </div>
      </section>

      <!-- ───────────── SEARCH & FILTERS ───────────── -->
      <section id="search" class="lib__section">
        <h2 class="lib__section-title">Search &amp; filters</h2>
        <p class="lib__section-lead">Volledig ontkoppeld van globale state — waarden via props, wijzigingen via events.</p>

        <div class="lib__grid lib__grid--wide">
          <article class="demo demo--full demo--popups">
            <header class="demo__head"><h3>SearchBar</h3><code>Wanneer · Hoelang · Wie · Vind deals</code></header>
            <div class="demo__body">
              <SearchBar
                v-model:arrival-date="search.date"
                v-model:nights="search.nights"
                v-model:persons="search.persons"
                v-model:rooms="search.rooms"
                :availability="availabilityMap"
                @search="onSearch"
              />
              <p class="demo__note">
                Datum: {{ search.date || '—' }} · Nachten: {{ search.nights.join(', ') || '—' }}
                · {{ search.persons }} pers / {{ search.rooms }} kamer(s)
              </p>
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>MobileSearchTrigger</h3><code>label</code></header>
            <div class="demo__body">
              <MobileSearchTrigger label="Doorzoek 84 hotelarrangementen" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>FilterPills</h3><code>pills · remove · clear</code></header>
            <div class="demo__body">
              <FilterPills :pills="pills" @remove="removePill" @clear="pills = []" />
              <Button v-if="!pills.length" variant="secondary" @click="resetPills">Reset voorbeeld</Button>
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>DurationPicker</h3><code>v-model · anyDuration · subtitel</code></header>
            <div class="demo__body">
              <DurationPicker v-model="search.nights" v-model:any-duration="anyDuration" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>PersonsPicker</h3><code>persons · rooms</code></header>
            <div class="demo__body">
              <PersonsPicker v-model:persons="search.persons" v-model:rooms="search.rooms" />
            </div>
          </article>

          <article class="demo demo--full">
            <header class="demo__head"><h3>DatePicker</h3><code>sidebar-kalender · grijze/groene cellen</code></header>
            <div class="demo__body" style="max-width: 360px;">
              <DatePicker
                v-model="search.date"
                v-model:month="calMonth"
                :availability="availabilityList"
              />
            </div>
          </article>
        </div>
      </section>

      <!-- ───────────── MEDIA ───────────── -->
      <section id="media" class="lib__section">
        <h2 class="lib__section-title">Media</h2>
        <p class="lib__section-lead">Foto-galerij + carousel met dot-indicatoren.</p>

        <div class="lib__grid lib__grid--wide">
          <article class="demo demo--full">
            <header class="demo__head"><h3>HeroGallery</h3><code>1 hero + 2×2 grid · openPhoto</code></header>
            <div class="demo__body">
              <HeroGallery :images="galleryImages" @open-gallery="() => {}" @open-photo="() => {}" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>Carousel</h3><code>autoplay · arrows · dots</code></header>
            <div class="demo__body" style="max-width: 420px;">
              <Carousel :items="carouselImages" autoplay :interval="3500" />
            </div>
          </article>
        </div>
      </section>

      <!-- ───────────── CONTENT SECTIONS ───────────── -->
      <section id="content" class="lib__section">
        <h2 class="lib__section-title">Content sections</h2>
        <p class="lib__section-lead">Grotere paginasecties: FAQ, tips, betaallogo's, share-menu.</p>

        <div class="lib__grid lib__grid--wide">
          <article class="demo demo--full">
            <header class="demo__head"><h3>FaqSection</h3><code>items · heading</code></header>
            <div class="demo__body">
              <FaqSection heading="Veelgestelde vragen" :items="faqItems" />
            </div>
          </article>

          <article class="demo demo--full">
            <header class="demo__head"><h3>NearbyTips</h3><code>tips · lees meer/minder</code></header>
            <div class="demo__body">
              <NearbyTips heading="Tips in de buurt" :tips="tipItems" hotel-name="Grand Hotel Amrâth" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>WhySection</h3><code>items · heading</code></header>
            <div class="demo__body">
              <WhySection heading="Waarom ViaLuxury" :items="whyItems" />
            </div>
          </article>

          <article class="demo">
            <header class="demo__head"><h3>PaymentLogos</h3><code>locale</code></header>
            <div class="demo__body">
              <PaymentLogos locale="nl" />
            </div>
          </article>

          <article class="demo demo--popups">
            <header class="demo__head"><h3>ShareMenu</h3><code>Delen-knop + share-popup</code></header>
            <div class="demo__body" style="min-height: 80px;">
              <ShareMenu title="Mooi luxe hotel" />
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
// Library components use plain, prefix-less names and are imported by
// path (they are NOT globally auto-imported — see nuxt.config.ts).
import Button from '~/lib/primitives/Button.vue'
import Input from '~/lib/primitives/Input.vue'
import Badge from '~/lib/primitives/Badge.vue'
import Breadcrumb from '~/lib/primitives/Breadcrumb.vue'
import Icon from '~/lib/primitives/Icon.vue'
import Tooltip from '~/lib/primitives/Tooltip.vue'
import DealCard from '~/lib/components/DealCard.vue'
import MapPreviewCard from '~/lib/components/MapPreviewCard.vue'
import CreatorCard from '~/lib/components/CreatorCard.vue'
import SearchBar from '~/lib/components/SearchBar.vue'
import MobileSearchTrigger from '~/lib/components/MobileSearchTrigger.vue'
import FilterPills from '~/lib/components/FilterPills.vue'
import DurationPicker from '~/lib/components/DurationPicker.vue'
import PersonsPicker from '~/lib/components/PersonsPicker.vue'
import DatePicker from '~/lib/components/DatePicker.vue'
import HeroGallery from '~/lib/components/HeroGallery.vue'
import Carousel from '~/lib/components/Carousel.vue'
import FaqSection from '~/lib/components/FaqSection.vue'
import NearbyTips from '~/lib/components/NearbyTips.vue'
import WhySection from '~/lib/components/WhySection.vue'
import PaymentLogos from '~/lib/components/PaymentLogos.vue'
import ShareMenu from '~/lib/components/ShareMenu.vue'

definePageMeta({ layout: false })
useHead({ title: 'Component Library | ViaLuxury' })

const img = {
  hero: '/images/hero/hotelexperiencepackages.jpeg',
  sea: '/images/hero/seapackages.png',
  wellness: '/images/hero/Wellness.png',
  spa: '/images/hero/spa-van-oys.jpg',
  haarlem: '/images/hero/Haarlem 1.jpg',
  bike: '/images/categories/bikepackages.jpg',
  esther: '/images/team/esther.jpeg',
}

const sections = [
  { id: 'primitives', title: 'Primitives', count: 6 },
  { id: 'cards', title: 'Cards', count: 3 },
  { id: 'search', title: 'Search & filters', count: 6 },
  { id: 'media', title: 'Media', count: 2 },
  { id: 'content', title: 'Content sections', count: 5 },
]
const totalCount = computed(() => sections.reduce((n, s) => n + s.count, 0))

// ── Primitives demo state ──
const inputVal = ref('')
const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Arrangementen', href: '#' },
  { label: 'Grand Hotel Amrâth' },
]
const iconNames = ['search', 'heart', 'share', 'map-pin', 'calendar', 'clock', 'users', 'check', 'star', 'info', 'phone', 'close']

// ── Cards demo data ──
const dealFav = ref(false)
const sampleDeal = {
  id: 'demo-1',
  title: '2 nachten luxe verblijf met diner, wellness en late check-out',
  nights: 2,
  basePrice: 229,
  originalPrice: 462,
  discountPercentage: 40,
  inclusions: ['2 x Overnachting', 'Dagelijks uitgebreid ontbijtbuffet', 'Driegangendiner', 'Gebruik van de wellness', 'Late check-out'],
}
const sampleHotel = {
  name: 'Grand Hotel Amrâth',
  slug: 'grand-hotel-amrath',
  city: 'Amsterdam',
  region: 'Noord-Holland',
  starRating: 5,
  heroImage: img.hero,
  galleryImages: [img.hero, img.spa, img.wellness, img.sea, img.haarlem],
}

// ── Search demo state ──
const search = reactive({ date: null as string | null, nights: ['2'] as string[], persons: 2, rooms: 1 })
const anyDuration = ref(false)
const calMonth = ref({ year: 2026, month: 5 }) // June 2026 (0-indexed)
const pills = ref([
  { id: 'wellness', label: 'Wellness' },
  { id: 'aan-zee', label: 'Aan zee' },
  { id: '4-sterren', label: '4 sterren' },
])
function removePill(id: string) { pills.value = pills.value.filter(p => p.id !== id) }
function resetPills() {
  pills.value = [
    { id: 'wellness', label: 'Wellness' },
    { id: 'aan-zee', label: 'Aan zee' },
    { id: '4-sterren', label: '4 sterren' },
  ]
}

// Sample availability — June 2026. SearchBar's Wanneer popup expects a
// Record keyed by ISO date; DatePicker expects an array of entries.
const availabilityMap = computed<Record<string, { available: boolean; price?: number; premium?: boolean }>>(() => {
  const map: Record<string, { available: boolean; price?: number; premium?: boolean }> = {}
  for (let d = 1; d <= 30; d++) {
    const iso = `2026-06-${String(d).padStart(2, '0')}`
    const available = d % 7 !== 0
    const premium = d % 5 === 0
    map[iso] = { available, price: available ? (premium ? 308 : 229) : undefined, premium }
  }
  return map
})
const availabilityList = computed<{ date: string; available: boolean; soldOut?: boolean; totalPrice: number }[]>(() =>
  Object.entries(availabilityMap.value).map(([date, a]) => ({
    date,
    available: a.available,
    soldOut: !a.available,
    totalPrice: a.price ?? 0,
  })),
)
function onSearch() { /* showcase: no-op */ }

// ── Media demo data ──
const galleryImages = [
  { url: img.hero, alt: 'Lobby' },
  { url: img.spa, alt: 'Spa' },
  { url: img.wellness, alt: 'Wellness' },
  { url: img.sea, alt: 'Strand' },
  { url: img.haarlem, alt: 'Stad' },
]
const carouselImages = [img.hero, img.spa, img.wellness, img.sea]

// ── Content demo data ──
const faqItems = [
  { id: 'q1', question: 'Kan ik mijn boeking annuleren?', answer: 'Ja, tot 14 dagen voor aankomst kun je kosteloos annuleren.' },
  { id: 'q2', question: 'Is het ontbijt inbegrepen?', answer: 'Bij dit arrangement is een uitgebreid ontbijtbuffet inbegrepen.' },
  { id: 'q3', question: 'Kan ik later inchecken?', answer: 'Late check-out tot 13:00 is onderdeel van dit pakket.' },
]
const tipItems = [
  { id: 't1', title: 'Wandelen langs het strand', description: 'Geniet van de frisse zeelucht tijdens een wandeling over het strand of door de duinen.', image: img.sea },
  { id: 't2', title: 'Bezoek een lokaal museum', description: 'Ontdek de cultuur en geschiedenis van de regio in een van de nabijgelegen musea.', image: img.haarlem },
  { id: 't3', title: 'Fietstocht door de omgeving', description: 'Huur een fiets en verken de prachtige omgeving in je eigen tempo.', image: img.bike },
]
const whyItems = [
  { title: 'Samengesteld door experts', text: 'Onze experience creators stellen elk verblijf met zorg samen.' },
  { title: 'Scherpe prijzen', text: 'Luxe extra’s en exclusieve voordelen voor een scherpere prijs.' },
  { title: 'Gemakkelijk annuleren', text: 'Flexibele voorwaarden zodat je zorgeloos boekt.' },
]
</script>

<style scoped>
.lib {
  display: flex;
  min-height: 100vh;
  background: var(--color-background-secondary, #fbfaf8);
  font-family: var(--font-body);
  color: var(--color-text-primary);
}

/* Sidebar */
.lib__sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  width: 280px;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  padding: 32px 24px;
  background: var(--color-dark, #1a1e1e);
  color: #fff;
}
.lib__back {
  display: inline-block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 32px;
}
.lib__back:hover { color: #fff; }
.lib__brand {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 6px;
  color: #fff;
}
.lib__brand-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 28px;
}
.lib__nav { display: flex; flex-direction: column; gap: 2px; }
.lib__nav-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm, 6px);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  transition: background 150ms ease, color 150ms ease;
}
.lib__nav-link:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.lib__nav-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 8px;
  border-radius: 10px;
}

/* Main */
.lib__main { flex: 1; min-width: 0; padding: 48px 56px 96px; }
.lib__section { margin-bottom: 72px; scroll-margin-top: 24px; }
.lib__section-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 6px;
}
.lib__section-lead {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 28px;
  max-width: 640px;
}

.lib__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.lib__grid--wide { grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); }

/* Demo card */
.demo {
  background: #fff;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.demo--full { grid-column: 1 / -1; }
/* Demos with absolutely-positioned popups (SearchBar fields, ShareMenu)
   must not clip them, and need vertical room below the trigger. */
.demo--popups { overflow: visible; }
.demo--popups .demo__body { overflow: visible; min-height: 360px; }
/* MapPreview caret needs breathing room above + below the card. */
.demo__body--mappreview {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 40px;
  padding: 48px 18px;
  align-items: flex-start;
}
.demo__body--mappreview > * { max-width: 300px; }
.demo__price {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
}
.demo__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
  background: var(--color-background-secondary, #fbfaf8);
}
.demo__head h3 {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.demo__head code {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-align: right;
}
.demo__body {
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}
.demo__body--row { flex-direction: row; flex-wrap: wrap; align-items: center; }
.demo__body--icons { color: var(--color-text-primary); }
.demo__note {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

@media (max-width: 900px) {
  .lib { flex-direction: column; }
  .lib__sidebar { position: static; width: auto; height: auto; }
  .lib__main { padding: 32px 20px 64px; }
  .lib__grid, .lib__grid--wide { grid-template-columns: 1fr; }
}
</style>
