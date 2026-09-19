import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

// Checkout (room table flow): sticky element dat hoger kan worden dan de
// viewport (kassabon na een kamerselectie): zolang het past plakt het op
// `preferredTop`, wordt het hoger dan de viewport dan schuift de top-offset
// omhoog (negatief) zodat de ONDERKANT — met de CTA — 16px boven de
// onderrand blijft. Overgenomen uit het flexibel-annuleren prototype.
export function useStickyFit(
  el: Ref<HTMLElement | HTMLElement[] | null>,
  preferredTop: number,
  bottomMargin = 16,
) {
  const top = ref(preferredTop)

  // Een template-ref binnen een v-for wordt door Vue als array gevuld.
  const node = computed<HTMLElement | null>(() => {
    const v = el.value
    return Array.isArray(v) ? (v[0] ?? null) : v
  })

  function update() {
    const h = node.value?.offsetHeight ?? 0
    top.value = Math.min(preferredTop, window.innerHeight - h - bottomMargin)
  }

  let observer: ResizeObserver | null = null
  onMounted(() => {
    observer = new ResizeObserver(update)
    if (node.value) observer.observe(node.value)
    window.addEventListener('resize', update)
    update()
  })
  // Het element kan door een v-if wisselen: opnieuw observeren.
  watch(node, (curr, prev) => {
    if (prev) observer?.unobserve(prev)
    if (curr) observer?.observe(curr)
    update()
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('resize', update)
  })

  return top
}
