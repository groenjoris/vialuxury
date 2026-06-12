<template>
  <Teleport to="body">
    <!-- ───────── MOBILE: grid overview ───────── -->
    <Transition name="vl-pg-fade">
      <div
        v-if="modelValue && view === 'grid'"
        class="vl-pg vl-pg--mobile vl-pg-mgrid"
        role="dialog"
        aria-modal="true"
      >
        <header class="vl-pg-mgrid__header">
          <button type="button" class="vl-pg-iconbtn" aria-label="Sluiten" @click="close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2 v-if="title" class="vl-pg-mgrid__title">{{ title }}</h2>
        </header>
        <div class="vl-pg-mgrid__body" data-scroll-lock-allow="true">
          <div class="vl-pg-masonry">
            <button
              v-for="(img, i) in images"
              :key="i"
              type="button"
              class="vl-pg-thumb"
              @click="openPhoto(i)"
            >
              <img :src="img.url" :alt="img.alt || ''" loading="lazy" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ───────── MOBILE: full-photo viewer ───────── -->
    <Transition name="vl-pg-fade">
      <div
        v-if="modelValue && view === 'photo'"
        class="vl-pg vl-pg--mobile vl-pg-mphoto"
        role="dialog"
        aria-modal="true"
      >
        <button type="button" class="vl-pg-mphoto__back" @click="$emit('update:view', 'grid')">
          <span class="vl-pg-all-icon" aria-hidden="true">⊞</span>
          Alle foto's
        </button>
        <button type="button" class="vl-pg-iconbtn vl-pg-mphoto__close" aria-label="Sluiten" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <div ref="mTrack" class="vl-pg-mphoto__track" data-scroll-lock-allow="true" @scroll.passive="onTrackScroll">
          <div v-for="(img, i) in images" :key="i" class="vl-pg-mphoto__slide">
            <img :src="img.url" :alt="img.alt || ''" />
          </div>
        </div>
        <div class="vl-pg-mphoto__controls">
          <button type="button" class="vl-pg-iconbtn vl-pg-iconbtn--light" aria-label="Vorige" @click="setIndex(index - 1)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span class="vl-pg-counter">{{ index + 1 }} / {{ total }}</span>
          <button type="button" class="vl-pg-iconbtn vl-pg-iconbtn--light" aria-label="Volgende" @click="setIndex(index + 1)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ───────── DESKTOP: right slide-in panel (80vw) ───────── -->
    <Transition name="vl-pg-slide">
      <div v-if="modelValue" class="vl-pg vl-pg--desktop vl-pg-d" @click.self="close">
        <aside class="vl-pg-d__panel" role="dialog" aria-modal="true">
          <header class="vl-pg-d__header">
            <button
              v-if="view === 'photo'"
              type="button"
              class="vl-pg-d__back"
              @click="$emit('update:view', 'grid')"
            >
              <span class="vl-pg-all-icon" aria-hidden="true">⊞</span>
              Alle foto's
            </button>
            <h2 v-if="title" class="vl-pg-d__title">{{ title }}</h2>
            <button type="button" class="vl-pg-iconbtn" aria-label="Sluiten" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <!-- Grid overview -->
          <div v-if="view === 'grid'" class="vl-pg-d__grid" data-scroll-lock-allow="true">
            <div class="vl-pg-masonry">
              <button
                v-for="(img, i) in images"
                :key="i"
                type="button"
                class="vl-pg-thumb"
                @click="openPhoto(i)"
              >
                <img :src="img.url" :alt="img.alt || ''" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- Full photo + thumb-strip -->
          <div v-else class="vl-pg-d__photo">
            <div class="vl-pg-d__stage">
              <button type="button" class="vl-pg-iconbtn vl-pg-iconbtn--light vl-pg-d__arrow vl-pg-d__arrow--prev" aria-label="Vorige" @click="setIndex(index - 1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <img :src="images[index]?.url" :alt="images[index]?.alt || ''" class="vl-pg-d__stage-img" />
              <button type="button" class="vl-pg-iconbtn vl-pg-iconbtn--light vl-pg-d__arrow vl-pg-d__arrow--next" aria-label="Volgende" @click="setIndex(index + 1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <span class="vl-pg-counter vl-pg-d__counter">{{ index + 1 }} / {{ total }}</span>
            </div>
            <div ref="dStrip" class="vl-pg-d__strip">
              <button
                v-for="(img, i) in images"
                :key="i"
                type="button"
                class="vl-pg-d__strip-thumb"
                :class="{ 'is-active': i === index }"
                @click="setIndex(i)"
              >
                <img :src="img.url" :alt="img.alt || ''" loading="lazy" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useScrollLock } from '~/lib/composables/useScrollLock'

