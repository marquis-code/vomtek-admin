import { HttpClient } from '~/lib/http'
import { createAdminApi, type AdminApi } from '~/lib/endpoints'

let api: AdminApi | null = null

export function useApi(): AdminApi {
  if (api) return api
  const config = useRuntimeConfig()
  const auth = useAuth()

  api = createAdminApi(new HttpClient(
    config.public.apiBase,
    () => auth.token.value,
    () => auth.refresh(),
    () => { void auth.logout() },
  ))

  return api
}
