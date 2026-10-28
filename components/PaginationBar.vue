<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
const props = defineProps<{ page: number, pages: number, total: number, limit: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const from = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.limit + 1)
const to = computed(() => Math.min(props.total, props.page * props.limit))
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-ink/12 px-4 py-3">
    <p class="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/35">{{ from }}–{{ to }} of {{ total }}</p>
    <div class="flex items-center gap-1">
      <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/50 disabled:opacity-30" :disabled="page <= 1" @click="emit('change', page - 1)">
        <ChevronLeft :size="12" />
      </button>
      <span class="px-2 font-mono text-[10.5px] text-ink/50">{{ page }} / {{ pages }}</span>
      <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/50 disabled:opacity-30" :disabled="page >= pages" @click="emit('change', page + 1)">
        <ChevronRight :size="12" />
      </button>
    </div>
  </div>
</template>
