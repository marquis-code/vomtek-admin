<script setup lang="ts">
const props = defineProps<{ status: string, size?: 'sm' | 'md' }>()

const map: Record<string, { label: string, classes: string }> = {
  received: { label: 'Received', classes: 'bg-ink/8 text-ink/70 border-ink/20' },
  engineering_review: { label: 'Engineering', classes: 'bg-amber-500/10 text-amber-800 border-amber-700/25' },
  quoted: { label: 'Quoted', classes: 'bg-sky-500/10 text-sky-800 border-sky-700/25' },
  approved: { label: 'Approved', classes: 'bg-emerald-500/10 text-emerald-800 border-emerald-700/25' },
  in_build: { label: 'In build', classes: 'bg-signal/10 text-signal-deep border-signal/30' },
  shipped: { label: 'Shipped', classes: 'bg-ink text-bone border-ink' },
  closed: { label: 'Closed', classes: 'bg-ink/5 text-ink/45 border-ink/15' },
  cancelled: { label: 'Cancelled', classes: 'bg-ink/5 text-ink/35 border-ink/15 line-through' },
  new: { label: 'New', classes: 'bg-signal/10 text-signal-deep border-signal/30' },
  read: { label: 'Read', classes: 'bg-ink/8 text-ink/60 border-ink/15' },
  replied: { label: 'Replied', classes: 'bg-emerald-500/10 text-emerald-800 border-emerald-700/25' },
  archived: { label: 'Archived', classes: 'bg-ink/5 text-ink/35 border-ink/15' },
  reviewing: { label: 'Reviewing', classes: 'bg-amber-500/10 text-amber-800 border-amber-700/25' },
  interview: { label: 'Interview', classes: 'bg-sky-500/10 text-sky-800 border-sky-700/25' },
  offer: { label: 'Offer', classes: 'bg-signal/10 text-signal-deep border-signal/30' },
  hired: { label: 'Hired', classes: 'bg-emerald-500/10 text-emerald-800 border-emerald-700/25' },
  rejected: { label: 'Rejected', classes: 'bg-ink/5 text-ink/35 border-ink/15' },
}

const state = computed(() => map[props.status] ?? { label: props.status, classes: 'bg-ink/5 text-ink/50 border-ink/15' })
</script>

<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-mono uppercase tracking-[0.08em]" :class="[state.classes, size === 'sm' ? 'text-[9.5px]' : 'text-[9.5px]']">
    <span class="size-1 bg-current" aria-hidden="true" />
    {{ state.label }}
  </span>
</template>
