<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean, title?: string, subtitle?: string, width?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-[70] flex justify-end bg-ink/35 backdrop-blur-[2px]" @click.self="emit('close')">
        <div class="drawer-panel flex h-full w-full flex-col rounded-l-2xl border-l border-ink/15 bg-surface shadow-[-20px_0_60px_-30px_rgba(10,12,11,.4)]" :class="width || 'max-w-xl'">
          <div class="flex items-start justify-between gap-4 border-b border-ink/12 px-5 py-4">
            <div>
              <p v-if="subtitle" class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-signal-deep">{{ subtitle }}</p>
              <h2 class="mt-0.5 text-[19px] font-medium tracking-[-0.03em]">{{ title }}</h2>
            </div>
            <button type="button" class="flex size-8 items-center justify-center rounded-full border border-ink/15 text-ink/45 hover:border-brand hover:text-brand" aria-label="Close" @click="emit('close')">
              <X :size="15" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto"><slot /></div>
          <div v-if="$slots.footer" class="border-t border-ink/12 px-5 py-3"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
