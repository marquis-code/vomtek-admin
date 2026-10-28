<script setup lang="ts">
const props = defineProps<{ priority: string }>()
const map: Record<string, string> = {
  low: 'text-ink/35 border-ink/12',
  normal: 'text-ink/50 border-ink/15',
  high: 'text-amber-800 border-amber-700/30 bg-amber-500/8',
  urgent: 'text-danger border-danger/40 bg-danger-soft',
}
</script>

<template>
  <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em]" :class="map[priority] || map.normal">
    {{ priority }}
  </span>
</template>
