import type { AdminUser } from '~/types'

interface AuthResponse {
  accessToken: string
  user: AdminUser
}

export function useAuth() {
  const config = useRuntimeConfig()
  const token = useState<string | null>('admin-token', () => null)
  const user = useState<AdminUser | null>('admin-user', () => null)
  const ready = useState<boolean>('admin-ready', () => false)
  const bootstrapping = useState<Promise<void> | null>('admin-bootstrap', () => null)

  const base = config.public.apiBase

  function persist(accessToken: string | null) {
    token.value = accessToken
    if (import.meta.client) {
      if (accessToken) localStorage.setItem('vt_admin_token', accessToken)
      else localStorage.removeItem('vt_admin_token')
    }
  }

  async function bootstrap() {
    if (ready.value) return
    if (bootstrapping.value) return await bootstrapping.value

    bootstrapping.value = (async () => {
      if (import.meta.client) {
        const saved = localStorage.getItem('vt_admin_token')
        if (saved) {
          persist(saved)
          try {
            user.value = await $fetch<AdminUser>(`${base}/auth/me`, {
              headers: { Authorization: `Bearer ${saved}` },
            })
            ready.value = true
            return
          }
          catch {
            persist(null)
          }
        }
      }
      try {
        await refresh()
      }
      catch {
        user.value = null
      }
      finally {
        ready.value = true
      }
    })()

    return await bootstrapping.value
  }

  async function refresh(): Promise<boolean> {
    try {
      const response = await $fetch<AuthResponse>(`${base}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      persist(response.accessToken)
      user.value = response.user
      return true
    }
    catch {
      persist(null)
      user.value = null
      return false
    }
  }

  async function login(email: string, password: string) {
    const response = await $fetch<AuthResponse>(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      body: { email, password },
    })
    persist(response.accessToken)
    user.value = response.user
    ready.value = true
    return response.user
  }

  async function logout() {
    try {
      await $fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' })
    }
    catch { /* session may already be gone */ }
    persist(null)
    user.value = null
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await $fetch(`${base}/auth/password`, {
      method: 'PATCH',
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      body: { currentPassword, newPassword },
    })
    if (user.value) user.value = { ...user.value, mustChangePassword: false }
  }

  return { token, user, ready, bootstrap, refresh, login, logout, changePassword }
}
