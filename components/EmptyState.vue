<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { Component } from 'vue'
withDefaults(defineProps<{ title: string, text?: string, icon?: Component }>(), { icon: Inbox })
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <span class="flex size-11 items-center justify-center border border-ink/15 bg-surface text-ink/35">
      <component :is="icon" :size="18" />
    </span>
    <p class="mt-4 text-[14px] font-medium">{{ title }}</p>
    <p v-if="text" class="mt-1 max-w-sm text-[11.5px] leading-relaxed text-ink/45">{{ text }}</p>
    <div v-if="$slots.default" class="mt-4"><slot /></div>
  </div>
</template>
