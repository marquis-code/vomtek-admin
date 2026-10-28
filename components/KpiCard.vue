<script setup lang="ts">
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next'

withDefaults(defineProps<{
  label: string
  value: string | number
  hint?: string
  trend?: number
  accent?: boolean
  loading?: boolean
}>(), {
  accent: false,
  loading: false,
})
</script>

<template>
  <div class="a-card relative overflow-hidden p-4" :class="accent ? 'border-signal/40' : ''">
    <span v-if="accent" class="absolute inset-x-0 top-0 h-[2px] bg-signal" aria-hidden="true" />
    <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">{{ label }}</p>
    <div v-if="loading" class="mt-3 h-8 w-24 a-skeleton" />
    <p v-else class="mt-2 font-display text-[32px] font-semibold leading-none tracking-[-0.05em]">{{ value }}</p>
    <div class="mt-2 flex items-center justify-between gap-2">
      <p v-if="hint" class="text-[11.5px] leading-relaxed text-ink/40">{{ hint }}</p>
      <span v-if="trend !== undefined" class="flex items-center gap-0.5 font-mono text-[10px]" :class="trend >= 0 ? 'text-emerald-700' : 'text-danger'">
        <component :is="trend >= 0 ? ArrowUpRight : ArrowDownRight" :size="10" />
        {{ Math.abs(trend) }}%
      </span>
    </div>
  </div>
</template>
