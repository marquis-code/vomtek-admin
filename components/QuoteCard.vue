<script setup lang="ts">
import { ArrowUpRight, CalendarClock, MoveRight } from 'lucide-vue-next'
import type { Quote } from '~/types'

const props = defineProps<{ quote: Quote }>()
const emit = defineEmits<{ open: [], dragstart: [] }>()
const format = useFormat()
</script>

<template>
  <div
    draggable="true"
    class="group cursor-grab border border-ink/12 bg-surface p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_10px_30px_-18px_rgba(10,12,11,.35)] active:cursor-grabbing"
    @dragstart="emit('dragstart')"
    @click="emit('open')"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="font-mono text-[9.5px] text-signal-deep">{{ props.quote.ref }}</span>
      <PriorityBadge :priority="props.quote.priority" />
    </div>
    <p class="mt-2 truncate text-[12.5px] font-medium leading-tight">{{ props.quote.company || props.quote.name }}</p>
    <p class="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.05em] text-ink/35">{{ props.quote.projectTypeLabel }} · {{ props.quote.quantity }}u</p>

    <div class="mt-2.5 flex items-end justify-between gap-2 border-t border-ink/8 pt-2">
      <span class="font-mono text-[11px] text-ink/65">{{ props.quote.value ? format.currency(props.quote.value) : 'Unpriced' }}</span>
      <span class="flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/30">
        <CalendarClock v-if="props.quote.followUpAt" :size="9" class="text-signal-deep" />
        {{ format.relative(props.quote.createdAt) }}
        <ArrowUpRight :size="10" class="opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
    </div>
  </div>
</template>
