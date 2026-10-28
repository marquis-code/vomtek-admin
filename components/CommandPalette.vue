<script setup lang="ts">
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { navigation } from '~/lib/navigation'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const query = ref('')
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)

const items = computed(() => navigation.flatMap(group => group.items.map(item => ({ ...item, group: group.label }))))
const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return items.value
  return items.value.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(term))
})

watch(() => props.open, async (open) => {
  if (!open) return
  query.value = ''
  active.value = 0
  await nextTick()
  input.value?.focus()
})

function move(delta: number) {
  if (!filtered.value.length) return
  active.value = (active.value + delta + filtered.value.length) % filtered.value.length
}

async function go(index = active.value) {
  const item = filtered.value[index]
  if (!item) return
  emit('close')
  await navigateTo(item.to)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') { event.preventDefault(); move(1) }
  else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1) }
  else if (event.key === 'Enter') { event.preventDefault(); go() }
  else if (event.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0" leave-active-class="transition duration-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" @click.self="emit('close')">
        <div class="w-full max-w-lg border border-ink/20 bg-surface shadow-[0_30px_90px_-30px_rgba(10,12,11,.5)]" @keydown="onKeydown">
          <div class="flex items-center gap-2.5 border-b border-ink/12 px-4">
            <Search :size="15" class="text-ink/35" />
            <input ref="input" v-model="query" type="text" placeholder="Search quotes, content, settings…" class="h-12 flex-1 bg-transparent text-[13px] outline-none">
            <kbd class="border border-ink/15 px-1.5 py-0.5 font-mono text-[9.5px] text-ink/40">ESC</kbd>
          </div>
          <div class="max-h-[45vh] overflow-y-auto p-1.5">
            <button
              v-for="(item, i) in filtered"
              :key="item.to"
              type="button"
              class="flex w-full items-center justify-between px-3 py-2 text-left"
              :class="active === i ? 'bg-ink text-bone' : 'text-ink/70 hover:bg-paper'"
              @mouseenter="active = i"
              @click="go(i)"
            >
              <span class="flex items-center gap-3">
                <span class="font-mono text-[9.5px] uppercase tracking-[0.1em]" :class="active === i ? 'text-signal' : 'text-ink/30'">{{ item.group }}</span>
                <span class="text-[12.5px]">{{ item.label }}</span>
              </span>
              <CornerDownLeft v-if="active === i" :size="12" />
            </button>
            <p v-if="!filtered.length" class="px-3 py-6 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/35">No matches.</p>
          </div>
          <div class="flex items-center gap-4 border-t border-ink/12 px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/30">
            <span class="flex items-center gap-1"><ArrowUp :size="10" /><ArrowDown :size="10" /> navigate</span>
            <span class="flex items-center gap-1"><CornerDownLeft :size="10" /> open</span>
            <span class="ml-auto">Vomtek Studio</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
