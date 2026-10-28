<script setup lang="ts">
const props = defineProps<{
  items: { label: string, value: number, meta?: string }[]
  format?: (value: number) => string
  empty?: string
}>()

const max = computed(() => Math.max(1, ...props.items.map(item => item.value)))
</script>

<template>
  <div class="space-y-2.5">
    <div v-for="item in items" :key="item.label">
      <div class="flex items-baseline justify-between gap-3">
        <span class="truncate text-[11.5px] text-ink/65">{{ item.label }}</span>
        <span class="shrink-0 font-mono text-[10.5px] text-ink/45">{{ format ? format(item.value) : item.value }}</span>
      </div>
      <div class="mt-1 h-1 w-full bg-ink/8">
        <div class="h-1 bg-ink/50" :style="{ width: `${(item.value / max) * 100}%` }" />
      </div>
    </div>
    <p v-if="!items.length" class="py-6 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink/30">{{ empty || 'No data yet.' }}</p>
  </div>
</template>
