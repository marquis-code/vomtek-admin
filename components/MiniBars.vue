<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: { label: string, value: number }[]
  height?: number
  highlightLast?: boolean
}>(), { height: 120, highlightLast: true })

const max = computed(() => Math.max(1, ...props.data.map(d => d.value)))
</script>

<template>
  <div class="flex items-end gap-[3px]" :style="{ height: `${height}px` }">
    <div v-for="(item, i) in data" :key="item.label + i" class="group relative flex h-full flex-1 flex-col items-center justify-end gap-1">
      <div class="pointer-events-none absolute -top-5 z-10 hidden border border-ink/15 bg-ink px-1.5 py-0.5 font-mono text-[9.5px] text-bone group-hover:block">
        {{ item.value }}
      </div>
      <div
        class="w-full max-w-[26px] transition-colors"
        :class="highlightLast && i === data.length - 1 ? 'bg-signal' : 'bg-ink/20 group-hover:bg-ink/40'"
        :style="{ height: item.value === 0 ? '2px' : `${Math.max(4, (item.value / max) * (height - 18))}px` }"
      />
      <span class="font-mono text-[6.5px] text-ink/25">{{ item.label }}</span>
    </div>
  </div>
</template>
