export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/password') return
  if (!import.meta.client) return
  if (localStorage.getItem('vl-auth') === '1') return
  return navigateTo('/password')
})
