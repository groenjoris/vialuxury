<template>
  <div class="pw-gate">
    <div class="pw-gate__card">
      <img src="/images/logo-vialuxury.svg" alt="ViaLuxury" class="pw-gate__logo" />
      <h1 class="pw-gate__title">ViaLuxury Prototype</h1>
      <form class="pw-gate__form" @submit.prevent="submit">
        <input
          ref="inputRef"
          v-model="password"
          type="password"
          class="pw-gate__input"
          placeholder="Wachtwoord"
          autocomplete="off"
        />
        <button type="submit" class="pw-gate__btn">Ga verder</button>
        <p v-if="error" class="pw-gate__error">Onjuist wachtwoord</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const error = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (localStorage.getItem('vl-auth') === '1') {
    navigateTo('/')
    return
  }
  inputRef.value?.focus()
})

function submit() {
  if (password.value === 'dealfirst') {
    localStorage.setItem('vl-auth', '1')
    navigateTo('/')
  } else {
    error.value = true
    password.value = ''
    inputRef.value?.focus()
  }
}

useHead({ title: 'Login | ViaLuxury Prototype' })
definePageMeta({ layout: false })
</script>

<style scoped>
.pw-gate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #fafafa);
  padding: var(--space-xl);
}

.pw-gate__card {
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.pw-gate__logo {
  width: 180px;
  height: auto;
  margin: 0 auto var(--space-lg);
  display: block;
}

.pw-gate__title {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-lg);
}

.pw-gate__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pw-gate__input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 16px;
  outline: none;
  transition: border-color var(--transition-fast);
}

.pw-gate__input:focus {
  border-color: var(--color-primary);
}

.pw-gate__btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.pw-gate__btn:hover {
  background: var(--color-primary-hover);
}

.pw-gate__error {
  color: var(--color-error, #d32f2f);
  font-size: 14px;
  margin: 0;
}
</style>
