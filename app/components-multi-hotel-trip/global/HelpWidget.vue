<template>
  <!-- Release 1 — helpdesk-chatwidget. Dummy van een third-party widget (niet
       interactief): vast rechtsonder in de viewport en altijd bovenop alles.
       Schuift een zijpaneel van rechts in (hamburgermenu, arrangementen-/
       dealspaneel, fotogalerij, mobiele zoekmodal), dan beweegt de widget
       frame voor frame mee naar links alsof hij aan de linkerrand van dat
       paneel vastzit; past hij niet meer naast het paneel, dan vervaagt hij.
       Op de kaartpagina wordt hij niet getoond. Rendert alleen client-side en
       maar één keer per pagina (ook als de header vaker voorkomt). -->
  <Teleport to="body">
    <div v-if="visible" ref="root" class="help-widget" aria-hidden="true">
      <div class="help-widget__pill">
        <span class="help-widget__dot"></span>
        <span class="help-widget__label">{{ t('help.widget') }}</span>
      </div>
      <div class="help-widget__btn">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <!-- Telefoonhoorn (core icon "phone") + klein envelopje rechtsboven. -->
          <g transform="translate(0.5 3.5) scale(0.82)">
            <path d="M7.44489 16.556C10.4019 19.443 14.2139 21.199 18.7889 21.818C19.7959 21.954 20.7539 21.321 21.0109 20.337L21.9999 16.558L15.6329 13.826L13.0749 16.347C11.9689 15.678 10.9399 14.888 10.0079 13.992C9.11189 13.06 8.32189 12.031 7.65289 10.925L10.1739 8.367L7.44189 2L3.66289 2.989C2.67989 3.246 2.04589 4.204 2.18189 5.211C2.80189 9.786 4.55689 13.599 7.44389 16.555L7.44489 16.556Z" />
          </g>
          <g transform="translate(13.5 1.5) scale(0.42)" stroke-width="3.2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 6l10 7 10-7" />
          </g>
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useMultiHotelTripI18n()
const route = useRoute()

/* Rechter zijpanelen waarvan de widget de linkerrand volgt. */
const PANEL_SELECTOR = [
  '.menu-panel',            // hamburgermenu (SiteHeader)
  '.panel-overlay > .panel', // PackageSidePanel / HotelDealsSidePanel
  '.pg-d__panel',           // fotogalerij (desktop, 80vw)
  '.msm',                   // mobiele zoekmodal (volledig scherm)
].join(', ')
/* Afstand tot de viewportrand (zelfde marge naast een open paneel). */
const MARGIN = 20

/* Eén widget per pagina, ook als de header vaker voorkomt of bij een
   paginawissel de nieuwe header eerder mount dan de oude verdwijnt: alle
   instanties melden zich aan en alleen de laatst aangemelde is zichtbaar. */
const instances = reactive<symbol[]>([])
const me = Symbol('help-widget')
const visible = computed(() => instances[instances.length - 1] === me && !route.path.includes('/kaart'))

const root = ref<HTMLElement | null>(null)

let raf = 0
let observer: MutationObserver | null = null

function measure() {
  raf = 0
  const el = root.value
  if (!el) return
  const vw = document.documentElement.clientWidth
  const panels = document.querySelectorAll<HTMLElement>(PANEL_SELECTOR)
  let offset = 0
  panels.forEach((p) => {
    const r = p.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return
    offset = Math.max(offset, vw - r.left)
  })
  offset = Math.min(Math.max(0, offset), vw)
  el.style.setProperty('--help-offset', `${Math.round(offset * 100) / 100}px`)
  el.classList.toggle('help-widget--hidden', offset + el.offsetWidth + 2 * MARGIN > vw)
  // Zolang er een paneel in de DOM staat (ook tijdens de in-/uitschuif-
  // animatie) elke frame opnieuw meten.
  if (panels.length) raf = requestAnimationFrame(measure)
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(measure)
}

function start() {
  if (observer) return
  observer = new MutationObserver(schedule)
  observer.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', schedule)
  schedule()
}

function stop() {
  observer?.disconnect()
  observer = null
  window.removeEventListener('resize', schedule)
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

onMounted(() => {
  instances.push(me)
  watch(visible, async (v) => {
    if (v) { await nextTick(); start() } else stop()
  }, { immediate: true })
})

onBeforeUnmount(() => {
  const i = instances.indexOf(me)
  if (i >= 0) instances.splice(i, 1)
  stop()
})
</script>

<style scoped>
.help-widget {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2147483640;
  display: flex;
  align-items: center;
  gap: 10px;
  /* Volgt de linkerrand van een open zijpaneel (per frame gezet in JS). */
  transform: translate3d(calc(-1 * var(--help-offset, 0px)), 0, 0);
  transition: opacity 180ms ease;
  pointer-events: none;
  font-family: var(--font-body, system-ui, sans-serif);
}
.help-widget--hidden { opacity: 0; }

.help-widget__pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 18px 0 16px;
  border-radius: 22px;
  background: #f26f1d;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  white-space: nowrap;
}
.help-widget__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
}
.help-widget__label {
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
}
.help-widget__btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1f4d4c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .help-widget { right: 12px; bottom: 12px; }
  .help-widget__pill { height: 40px; padding: 0 14px; }
  .help-widget__label { font-size: 14px; }
  .help-widget__btn { width: 50px; height: 50px; }
}
</style>
