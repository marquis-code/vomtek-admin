export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth()
  await auth.bootstrap()

  if (to.path === '/login') {
    if (auth.user.value) return navigateTo('/')
    return
  }

  if (!auth.user.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
