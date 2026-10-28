<script setup lang="ts">
defineProps<{ title: string, description?: string, index?: string }>()
</script>

<template>
  <section class="a-card p-5">
    <div class="mb-4 flex items-start justify-between gap-4 border-b border-ink/10 pb-3">
      <div>
        <p v-if="index" class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-signal-deep">{{ index }}</p>
        <h3 class="mt-0.5 text-[16px] font-medium tracking-[-0.02em]">{{ title }}</h3>
        <p v-if="description" class="mt-1 max-w-xl text-[11.5px] leading-relaxed text-ink/45">{{ description }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </section>
</template>
