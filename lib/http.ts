export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

type Query = Record<string, string | number | boolean | undefined | null>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  headers?: Record<string, string>
  responseType?: 'json' | 'blob'
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
    private readonly refresh: () => Promise<boolean>,
    private readonly onUnauthorized?: () => void,
  ) {}

  get<T>(path: string, query?: Query) {
    return this.request<T>(path, { method: 'GET', query })
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body })
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body })
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' })
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return await this.execute<T>(path, options, true)
  }

  async download(path: string, filename: string) {
    const token = this.getToken()
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new ApiError(response.status, 'Download failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  private async execute<T>(path: string, options: RequestOptions, allowRefresh: boolean): Promise<T> {
    const token = this.getToken()
    const query = options.query
      ? Object.entries(options.query)
          .filter(([, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&')
      : ''
    const url = `${this.baseUrl}${path}${query ? `?${query}` : ''}`

    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        credentials: 'include',
      })

      if (response.status === 401 && allowRefresh) {
        const refreshed = await this.refresh()
        if (refreshed) return await this.execute<T>(path, options, false)
        this.onUnauthorized?.()
      }

      if (!response.ok) {
        let data: unknown
        let message = `Request failed (${response.status})`
        try {
          data = await response.json()
          const payload = data as { message?: string | string[] }
          if (payload?.message) message = Array.isArray(payload.message) ? payload.message.join(' ') : payload.message
        }
        catch { /* no JSON body */ }
        throw new ApiError(response.status, message, data)
      }

      if (response.status === 204) return undefined as T
      return await response.json() as T
    }
    catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(0, (error as Error).message || 'Network error')
    }
  }
}
