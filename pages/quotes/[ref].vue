<script setup lang="ts">
import { ArrowLeft, Mail, Phone, Copy, Check, Save, Plus, MessageSquare, History, ExternalLink, Clock, UserRound, CircleAlert } from 'lucide-vue-next'
import type { AdminUser, Quote } from '~/types'

useHead({ title: 'Quote detail — Vomtek Studio' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const format = useFormat()
const config = useRuntimeConfig()

const quote = ref<Quote | null>(null)
const users = ref<AdminUser[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const copied = ref(false)
const tab = ref<'activity' | 'notes'>('activity')
const note = ref('')
const noteSaving = ref(false)
const statusDraft = ref('')
const statusNote = ref('')
const statusSaving = ref(false)

const form = reactive({
  priority: 'normal',
  value: 0,
  assignedToId: '',
  followUpAt: '',
  lostReason: '',
  tags: [] as string[],
})

const statuses = ['received', 'engineering_review', 'quoted', 'approved', 'in_build', 'shipped', 'closed', 'cancelled']
const statusLabels: Record<string, string> = {
  received: 'Received',
  engineering_review: 'Engineering review',
  quoted: 'Quoted',
  approved: 'Approved',
  in_build: 'In build',
  shipped: 'Shipped',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
const statusOptions = computed(() => statuses.map(status => ({ value: status, label: statusLabels[status] || status })))
const userOptions = computed(() => [
  { value: '', label: 'Unassigned' },
  ...users.value.map(user => ({ value: user.id, label: `${user.name} · ${user.role}` })),
])

const assignedUser = computed(() => users.value.find(user => user.id === form.assignedToId))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const ref = String(route.params.ref)
    const [quoteData, userData] = await Promise.all([
      api.quotes.detail(ref),
      api.users.list().catch(() => ({ items: [] as AdminUser[] })),
    ])
    quote.value = quoteData
    users.value = userData.items
    form.priority = quoteData.priority || 'normal'
    form.value = quoteData.value || 0
    form.assignedToId = quoteData.assignedTo?.id || ''
    form.followUpAt = quoteData.followUpAt ? quoteData.followUpAt.slice(0, 10) : ''
    form.lostReason = quoteData.lostReason || ''
    form.tags = [...(quoteData.tags || [])]
    statusDraft.value = quoteData.status
  }
  catch (err: unknown) {
    error.value = (err as Error).message || 'Could not load this quote.'
  }
  finally {
    loading.value = false
  }
}

async function save() {
  if (!quote.value) return
  saving.value = true
  try {
    quote.value = await api.quotes.update(quote.value.ref, {
      priority: form.priority,
      value: Number(form.value) || 0,
      assignedTo: assignedUser.value
        ? { id: assignedUser.value.id, name: assignedUser.value.name, email: assignedUser.value.email }
        : undefined,
      followUpAt: form.followUpAt ? new Date(`${form.followUpAt}T12:00:00`).toISOString() : undefined,
      lostReason: form.lostReason,
      tags: form.tags,
    })
    toast.success('Quote updated', `${quote.value.ref} saved.`)
  }
  catch (err: unknown) {
    toast.error('Could not save', (err as Error).message)
  }
  finally {
    saving.value = false
  }
}

async function updateStatus() {
  if (!quote.value || statusDraft.value === quote.value.status) return
  statusSaving.value = true
  try {
    await api.quotes.setStatus(quote.value.ref, statusDraft.value, statusNote.value || `Moved to ${statusLabels[statusDraft.value]} from Studio.`)
    quote.value = await api.quotes.detail(quote.value.ref)
    statusNote.value = ''
    toast.success('Stage updated', `Now ${statusLabels[statusDraft.value]}.`)
  }
  catch (err: unknown) {
    toast.error('Could not update stage', (err as Error).message)
  }
  finally {
    statusSaving.value = false
  }
}

async function addNote() {
  if (!quote.value || !note.value.trim()) return
  noteSaving.value = true
  try {
    quote.value = await api.quotes.addNote(quote.value.ref, note.value.trim())
    note.value = ''
    toast.success('Note added')
  }
  catch (err: unknown) {
    toast.error('Could not add note', (err as Error).message)
  }
  finally {
    noteSaving.value = false
  }
}

async function copyRef() {
  if (!quote.value) return
  await navigator.clipboard.writeText(quote.value.ref)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1800)
}

function mailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}

onMounted(load)
</script>

