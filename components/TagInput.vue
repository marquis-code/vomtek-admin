<script setup lang="ts">
import { X } from 'lucide-vue-next'
const model = defineModel<string[]>({ default: () => [] })
const draft = ref('')

function add() {
  const value = draft.value.trim()
  if (!value) return
  if (!model.value.includes(value)) model.value = [...model.value, value]
  draft.value = ''
}
function remove(tag: string) {
  model.value = model.value.filter(item => item !== tag)
}
</script>

<template>
  <div class="flex min-h-9 flex-wrap items-center gap-1.5 border border-ink/15 bg-surface p-1.5">
    <span v-for="tag in model" :key="tag" class="inline-flex items-center gap-1 bg-ink/8 px-1.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/60">
      {{ tag }}
      <button type="button" class="text-ink/35 hover:text-signal-deep" @click="remove(tag)"><X :size="9" /></button>
    </span>
    <input
      v-model="draft"
      type="text"
      class="h-6 min-w-24 flex-1 border-0 bg-transparent px-1 text-[12px] outline-none"
      placeholder="Add tag…"
      @keydown.enter.prevent="add"
      @blur="add"
    >
  </div>
</template>
