<script setup lang="ts">
import { Check, ChevronDown, Search } from 'lucide-vue-next'

interface Option {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  options: Option[]
  placeholder?: string
  disabled?: boolean
  compact?: boolean
  searchable?: boolean
}>(), {
  placeholder: 'Select…',
  disabled: false,
  compact: false,
  searchable: true,
})

const model = defineModel<string | number>({ default: '' })
const open = ref(false)
const query = ref('')
const active = ref(0)
const trigger = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const position = ref({ top: 0, left: 0, width: 0 })

const selected = computed(() => props.options.find(o => String(o.value) === String(model.value)))
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => `${o.label} ${o.description || ''}`.toLowerCase().includes(q))
})

function measure() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const width = Math.max(rect.width, 200)
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const top = window.innerHeight - rect.bottom > 230 ? rect.bottom + 6 : Math.max(8, rect.top - 236)
  position.value = { top, left, width }
}
function openMenu() {
  if (props.disabled) return
  query.value = ''
  active.value = Math.max(0, filtered.value.findIndex(o => String(o.value) === String(model.value)))
  open.value = true
  nextTick(() => { measure(); searchInput.value?.focus() })
}
function close() {
  open.value = false
  query.value = ''
}
function choose(option: Option) {
  if (option.disabled) return
  model.value = option.value
  close()
  trigger.value?.focus()
}
function move(delta: number) {
  if (!filtered.value.length) return
  active.value = (active.value + delta + filtered.value.length) % filtered.value.length
  nextTick(() => menu.value?.querySelector<HTMLElement>(`[data-index="${active.value}"]`)?.scrollIntoView({ block: 'nearest' }))
}
function onTriggerKey(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!open.value) openMenu()
  }
  else if (event.key === 'Escape') close()
}
function onMenuKey(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Enter') {
    event.preventDefault()
    const option = filtered.value[active.value]
    if (option) choose(option)
  }
  else if (event.key === 'Escape') { event.stopPropagation(); close() }
}
function outside(event: PointerEvent) {
  if (!open.value) return
  const target = event.target as Node
  if (trigger.value?.contains(target) || menu.value?.contains(target)) return
  close()
}
function onResize() { if (open.value) measure() }

onMounted(() => {
  document.addEventListener('pointerdown', outside)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="a-input flex w-full items-center justify-between gap-2 text-left"
      :class="[compact ? '!h-8 !text-[12px]' : '', disabled ? 'cursor-not-allowed opacity-50' : '']"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="open ? close() : openMenu()"
      @keydown="onTriggerKey"
    >
      <span class="truncate" :class="selected ? '' : 'text-ink/35'">{{ selected?.label || placeholder }}</span>
      <ChevronDown :size="13" class="shrink-0 text-ink/35 transition-transform" :class="open ? 'rotate-180' : ''" />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="open"
          ref="menu"
          class="fixed z-[120] overflow-hidden rounded-xl border border-ink/15 bg-surface text-ink shadow-[0_22px_60px_-24px_rgba(10,12,11,.4)]"
          :style="{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px` }"
          role="listbox"
        >
          <div v-if="searchable" class="flex items-center gap-2 border-b border-ink/10 px-3">
            <Search :size="12" class="shrink-0 text-ink/45" />
            <input ref="searchInput" v-model="query" type="text" class="h-9 w-full bg-transparent text-[12.5px] outline-none placeholder:text-ink/55" placeholder="Search…" autocomplete="off" @keydown="onMenuKey">
          </div>
          <div class="max-h-56 overflow-y-auto p-1.5">
            <button
              v-for="(option, i) in filtered"
              :key="option.value"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors"
              :class="[i === active ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]', option.disabled ? 'cursor-not-allowed opacity-40' : '']"
              :data-index="i"
              role="option"
              :aria-selected="String(option.value) === String(model)"
              @mouseenter="active = i"
              @click="choose(option)"
            >
              <span class="min-w-0">
                <span class="block text-[12.5px]">{{ option.label }}</span>
                <span v-if="option.description" class="mt-0.5 block text-[11px] text-ink/55">{{ option.description }}</span>
              </span>
              <Check v-if="String(option.value) === String(model)" :size="12" class="shrink-0 text-brand" />
            </button>
            <p v-if="!filtered.length" class="px-3 py-4 text-center text-[11.5px] text-ink/40">No matches</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
