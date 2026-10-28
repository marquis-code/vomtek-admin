<script setup lang="ts">
import { Check, X, TriangleAlert, Info } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[90] flex w-[320px] flex-col gap-2">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div v-for="toast in toasts" :key="toast.id" class="flex items-start gap-2.5 rounded-xl border border-ink/15 bg-surface p-3 shadow-[0_14px_40px_-18px_rgba(10,12,11,.4)]">
          <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full" :class="toast.tone === 'error' ? 'bg-danger text-white' : toast.tone === 'info' ? 'bg-ink text-bone' : 'bg-brand text-white'">
            <TriangleAlert v-if="toast.tone === 'error'" :size="10" />
            <Info v-else-if="toast.tone === 'info'" :size="10" />
            <Check v-else :size="10" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[11.5px] font-medium">{{ toast.message }}</p>
            <p v-if="toast.detail" class="mt-0.5 text-[11.5px] text-ink/45">{{ toast.detail }}</p>
          </div>
          <button type="button" class="text-ink/30 hover:text-ink" aria-label="Dismiss" @click="dismiss(toast.id)"><X :size="12" /></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
