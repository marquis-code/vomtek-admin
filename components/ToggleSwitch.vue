<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
defineProps<{ label?: string, description?: string }>()
</script>

<template>
  <label class="flex cursor-pointer items-center justify-between gap-4 py-1.5">
    <span>
      <span v-if="label" class="block text-[12px] font-medium text-ink/75">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-[11.5px] text-ink/40">{{ description }}</span>
    </span>
    <span class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors" :class="model ? 'bg-signal' : 'bg-ink/15'">
      <input v-model="model" type="checkbox" class="peer sr-only">
      <span class="inline-block size-3.5 rounded-full bg-white shadow transition-transform" :class="model ? 'translate-x-[18px]' : 'translate-x-[3px]'" />
    </span>
  </label>
</template>
