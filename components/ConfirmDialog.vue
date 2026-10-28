<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title: string
  text?: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{ close: [], confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[75] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm" @click.self="emit('close')">
        <div class="modal-panel w-full max-w-sm rounded-2xl border border-ink/15 bg-surface p-5 shadow-[0_30px_80px_-30px_rgba(10,12,11,.5)]">
          <span class="flex size-9 items-center justify-center rounded-full border" :class="danger ? 'border-signal/40 text-signal-deep' : 'border-ink/15 text-ink/50'">
            <TriangleAlert :size="16" />
          </span>
          <h3 class="mt-4 text-[18px] font-medium tracking-[-0.03em]">{{ title }}</h3>
          <p v-if="text" class="mt-1.5 text-[12px] leading-relaxed text-ink/50">{{ text }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="a-btn a-btn-ghost" :disabled="loading" @click="emit('close')">Cancel</button>
            <button type="button" class="a-btn" :class="danger ? 'a-btn-danger' : 'a-btn-primary'" :disabled="loading" @click="emit('confirm')">
              {{ loading ? 'Working…' : (confirmLabel || 'Confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
