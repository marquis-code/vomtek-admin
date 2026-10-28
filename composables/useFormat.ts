export function useFormat() {
  const date = (value?: string | Date, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => {
    if (!value) return '—'
    const parsed = value instanceof Date ? value : new Date(value.length === 10 ? `${value}T12:00:00` : value)
    if (Number.isNaN(parsed.getTime())) return '—'
    return parsed.toLocaleDateString('en-US', options)
  }

  const dateTime = (value?: string | Date) => date(value, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

  const relative = (value?: string | Date) => {
    if (!value) return '—'
    const parsed = value instanceof Date ? value : new Date(value)
    const diff = Date.now() - parsed.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date(parsed)
  }

  const currency = (value?: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)

  const initials = (name?: string) => (name || '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const number = (value?: number) => new Intl.NumberFormat('en-US').format(value || 0)

  return { date, dateTime, relative, currency, initials, number }
}