<template>
  <div>
    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-danger">
      <CircleAlert :size="13" /> {{ error }}
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="h-20 a-skeleton" />
      <div class="grid gap-4 lg:grid-cols-3"><div class="h-96 a-skeleton lg:col-span-2" /><div class="h-96 a-skeleton" /></div>
    </div>

    <template v-else-if="quote">
      <div class="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-ink/12 pb-5">
        <div>
          <NuxtLink to="/quotes" class="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/40 hover:text-ink">
            <ArrowLeft :size="10" /> Pipeline
          </NuxtLink>
          <div class="mt-2 flex flex-wrap items-center gap-3">
            <h1 class="text-[28px] font-medium tracking-[-0.045em]">{{ quote.company || quote.name }}</h1>
            <StatusBadge :status="quote.status" />
            <PriorityBadge :priority="quote.priority" />
          </div>
          <div class="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/40">
            <button type="button" class="flex items-center gap-1 text-signal-deep hover:underline" @click="copyRef">
              {{ quote.ref }} <component :is="copied ? Check : Copy" :size="9" />
            </button>
            <span class="text-ink/20">/</span>
            <span>{{ quote.projectTypeLabel }}</span>
            <span class="text-ink/20">/</span>
            <span>Received {{ format.dateTime(quote.createdAt) }}</span>
            <span class="text-ink/20">/</span>
            <a :href="`${config.public.siteUrl}/track?ref=${quote.ref}`" target="_blank" rel="noopener" class="flex items-center gap-1 hover:text-ink">Customer view <ExternalLink :size="9" /></a>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="a-btn a-btn-ghost" :disabled="saving" @click="save"><Save :size="12" /> {{ saving ? 'Saving…' : 'Save changes' }}</button>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-12">
        <div class="space-y-4 xl:col-span-8">
          <FormSection title="Request" index="01" description="What the customer asked for.">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2.5">
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Contact</span><span class="text-right text-[12px]">{{ quote.name }}</span></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Email</span><a :href="mailto(quote.email, `Your Vomtek request ${quote.ref}`)" class="text-right text-[12px] text-signal-deep hover:underline">{{ quote.email }}</a></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Phone</span><a v-if="quote.phone" :href="`tel:${quote.phone}`" class="text-right text-[12px] text-signal-deep hover:underline">{{ quote.phone }}</a><span v-else class="text-[12px] text-ink/30">—</span></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Industry</span><span class="text-right text-[12px]">{{ quote.industry || '—' }}</span></div>
              </div>
              <div class="space-y-2.5">
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Quantity</span><span class="text-right text-[12px]">{{ quote.quantity }}</span></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Voltage</span><span class="text-right text-[12px]">{{ quote.voltage || '—' }}</span></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Environment</span><span class="text-right text-[12px]">{{ quote.environment || '—' }}</span></div>
                <div class="flex justify-between gap-4 border-b border-ink/8 py-1.5"><span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Timeline</span><span class="text-right text-[12px]">{{ quote.timeline || '—' }}</span></div>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="border border-ink/10 bg-paper/50 p-3">
                <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Panel types</p>
                <p class="mt-1 text-[11.5px] text-ink/60">{{ quote.panelTypes.length ? quote.panelTypes.join(' · ') : '—' }}</p>
              </div>
              <div class="border border-ink/10 bg-paper/50 p-3">
                <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Certifications / drawings</p>
                <p class="mt-1 text-[11.5px] text-ink/60">{{ quote.certifications.join(' · ') || '—' }} · {{ quote.existingDrawings || 'drawings n/a' }}</p>
              </div>
            </div>

            <div v-if="quote.notes" class="mt-4 border-l-2 border-signal bg-paper/50 p-3">
              <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Customer brief</p>
              <p class="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-ink/65">{{ quote.notes }}</p>
            </div>
          </FormSection>

          <section class="a-card">
            <div class="flex items-center gap-4 border-b border-ink/12 px-4 pt-3">
              <button type="button" class="a-tab" :class="tab === 'activity' ? 'a-tab-active' : ''" @click="tab = 'activity'"><History :size="11" class="mr-1 inline" /> Activity</button>
              <button type="button" class="a-tab" :class="tab === 'notes' ? 'a-tab-active' : ''" @click="tab = 'notes'"><MessageSquare :size="11" class="mr-1 inline" /> Internal notes <span class="ml-1 text-ink/30">{{ quote.internalNotes.length }}</span></button>
            </div>

            <div v-if="tab === 'activity'" class="p-4">
              <ol class="relative border-l border-ink/15 pl-5">
                <li v-for="(event, i) in [...quote.timelineEvents].reverse()" :key="i" class="relative pb-5 last:pb-0">
                  <span class="absolute -left-[25px] top-1 flex size-2 items-center justify-center rounded-full" :class="i === 0 ? 'bg-signal' : 'bg-ink/25'" />
                  <p class="text-[12.5px] font-medium">{{ statusLabels[event.status] || event.status }}</p>
                  <p class="mt-0.5 text-[11.5px] leading-relaxed text-ink/50">{{ event.note }}</p>
                  <p class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">{{ format.dateTime(event.at) }}</p>
                </li>
              </ol>
            </div>

            <div v-else class="p-4">
              <ul class="space-y-3">
                <li v-for="(item, i) in [...quote.internalNotes].reverse()" :key="i" class="border-l-2 border-ink/15 pl-3">
                  <p class="text-[12px] leading-relaxed text-ink/65">{{ item.text }}</p>
                  <p class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">{{ item.author }} · {{ format.dateTime(item.at) }}</p>
                </li>
                <li v-if="!quote.internalNotes.length" class="py-4 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink/30">No internal notes yet.</li>
              </ul>
              <div class="mt-4 border-t border-ink/10 pt-3">
                <textarea v-model="note" rows="3" class="a-input text-[12px]" placeholder="Add a note for the team…" />
                <div class="mt-2 flex justify-end">
                  <button type="button" class="a-btn a-btn-primary" :disabled="noteSaving || !note.trim()" @click="addNote"><Plus :size="12" /> {{ noteSaving ? 'Adding…' : 'Add note' }}</button>
                </div>
              </div>
            </div>
          </section>

          <FormSection title="Source & attribution" index="03" description="Where this request came from, kept for the funnel.">
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><p class="a-label">Source</p><p class="text-[12px]">{{ quote.source }}</p></div>
              <div><p class="a-label">Landing page</p><p class="truncate text-[12px]">{{ quote.landingPage || '—' }}</p></div>
              <div><p class="a-label">Referrer</p><p class="truncate text-[12px]">{{ quote.referrer || '—' }}</p></div>
              <div><p class="a-label">Catalog system</p><p class="text-[12px]">{{ quote.catalogSlug || '—' }}</p></div>
            </div>
          </FormSection>
        </div>

        <div class="space-y-4 xl:col-span-4">
          <FormSection title="Lead management" index="02" description="Prioritise, price and assign the relationship.">
            <div class="space-y-3">
              <div>
                <label class="a-label">Priority</label>
                <SearchSelect v-model="form.priority" :options="priorityOptions" />
              </div>
              <div>
                <label class="a-label">Estimated value (USD)</label>
                <input v-model.number="form.value" type="number" min="0" step="100" class="a-input font-mono">
              </div>
              <div>
                <label class="a-label">Assigned to</label>
                <SearchSelect v-model="form.assignedToId" :options="userOptions" placeholder="Unassigned" />
              </div>
              <div>
                <label class="a-label">Follow up by</label>
                <input v-model="form.followUpAt" type="date" class="a-input font-mono">
              </div>
              <div>
                <label class="a-label">Tags</label>
                <TagInput v-model="form.tags" />
              </div>
              <div v-if="form.lostReason || quote.status === 'cancelled'">
                <label class="a-label">Lost / cancelled reason</label>
                <input v-model="form.lostReason" type="text" class="a-input" placeholder="Price, timing, scope…">
              </div>
              <button type="button" class="a-btn a-btn-primary w-full" :disabled="saving" @click="save">
                <Save :size="12" /> {{ saving ? 'Saving…' : 'Save lead details' }}
              </button>
            </div>
          </FormSection>

          <FormSection title="Move stage" index="04" description="Updates the customer tracker and writes a timeline entry.">
            <div class="space-y-2">
              <SearchSelect v-model="statusDraft" :options="statusOptions" placeholder="Move to stage" />
              <textarea v-model="statusNote" rows="2" class="a-input text-[12px]" placeholder="Optional note for the customer timeline…" />
              <button type="button" class="a-btn a-btn-signal w-full" :disabled="statusSaving || statusDraft === quote.status" @click="updateStatus">
                {{ statusSaving ? 'Updating…' : 'Move stage' }}
              </button>
            </div>
          </FormSection>

          <div class="a-card p-4">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Estimate</p>
            <div class="mt-2 space-y-2">
              <div class="flex justify-between border-b border-ink/8 py-1.5"><span class="text-[12px] text-ink/45">Indicative lead time</span><span class="font-mono text-[11px]">{{ quote.estimate?.leadTime || '—' }}</span></div>
              <div class="flex justify-between border-b border-ink/8 py-1.5"><span class="text-[12px] text-ink/45">Review by</span><span class="font-mono text-[11px]">{{ quote.estimate?.reviewBy || '—' }}</span></div>
              <div class="flex justify-between py-1.5"><span class="text-[12px] text-ink/45">SLA</span><span class="font-mono text-[11px]">{{ quote.estimate?.slaHours || 24 }}h</span></div>
            </div>
          </div>

          <div class="a-card p-4">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Quick contact</p>
            <div class="mt-3 grid gap-1.5">
              <a :href="mailto(quote.email, `Your Vomtek request ${quote.ref}`)" class="flex items-center gap-2 border border-ink/10 px-3 py-2 text-[11.5px] text-ink/60 hover:border-ink/30 hover:text-ink"><Mail :size="12" /> Email customer</a>
              <a v-if="quote.phone" :href="`tel:${quote.phone}`" class="flex items-center gap-2 border border-ink/10 px-3 py-2 text-[11.5px] text-ink/60 hover:border-ink/30 hover:text-ink"><Phone :size="12" /> Call customer</a>
              <button type="button" class="flex items-center gap-2 border border-ink/10 px-3 py-2 text-left text-[11.5px] text-ink/60 hover:border-ink/30 hover:text-ink" @click="copyRef"><Copy :size="12" /> Copy reference</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