interface GalleryImage {
  url: string
  alt?: string
}

const props = withDefaults(
  defineProps<{
    /** Open state (v-model). */
    modelValue: boolean
    /** Photos to show. */
    images: GalleryImage[]
    /** Active photo index into `images`. */
    index: number
    /** Optional header title. */
    title?: string
    /** 'grid' = thumbnail overview, 'photo' = full-photo viewer. */
    view?: 'grid' | 'photo'
  }>(),
  {
    title: '',
    view: 'grid',
  },
)

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'update:index': [i: number]
  'update:view': [v: 'grid' | 'photo']
  close: []
}>()

useScrollLock().bindTo(toRef(props, 'modelValue'))

const total = computed(() => props.images.length)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function openPhoto(i: number) {
  emit('update:index', i)
  emit('update:view', 'photo')
}

function setIndex(i: number) {
  const n = total.value
  if (n <= 0) return
  emit('update:index', ((i % n) + n) % n)
}

/* ── Mobile swipe ⇄ index sync ── */
const mTrack = ref<HTMLElement | null>(null)
const dStrip = ref<HTMLElement | null>(null)
let syncing = false

function onTrackScroll() {
  const el = mTrack.value
  if (!el || el.clientWidth === 0 || syncing) return
  const i = Math.round(el.scrollLeft / el.clientWidth)
  if (i !== props.index) emit('update:index', i)
}
function scrollTrackToIndex(smooth = false) {
  const el = mTrack.value
  if (!el) return
  syncing = true
  el.scrollTo({ left: props.index * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  window.setTimeout(() => { syncing = false }, smooth ? 400 : 60)
}
function scrollStripToActive() {
  const strip = dStrip.value
  if (!strip) return
  const active = strip.children[props.index] as HTMLElement | undefined
  active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
}

watch(
  () => [props.modelValue, props.view, props.index] as const,
  () => {
    if (!props.modelValue || props.view !== 'photo') return
    nextTick(() => {
      scrollTrackToIndex(false)
      scrollStripToActive()
    })
  },
)

/* ── Keyboard: Esc closes, ←/→ navigate in the photo view ── */
function onKey(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') { close(); return }
  if (props.view !== 'photo') return
  if (e.key === 'ArrowLeft') setIndex(props.index - 1)
  else if (e.key === 'ArrowRight') setIndex(props.index + 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* ───────── Layout switching (media query at 800px) ───────── */
.vl-pg--mobile { display: none; }
.vl-pg--desktop { display: flex; }
@media (max-width: 800px) {
  .vl-pg--mobile { display: flex; }
  .vl-pg--desktop { display: none; }
}

/* Shared icon button. */
.vl-pg-iconbtn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.vl-pg-iconbtn:hover { background: var(--color-border); }
.vl-pg-iconbtn--light {
  background: rgba(255, 255, 255, 0.92);
  color: #1a1a1a;
}
.vl-pg-iconbtn--light:hover { background: #fff; }

.vl-pg-counter {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.vl-pg-all-icon { font-size: 20px; }

/* 2-column masonry — each photo keeps its natural aspect ratio. */
.vl-pg-masonry {
  columns: 2;
  column-gap: 8px;
}
.vl-pg-thumb {
  display: block;
  width: 100%;
  break-inside: avoid;
  margin-bottom: 8px;
  padding: 0;
  border: none;
  background: #f5f5f5;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
}
.vl-pg-thumb img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.4s ease;
}
.vl-pg-thumb:hover img { transform: scale(1.05); }

/* ───────── Mobile grid overview ───────── */
.vl-pg-mgrid {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: #fff;
  flex-direction: column;
}
.vl-pg-mgrid__header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px var(--space-md);
  background: var(--color-dark);
}
.vl-pg-mgrid__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}
.vl-pg-mgrid__header .vl-pg-iconbtn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
}
.vl-pg-mgrid__header .vl-pg-iconbtn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}
.vl-pg-mgrid__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-md);
}

