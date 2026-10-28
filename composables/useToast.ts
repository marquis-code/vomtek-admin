export interface Toast {
  id: number
  message: string
  detail?: string
  tone: 'success' | 'error' | 'info'
}

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('admin-toasts', () => [])

  function push(message: string, tone: Toast['tone'] = 'success', detail?: string) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, detail, tone }]
    setTimeout(() => dismiss(id), 4200)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  return {
    toasts,
    push,
    dismiss,
    success: (message: string, detail?: string) => push(message, 'success', detail),
    error: (message: string, detail?: string) => push(message, 'error', detail),
    info: (message: string, detail?: string) => push(message, 'info', detail),
  }
}
