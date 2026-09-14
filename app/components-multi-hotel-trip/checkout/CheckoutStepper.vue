<script setup lang="ts">
const props = withDefaults(defineProps<{ active?: number }>(), { active: 2 })

interface Step {
  label: string
  state: 'done' | 'active' | 'todo'
}

const labels = ['Kies datum', 'Kies kamertype', 'Gegevens en betaalwijze']

const steps = computed<Step[]>(() =>
  labels.map((label, i) => ({
    label,
    state: i + 1 < props.active ? 'done' : i + 1 === props.active ? 'active' : 'todo',
  })),
)
</script>

<template>
  <nav class="stepper">
    <template v-for="(step, i) in steps" :key="step.label">
      <div class="step" :class="`step--${step.state}`">
        <span class="step__dot">
          <svg v-if="step.state === 'done'" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-else class="step__num">{{ i + 1 }}</span>
        </span>
        <span class="step__label">{{ step.label }}</span>
      </div>
      <span v-if="i < steps.length - 1" class="step__line" />
    </template>
  </nav>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.step__dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: var(--w-black);
}
.step__label {
  font-size: var(--t-body);
  font-weight: 500;
  white-space: nowrap;
}
.step__line {
  height: 1px;
  width: 180px;
  background: var(--c-light-grey);
}

/* States */
.step--done .step__dot { background: var(--c-via-green); color: var(--c-white); }
.step--done .step__label { color: var(--c-via-black); }

.step--active .step__dot { background: var(--c-via-green); color: var(--c-white); }
.step--active .step__label { color: var(--c-via-black); font-weight: var(--w-black); }

.step--todo .step__dot { background: var(--c-via-black); color: var(--c-white); }
.step--todo .step__label { color: var(--c-medium-grey); }
</style>
