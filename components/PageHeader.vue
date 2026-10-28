<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-col justify-between gap-4 border-b border-ink/12 pb-5 md:flex-row md:items-end">
    <div>
      <p v-if="eyebrow" class="font-mono text-[9.5px] uppercase tracking-[0.16em] text-signal-deep">{{ eyebrow }}</p>
      <h2 class="mt-1 text-[26px] font-medium tracking-[-0.04em] md:text-[30px]">{{ title }}</h2>
      <p v-if="description" class="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-ink/50">{{ description }}</p>
    </div>
    <div class="flex shrink-0 flex-wrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>
