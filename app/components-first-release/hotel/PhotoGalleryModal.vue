<template>
  <Teleport to="body">
    <!-- ─────────────── MOBILE ─────────────── -->
    <template v-if="isMobile">
      <!-- Grid overview -->
      <Transition name="pg-fade">
        <div v-if="open && view === 'grid'" class="pg-mgrid" role="dialog" aria-modal="true">
          <header class="pg-mgrid__header">
            <button type="button" class="pg-iconbtn" :aria-label="t('common.close')" @click="$emit('close')">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <h2 class="pg-mgrid__title">{{ title }}</h2>
          </header>
          <div class="pg-mgrid__body" data-scroll-lock-allow="true">
            <button v-for="(img, i) in ordered" :key="img.id" type="button" class="pg-thumb" @click="openPhoto(i)">
              <img :src="img.url" :alt="localized(img.alt)" loading="lazy" />
            </button>
          </div>
          <footer class="pg-mgrid__footer">
            <button type="button" class="pg-btn pg-btn--ghost" @click="$emit('close')">{{ t('gallery.back') }}</button>
            <button type="button" class="pg-btn pg-btn--primary" @click="$emit('book')">{{ t('deal.bookNow') }}</button>
          </footer>
        </div>
      </Transition>

      <!-- Full-photo viewer -->
      <Transition name="pg-fade">
        <div v-if="open && view === 'photo'" class="pg-mphoto" role="dialog" aria-modal="true">
          <button type="button" class="pg-iconbtn pg-mphoto__close" :aria-label="t('common.close')" @click="closePhoto">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div ref="mTrack" class="pg-mphoto__track" data-scroll-lock-allow="true" @scroll.passive="onTrackScroll">
            <div v-for="img in ordered" :key="img.id" class="pg-mphoto__slide">
              <img :src="img.url" :alt="localized(img.alt)" />
            </div>
          </div>
          <div class="pg-mphoto__controls">
            <button type="button" class="pg-iconbtn pg-iconbtn--light" :disabled="index <= 0" aria-label="Vorige" @click="setIndex(index - 1)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span class="pg-counter">{{ index + 1 }} / {{ total }}</span>
            <button type="button" class="pg-iconbtn pg-iconbtn--light" :disabled="index >= total - 1" aria-label="Volgende" @click="setIndex(index + 1)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </Transition>
    </template>

    <!-- ─────────────── DESKTOP (right slide-in panel, 80vw) ─────────────── -->
    <template v-else>
      <Transition name="pg-slide">
        <div v-if="open" class="pg-d" @click.self="$emit('close')">
          <aside class="pg-d__panel" role="dialog" aria-modal="true">
            <header class="pg-d__header">
              <button
                v-if="view === 'photo' && !cameDirect"
                type="button"
                class="pg-d__back"
                @click="$emit('update:view', 'grid')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                {{ t('common.allPhotos') }}
              </button>
              <h2 class="pg-d__title">{{ title }}</h2>
              <button type="button" class="pg-iconbtn" :aria-label="t('common.close')" @click="$emit('close')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </header>

            <!-- Grid overview (3 cols) -->
            <div v-if="view === 'grid'" class="pg-d__grid" data-scroll-lock-allow="true">
              <button v-for="(img, i) in ordered" :key="img.id" type="button" class="pg-thumb" @click="openPhoto(i)">
                <img :src="img.url" :alt="localized(img.alt)" loading="lazy" />
              </button>
            </div>

            <!-- Full photo + thumb-strip nav -->
            <div v-else class="pg-d__photo">
              <div class="pg-d__stage">
                <button type="button" class="pg-iconbtn pg-iconbtn--light pg-d__arrow pg-d__arrow--prev" :disabled="index <= 0" aria-label="Vorige" @click="setIndex(index - 1)">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <img :src="ordered[index]?.url" :alt="ordered[index] ? localized(ordered[index].alt) : ''" class="pg-d__stage-img" />
                <button type="button" class="pg-iconbtn pg-iconbtn--light pg-d__arrow pg-d__arrow--next" :disabled="index >= total - 1" aria-label="Volgende" @click="setIndex(index + 1)">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <span class="pg-counter pg-d__counter">{{ index + 1 }} / {{ total }}</span>
              </div>
              <div ref="dStrip" class="pg-d__strip">
                <button
                  v-for="(img, i) in ordered"
                  :key="img.id"
                  type="button"
                  class="pg-d__strip-thumb"
                  :class="{ 'is-active': i === index }"
                  @click="setIndex(i)"
                >
                  <img :src="img.url" :alt="localized(img.alt)" loading="lazy" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import type { HotelImage } from '~/types/hotel'
import { useFirstReleaseIsMobile } from '~/composables-first-release/useFirstReleaseIsMobile'
import { useBodyScrollLock } from '~/composables-first-release/useBodyScrollLock'

const { t, localized } = useFirstReleaseI18n()
const isMobile = useFirstReleaseIsMobile()

const props = defineProps<{
  open: boolean
  images: HotelImage[]
  title: string
  /** 'grid' = thumbnail overview, 'photo' = full-photo viewer. */
  view: 'grid' | 'photo'
  /** Active photo index into `ordered`. */
  index: number
  /** True when opened straight into the photo view from a page photo
   *  (so the desktop "← Alle foto's" back-to-grid control is hidden). */
  cameDirect: boolean
}>()

const emit = defineEmits<{
  close: []
  book: []
  'update:view': [v: 'grid' | 'photo']
  'update:index': [i: number]
}>()

useBodyScrollLock().bindTo(toRef(props, 'open'))

