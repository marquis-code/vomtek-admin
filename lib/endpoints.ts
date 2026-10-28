import type { HttpClient } from './http'
import type {
  AdminUser,
  AnalyticsSummary,
  Application,
  Article,
  AuditLog,
  Job,
  MediaAsset,
  Message,
  Overview,
  Paged,
  Quote,
  StandardSystem,
  Subscriber,
} from '~/types'
import type { SiteSettings } from '~/types/settings'

const crud = <T>(http: HttpClient, base: string) => ({
  list: (query?: Record<string, string | number | undefined>) => http.get<Paged<T> | { items: T[], total: number }>(base, query),
  detail: (id: string) => http.get<T>(`${base}/${id}`),
  create: (body: Record<string, unknown>) => http.post<T>(base, body),
  update: (id: string, body: Record<string, unknown>) => http.patch<T>(`${base}/${id}`, body),
  remove: (id: string) => http.delete<{ ok: boolean }>(`${base}/${id}`),
})

export function createAdminApi(http: HttpClient) {
  return {
    http,

    overview: (days = 30) => http.get<Overview>('/admin/overview', { days }),
    analytics: (days = 30) => http.get<AnalyticsSummary>('/admin/analytics', { days }),
    activity: (limit = 20) => http.get<Paged<AuditLog>>('/admin/activity', { limit }),

    quotes: {
      list: (query?: Record<string, string | number | undefined>) => http.get<Paged<Quote>>('/admin/quotes', query),
      detail: (ref: string) => http.get<Quote>(`/admin/quotes/${ref}`),
      update: (ref: string, body: Record<string, unknown>) => http.patch<Quote>(`/admin/quotes/${ref}`, body),
      setStatus: (ref: string, status: string, note?: string) => http.patch<{ ok: boolean, status: string }>(`/admin/quotes/${ref}/status`, { status, note }),
      addNote: (ref: string, text: string) => http.post<Quote>(`/admin/quotes/${ref}/notes`, { text }),
      exportCsv: () => http.download('/admin/quotes/export.csv', 'vomtek-quotes.csv'),
    },

    messages: {
      list: (query?: Record<string, string | number | undefined>) => http.get<Paged<Message>>('/admin/messages', query),
      detail: (id: string) => http.get<Message>(`/admin/messages/${id}`),
      update: (id: string, body: Record<string, unknown>) => http.patch<Message>(`/admin/messages/${id}`, body),
      addNote: (id: string, text: string) => http.post<Message>(`/admin/messages/${id}/notes`, { text }),
      exportCsv: () => http.download('/admin/messages/export.csv', 'vomtek-messages.csv'),
    },

    applications: {
      list: (query?: Record<string, string | number | undefined>) => http.get<Paged<Application>>('/admin/applications', query),
      detail: (id: string) => http.get<Application>(`/admin/applications/${id}`),
      update: (id: string, body: Record<string, unknown>) => http.patch<Application>(`/admin/applications/${id}`, body),
      addNote: (id: string, text: string) => http.post<Application>(`/admin/applications/${id}/notes`, { text }),
      exportCsv: () => http.download('/admin/applications/export.csv', 'vomtek-applications.csv'),
    },

    jobs: crud<Job>(http, '/admin/jobs'),
    articles: crud<Article>(http, '/admin/articles'),
    catalog: crud<StandardSystem>(http, '/admin/catalog'),
    media: crud<MediaAsset>(http, '/admin/media'),

    subscribers: {
      list: () => http.get<{ items: Subscriber[], total: number }>('/admin/subscribers'),
      update: (id: string, status: 'active' | 'unsubscribed') => http.patch<{ ok: boolean }>(`/admin/subscribers/${id}`, { status }),
      exportCsv: () => http.download('/admin/subscribers/export.csv', 'vomtek-subscribers.csv'),
    },

    users: {
      list: () => http.get<{ items: AdminUser[], total: number }>('/admin/users'),
      create: (body: Record<string, unknown>) => http.post<{ user: AdminUser, temporaryPassword?: string }>('/admin/users', body),
      update: (id: string, body: Record<string, unknown>) => http.patch<AdminUser>(`/admin/users/${id}`, body),
    },

    settings: {
      get: () => http.get<SiteSettings>('/admin/settings'),
      update: (body: Partial<SiteSettings> & { resetSection?: string }) => http.patch<SiteSettings>('/admin/settings', body),
      reset: () => http.post<SiteSettings>('/admin/settings/reset', {}),
    },

    audit: (query?: Record<string, string | number | undefined>) => http.get<Paged<AuditLog>>('/admin/audit', query),
  }
}

export type AdminApi = ReturnType<typeof createAdminApi>