/* ───────── Mobile full-photo viewer ───────── */
.vl-pg-mphoto {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: var(--color-dark);
  flex-direction: column;
}
.vl-pg-mphoto__close {
  position: absolute;
  top: calc(10px + env(safe-area-inset-top, 0));
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  backdrop-filter: blur(4px);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.vl-pg-mphoto__close:hover { background: rgba(0, 0, 0, 0.7); border-color: rgba(255, 255, 255, 0.7); }
.vl-pg-mphoto__back {
  position: absolute;
  top: calc(10px + env(safe-area-inset-top, 0));
  left: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.vl-pg-mphoto__back:hover { background: rgba(0, 0, 0, 0.7); border-color: rgba(255, 255, 255, 0.7); }
.vl-pg-mphoto__track {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.vl-pg-mphoto__track::-webkit-scrollbar { display: none; }
.vl-pg-mphoto__slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vl-pg-mphoto__slide img { width: 100%; height: 100%; max-height: 100%; object-fit: contain; display: block; }
.vl-pg-mphoto__controls {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
}
.vl-pg-mphoto__controls .vl-pg-counter { color: #fff; min-width: 64px; text-align: center; }

/* ───────── Desktop slide-in panel ───────── */
.vl-pg-d {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
}
.vl-pg-d__panel {
  width: 80vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.25);
}
.vl-pg-d__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-xl);
  background: var(--color-dark);
}
.vl-pg-d__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.vl-pg-d__back:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.3); }
.vl-pg-d__header .vl-pg-iconbtn {
  width: 36px;
  height: 36px;
  margin-left: auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
}
.vl-pg-d__header .vl-pg-iconbtn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}
.vl-pg-d__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}
.vl-pg-d__grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-xl);
}
.vl-pg-d__grid .vl-pg-masonry { column-gap: var(--space-md); }
.vl-pg-d__grid .vl-pg-thumb { margin-bottom: var(--space-md); }
.vl-pg-d__photo {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-dark);
}
.vl-pg-d__stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: var(--space-lg);
}
.vl-pg-d__stage-img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
.vl-pg-d__arrow { position: absolute; top: 50%; transform: translateY(-50%); }
.vl-pg-d__arrow--prev { left: 16px; }
.vl-pg-d__arrow--next { right: 16px; }
.vl-pg-d__counter {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
}
.vl-pg-d__strip {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: var(--space-md);
  overflow-x: auto;
  background: var(--color-dark);
}
.vl-pg-d__strip-thumb {
  flex: 0 0 auto;
  width: 96px;
  height: 64px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition-fast), border-color var(--transition-fast);
}
.vl-pg-d__strip-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.vl-pg-d__strip-thumb.is-active { opacity: 1; border-color: #fff; }
.vl-pg-d__strip-thumb:hover { opacity: 1; }

/* ───────── Transitions ───────── */
.vl-pg-fade-enter-active, .vl-pg-fade-leave-active { transition: opacity 220ms ease; }
.vl-pg-fade-enter-from, .vl-pg-fade-leave-to { opacity: 0; }

.vl-pg-slide-enter-active, .vl-pg-slide-leave-active { transition: opacity 300ms ease; }
.vl-pg-slide-enter-active .vl-pg-d__panel, .vl-pg-slide-leave-active .vl-pg-d__panel { transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.vl-pg-slide-enter-from, .vl-pg-slide-leave-to { opacity: 0; }
.vl-pg-slide-enter-from .vl-pg-d__panel, .vl-pg-slide-leave-to .vl-pg-d__panel { transform: translateX(100%); }
</style>