/** Ordered list: hero first, then gallery photos. Index everywhere refers
 *  to this list (matches HeroGallery's `carouselImages`). */
const ordered = computed<HotelImage[]>(() => {
  const hero = props.images.find(img => img.position === 'hero')
  const gallery = props.images.filter(img => img.position === 'gallery')
  return hero ? [hero, ...gallery] : gallery
})
const total = computed(() => ordered.value.length)

function openPhoto(i: number) {
  emit('update:index', i)
  emit('update:view', 'photo')
}
function setIndex(i: number) {
  emit('update:index', Math.max(0, Math.min(total.value - 1, i)))
}
/** Mobile photo close: back to the grid unless we opened straight into the
 *  photo view (then close the whole gallery). */
function closePhoto() {
  if (props.cameDirect) emit('close')
  else emit('update:view', 'grid')
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
  // release the guard after the scroll settles
  window.setTimeout(() => { syncing = false }, smooth ? 400 : 60)
}
function scrollStripToActive() {
  const strip = dStrip.value
  if (!strip) return
  const active = strip.children[props.index] as HTMLElement | undefined
  active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
}

// When entering the photo view (or jumping via arrows/thumbs), align the
// mobile swipe track and the desktop thumb-strip to the active index.
watch(
  () => [props.open, props.view, props.index] as const,
  () => {
    if (!props.open || props.view !== 'photo') return
    nextTick(() => {
      if (isMobile.value) scrollTrackToIndex(false)
      else scrollStripToActive()
    })
  },
)

/* ── Keyboard: Esc closes, ←/→ navigate in the photo view ── */
function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') { emit('close'); return }
  if (props.view !== 'photo') return
  if (e.key === 'ArrowLeft') setIndex(props.index - 1)
  else if (e.key === 'ArrowRight') setIndex(props.index + 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
/* Shared icon button (circle, grey, black glyph). */
.pg-iconbtn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
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
.pg-iconbtn:hover { background: var(--color-border); }
.pg-iconbtn:disabled { opacity: 0.35; cursor: default; }
/* Light variant for use over dark photo backgrounds. */
.pg-iconbtn--light {
  background: rgba(255, 255, 255, 0.92);
  color: #1a1a1a;
}
.pg-iconbtn--light:hover { background: #fff; }

.pg-counter {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Shared thumbnail tile. */
.pg-thumb {
  display: block;
  padding: 0;
  border: none;
  background: #f5f5f5;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4 / 3;
}
.pg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ───────── Mobile grid overview ───────── */
.pg-mgrid {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.pg-mgrid__header {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 10px var(--space-md);
  background: #fff;
  border-bottom: 1px solid var(--color-border-light);
}
.pg-mgrid__title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pg-mgrid__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: var(--space-md);
}
.pg-mgrid__footer {
  flex-shrink: 0;
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
  border-top: 1px solid var(--color-border-light);
  background: #fff;
}
.pg-btn {
  flex: 1;
  height: 48px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-border);
}
.pg-btn--ghost { background: #fff; color: var(--color-text-primary); }
.pg-btn--primary { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

/* ───────── Mobile full-photo viewer ───────── */
.pg-mphoto {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: #111;
  display: flex;
  flex-direction: column;
}
.pg-mphoto__close {
  position: absolute;
  top: calc(10px + env(safe-area-inset-top, 0));
  right: 12px;
  z-index: 2;
}
.pg-mphoto__track {
  flex: 1;
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.pg-mphoto__track::-webkit-scrollbar { display: none; }
.pg-mphoto__slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pg-mphoto__slide img { width: 100%; height: 100%; max-height: 100%; object-fit: contain; display: block; }
.pg-mphoto__controls {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
}
.pg-mphoto__controls .pg-counter { color: #fff; min-width: 64px; text-align: center; }

/* ───────── Desktop slide-in panel ───────── */
.pg-d {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
}
.pg-d__panel {
  width: 80vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.25);
}
.pg-d__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 14px var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}
.pg-d__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 6px 6px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.pg-d__back:hover { color: var(--color-primary); }
.pg-d__title {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Close pinned to the far right. */
.pg-d__header .pg-iconbtn { margin-left: auto; }
.pg-d__grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  padding: var(--space-xl);
  align-content: start;
}
.pg-d__photo {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #111;
}
.pg-d__stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: var(--space-lg);
}
.pg-d__stage-img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
.pg-d__arrow { position: absolute; top: 50%; transform: translateY(-50%); }
.pg-d__arrow--prev { left: 16px; }
.pg-d__arrow--next { right: 16px; }
.pg-d__counter {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
}
.pg-d__strip {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: var(--space-md);
  overflow-x: auto;
  background: #1a1a1a;
}
.pg-d__strip-thumb {
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
.pg-d__strip-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pg-d__strip-thumb.is-active { opacity: 1; border-color: #fff; }
.pg-d__strip-thumb:hover { opacity: 1; }

/* ───────── Transitions ───────── */
.pg-fade-enter-active, .pg-fade-leave-active { transition: opacity 220ms ease; }
.pg-fade-enter-from, .pg-fade-leave-to { opacity: 0; }

.pg-slide-enter-active, .pg-slide-leave-active { transition: opacity 300ms ease; }
.pg-slide-enter-active .pg-d__panel, .pg-slide-leave-active .pg-d__panel { transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1); }
.pg-slide-enter-from, .pg-slide-leave-to { opacity: 0; }
.pg-slide-enter-from .pg-d__panel, .pg-slide-leave-to .pg-d__panel { transform: translateX(100%); }
</style>
