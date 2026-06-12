<template>
  <!-- Backdrop catches outside clicks to dismiss. -->
  <Teleport to="body">
    <div v-if="modelValue" class="share-menu-backdrop" @click="close" />
  </Teleport>

  <Transition name="share-menu-fade">
    <div v-if="modelValue" class="share-menu" @click.stop>
      <span class="share-menu__arrow" />

      <div class="share-menu__header">
        <p class="share-menu__title">{{ title }}</p>
      </div>

      <div class="share-menu__sep" />

      <a
        class="share-menu__row"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="close"
      >
        <span class="share-menu__icon" style="background: linear-gradient(160deg,#5be35b,#21c04a)">💬</span>
        <span class="share-menu__label">WhatsApp</span>
      </a>

      <a
        class="share-menu__row"
        :href="facebookUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click="close"
      >
        <span class="share-menu__icon" style="background: linear-gradient(160deg,#3aa0ff,#1d6fe0)">f</span>
        <span class="share-menu__label">Facebook</span>
      </a>

      <a
        class="share-menu__row"
        :href="emailUrl"
        @click="close"
      >
        <span class="share-menu__icon" style="background: linear-gradient(160deg,#5ac8fa,#1f8cf0)">✉️</span>
        <span class="share-menu__label">E-mail</span>
      </a>

      <div class="share-menu__sep" />

      <button type="button" class="share-menu__row" @click="copyLink">
        <span class="share-menu__icon share-menu__icon--plain">⧉</span>
        <span class="share-menu__label">{{ copied ? 'Gekopieerd' : 'Kopieer link' }}</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  url: string
  title?: string
}>(), {
  title: 'Ik heb een mooi luxe hotel gevonden',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const whatsappUrl = computed(
  () => `https://wa.me/?text=${encodeURIComponent(`${props.title} ${props.url}`)}`,
)
const facebookUrl = computed(
  () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`,
)
const emailUrl = computed(
  () => `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(props.url)}`,
)

function close() {
  emit('update:modelValue', false)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url)
  }
  catch {
    // Fallback for browsers without clipboard API / insecure context.
    const ta = document.createElement('textarea')
    ta.value = props.url
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    }
    catch {
      // ignore
    }
    document.body.removeChild(ta)
  }
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 1500)
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<style scoped>
.share-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1190;
}

.share-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  z-index: 1200;
  width: 300px;
  padding: 6px;
  background: rgba(250, 250, 250, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  font-family: var(--font-body);
}

/* Little upward pointer toward the share button. */
.share-menu__arrow {
  position: absolute;
  top: -7px;
  left: 18px;
  width: 14px;
  height: 14px;
  background: rgba(250, 250, 250, 0.98);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  transform: rotate(45deg);
}

.share-menu__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 12px;
}

.share-menu__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: #1a1a1a;
}

.share-menu__sep {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 4px 6px;
}

.share-menu__row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 8px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
}
.share-menu__row:hover {
  background: rgba(0, 0, 0, 0.06);
}

.share-menu__icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.share-menu__icon--plain {
  background: none;
  box-shadow: none;
  font-size: 17px;
  color: #444;
}

.share-menu__label {
  font-size: 15px;
  color: #1a1a1a;
}

.share-menu-fade-enter-active,
.share-menu-fade-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.share-menu-fade-enter-from,
.share-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
