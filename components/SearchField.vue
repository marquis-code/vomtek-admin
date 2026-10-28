<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
const model = defineModel<string>({ default: '' })
defineProps<{ placeholder?: string }>()
</script>

<template>
  <div class="relative">
    <Search :size="13" class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
    <input v-model="model" type="search" class="a-input pl-8 pr-8 font-mono text-[12px]" :placeholder="placeholder || 'Search…'">
    <button v-if="model" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink" aria-label="Clear search" @click="model = ''">
      <X :size="12" />
    </button>
  </div>
</template>
