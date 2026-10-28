export function useMedia() {
  const config = useRuntimeConfig()

  function url(key?: string, width = 800) {
    if (!key) return ''
    if (key.startsWith('http') || key.startsWith('/')) return key
    return `${config.public.siteUrl}/images/optimized/${key}-${width}.jpg`
  }

  function srcset(key?: string, widths = [480, 800, 1200]) {
    if (!key || key.startsWith('http') || key.startsWith('/')) return undefined
    return widths.map(width => `${config.public.siteUrl}/images/optimized/${key}-${width}.jpg ${width}w`).join(', ')
  }

  return { url, srcset }
}
