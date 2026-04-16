<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="auth-overlay" @click.self="emit('close')">
        <div class="auth-popup">
          <button class="auth-popup__close" @click="emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Tab header -->
          <div class="auth-popup__tabs">
            <button
              class="auth-popup__tab"
              :class="{ 'auth-popup__tab--active': activeTab === 'login' }"
              @click="activeTab = 'login'"
            >{{ t('auth.login') }}</button>
            <button
              class="auth-popup__tab"
              :class="{ 'auth-popup__tab--active': activeTab === 'register' }"
              @click="activeTab = 'register'"
            >{{ t('auth.register') }}</button>
          </div>

          <!-- Social buttons -->
          <div class="auth-popup__social">
            <button class="auth-popup__social-btn auth-popup__social-btn--google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {{ t('auth.continueWithGoogle') }}
            </button>
            <button class="auth-popup__social-btn auth-popup__social-btn--facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {{ t('auth.continueWithFacebook') }}
            </button>
            <button class="auth-popup__social-btn auth-popup__social-btn--apple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {{ t('auth.continueWithApple') }}
            </button>
          </div>

          <div class="auth-popup__divider">
            <span>{{ t('auth.orContinueWith') }}</span>
          </div>

          <!-- Email/Password form -->
          <form class="auth-popup__form" @submit.prevent="emit('login')">
            <div class="auth-popup__field">
              <label class="auth-popup__label">{{ t('auth.email') }}</label>
              <input type="email" class="auth-popup__input" placeholder="naam@voorbeeld.nl" />
            </div>
            <div class="auth-popup__field">
              <label class="auth-popup__label">{{ t('auth.password') }}</label>
              <input type="password" class="auth-popup__input" placeholder="••••••••" />
            </div>
            <button v-if="activeTab === 'login'" type="button" class="auth-popup__forgot">{{ t('auth.forgotPassword') }}</button>
            <button type="submit" class="btn btn-primary auth-popup__submit">
              {{ activeTab === 'login' ? t('auth.loginBtn') : t('auth.createAccountBtn') }}
            </button>
          </form>

          <p class="auth-popup__switch">
            <template v-if="activeTab === 'login'">
              {{ t('auth.noAccount') }}
              <button @click="activeTab = 'register'">{{ t('auth.signUp') }}</button>
            </template>
            <template v-else>
              {{ t('auth.alreadyHaveAccount') }}
              <button @click="activeTab = 'login'">{{ t('auth.loginBtn') }}</button>
            </template>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  login: []
}>()

const activeTab = ref<'login' | 'register'>('register')
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-popup {
  background: #fff;
  border-radius: 16px;
  width: 440px;
  max-width: 92vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
}

.auth-popup__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--color-background-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  transition: all 150ms;
}

.auth-popup__close:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

/* Tabs */
.auth-popup__tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-border-light);
}

.auth-popup__tab {
  flex: 1;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 150ms;
}

.auth-popup__tab--active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-primary);
}

.auth-popup__tab:hover:not(.auth-popup__tab--active) {
  color: var(--color-text-secondary);
}

/* Social buttons */
.auth-popup__social {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.auth-popup__social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
  color: var(--color-text-primary);
}

.auth-popup__social-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-background-secondary);
}

.auth-popup__social-btn--apple {
  background: #000;
  color: #fff;
  border-color: #000;
}

.auth-popup__social-btn--apple:hover {
  background: #222;
  border-color: #222;
}

/* Divider */
.auth-popup__divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.auth-popup__divider::before,
.auth-popup__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border-light);
}

.auth-popup__divider span {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* Form */
.auth-popup__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-popup__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-popup__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.auth-popup__input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: #fff;
  transition: border-color 150ms;
}

.auth-popup__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(197, 162, 84, 0.12);
}

.auth-popup__input::placeholder {
  color: var(--color-text-muted);
}

.auth-popup__forgot {
  align-self: flex-end;
  font-size: 13px;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-top: -6px;
}

.auth-popup__submit {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 4px;
}

.auth-popup__switch {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 16px;
}

.auth-popup__switch button {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
