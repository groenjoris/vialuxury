<script setup lang="ts">
// Room table: opens when the guest clicks a selector of the "other"
// cancellation policy. Two wide buttons decide the policy for ALL rooms.
const emit = defineEmits<{
  choose: [value: 'flexible' | 'nonrefundable']
  close: []
}>()
</script>

<template>
  <div class="pc" role="dialog" aria-modal="true" aria-labelledby="pc-title" @click.self="emit('close')">
    <div class="pc__card">
      <button class="pc__close" type="button" aria-label="Sluiten" @click="emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>

      <h2 id="pc-title" class="t-h2 pc__title">
        Je kan geen combinatie van gratis annuleren en niet-terugbetaalbaar boeken.
      </h2>
      <p class="t-body c-grey">Wat heeft je voorkeur?</p>

      <div class="pc__actions">
        <button class="pc__btn pc__btn--flex" type="button" @click="emit('choose', 'flexible')">
          Alle kamers gratis annuleren
          <span class="pc__btnsub">(aanbevolen)</span>
        </button>
        <button class="pc__btn pc__btn--nonref" type="button" @click="emit('choose', 'nonrefundable')">
          Alle kamers niet-terugbetaalbaar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(26, 30, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.pc__card {
  position: relative;
  background: var(--c-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-pop);
  width: 480px;
  max-width: 100%;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pc__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-via-black);
  transition: background 0.15s ease;
}
.pc__close:hover {
  background: var(--c-surface);
}
.pc__title {
  line-height: 28px;
}
.pc__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
/* Tweede regel in de groene knop, i.p.v. de "Aanbevolen"-sticker */
.pc__btnsub {
  display: block;
  font-size: var(--t-body);
  font-weight: 500;
  margin-top: 2px;
}
.pc__btn {
  width: 100%;
  padding: 18px 24px;
  border-radius: var(--radius);
  font-size: var(--t-body-lg);
  font-weight: var(--w-black);
  transition: background 0.15s ease;
}
.pc__btn--flex {
  background: var(--c-via-green);
  color: var(--c-white);
}
.pc__btn--flex:hover {
  background: #2db07d;
}
.pc__btn--nonref {
  background: var(--c-white);
  color: var(--c-via-black);
  border: 1px solid var(--c-dark-grey);
  font-weight: 500;
}
.pc__btn--nonref:hover {
  background: var(--c-surface);
}
</style>
