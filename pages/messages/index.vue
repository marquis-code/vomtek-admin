<script setup lang="ts">
import { Download, Mail, Phone, ArrowUpRight, MessageSquare, Check, CircleAlert } from 'lucide-vue-next'
import type { Message } from '~/types'

useHead({ title: 'Messages — Vomtek Studio' })

const api = useApi()
const format = useFormat()
const toast = useToast()

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const loading = ref(true)
const messages = ref<Message[]>([])
const error = ref('')
const activeStatus = ref('all')
const search = ref('')
const selected = ref<Message | null>(null)
const note = ref('')
const saving = ref(false)
const noteSaving = ref(false)

const statuses = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'replied', label: 'Replied' },
  { key: 'archived', label: 'Archived' },
]

const counts = computed(() => {
  const map: Record<string, number> = { all: messages.value.length }
  for (const message of messages.value) map[message.status] = (map[message.status] || 0) + 1
  return map
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return messages.value.filter((message) => {
    const statusOk = activeStatus.value === 'all' || message.status === activeStatus.value
    const termOk = !term || [message.name, message.email, message.company, message.subject].some(value => (value || '').toLowerCase().includes(term))
    return statusOk && termOk
  })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.messages.list({ limit: 200 })
    messages.value = response.items
  }
  catch (err: unknown) {
    error.value = (err as Error).message || 'Could not load messages.'
  }
  finally {
    loading.value = false
  }
}

async function openMessage(message: Message) {
  selected.value = message
  note.value = ''
  if (message.status === 'new') await patch(message, { status: 'read' }, false)
}

async function patch(message: Message, body: Record<string, unknown>, notify = true) {
  saving.value = true
  try {
    const updated = await api.messages.update(message._id, body)
    const index = messages.value.findIndex(item => item._id === message._id)
    if (index >= 0) messages.value[index] = updated
    if (selected.value?._id === message._id) selected.value = updated
    if (notify) toast.success('Message updated')
  }
  catch (err: unknown) {
    toast.error('Could not update', (err as Error).message)
  }
  finally {
    saving.value = false
  }
}

async function addNote() {
  if (!selected.value || !note.value.trim()) return
  noteSaving.value = true
  try {
    const updated = await api.messages.addNote(selected.value._id, note.value.trim())
    selected.value = updated
    const index = messages.value.findIndex(item => item._id === updated._id)
    if (index >= 0) messages.value[index] = updated
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

async function markReplied() {
  if (!selected.value) return
  await patch(selected.value, { status: 'replied' })
}

function exportCsv() {
  void api.messages.exportCsv().catch((err: unknown) => toast.error('Export failed', (err as Error).message))
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Revenue" title="Inbox" description="Enquiries, foundation pledges and supplier notes. Triage here, reply from your own mailbox.">
      <button type="button" class="a-btn a-btn-ghost" @click="exportCsv"><Download :size="12" /> Export</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-danger">
      <CircleAlert :size="13" /> {{ error }}
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2 border-b border-ink/12 pb-3">
      <button v-for="status in statuses" :key="status.key" type="button" class="a-tab" :class="activeStatus === status.key ? 'a-tab-active' : ''" @click="activeStatus = status.key">
        {{ status.label }} <span class="ml-1 font-mono text-[9.5px] text-ink/30">{{ counts[status.key] || 0 }}</span>
      </button>
      <SearchField v-model="search" placeholder="Search name, email, subject…" class="ml-auto w-64" />
    </div>

    <div class="a-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="a-table min-w-[800px]">
          <thead><tr><th>From</th><th>Subject</th><th>Source</th><th>Status</th><th>Priority</th><th>Received</th><th /></tr></thead>
          <tbody>
            <tr v-for="message in filtered" :key="message._id" class="cursor-pointer" :class="message.status === 'new' ? 'bg-signal/[0.025]' : ''" @click="openMessage(message)">
              <td>
                <p class="text-[12px] font-medium">{{ message.name }}</p>
                <p class="text-[11px] text-ink/40">{{ message.company || message.email }}</p>
              </td>
              <td>
                <p class="text-[12px]">{{ message.subject }}</p>
                <p class="max-w-xs truncate text-[11px] text-ink/40">{{ message.message }}</p>
              </td>
              <td class="font-mono text-[10px] uppercase tracking-[0.06em] text-ink/45">{{ message.source }}</td>
              <td><StatusBadge :status="message.status" size="sm" /></td>
              <td><PriorityBadge :priority="message.priority" /></td>
              <td class="whitespace-nowrap font-mono text-[10.5px] text-ink/40">{{ format.relative(message.createdAt) }}</td>
              <td><ArrowUpRight :size="13" class="text-ink/25" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 5" :key="i" class="h-9 a-skeleton" /></div>
      <EmptyState v-if="!loading && !filtered.length" title="Inbox zero" text="No messages match the current filter." />
    </div>

    <SlideOver :open="!!selected" :title="selected?.subject || 'Message'" :subtitle="selected ? `${selected.name} · ${format.dateTime(selected.createdAt)}` : ''" @close="selected = null">
      <div v-if="selected" class="space-y-5 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="selected.status" />
          <PriorityBadge :priority="selected.priority" />
          <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">{{ selected.source }}</span>
          <div class="ml-auto flex gap-1">
            <SearchSelect :model-value="selected.priority" :options="priorityOptions" compact class="w-28" @update:model-value="v => selected && patch(selected, { priority: String(v) })" />
          </div>
        </div>

        <div class="border border-ink/10 bg-paper/50 p-4">
          <div class="flex flex-wrap gap-4 border-b border-ink/10 pb-3 text-[11.5px]">
            <a :href="`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`" class="flex items-center gap-1.5 text-signal-deep hover:underline"><Mail :size="12" /> {{ selected.email }}</a>
            <a v-if="selected.phone" :href="`tel:${selected.phone}`" class="flex items-center gap-1.5 text-ink/55 hover:text-ink"><Phone :size="12" /> {{ selected.phone }}</a>
            <span v-if="selected.company" class="text-ink/45">{{ selected.company }}</span>
          </div>
          <p class="mt-3 whitespace-pre-line text-[12.5px] leading-relaxed text-ink/65">{{ selected.message }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <a :href="`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`" class="a-btn a-btn-primary"><Mail :size="12" /> Reply by email</a>
          <button type="button" class="a-btn a-btn-ghost" :disabled="saving" @click="markReplied"><Check :size="12" /> Mark replied</button>
          <button type="button" class="a-btn a-btn-ghost" :disabled="saving" @click="patch(selected, { status: 'archived' })">Archive</button>
        </div>

        <div>
          <p class="a-label">Internal notes</p>
          <ul class="space-y-2">
            <li v-for="(item, i) in [...selected.internalNotes].reverse()" :key="i" class="border-l-2 border-ink/15 pl-3">
              <p class="text-[11.5px] text-ink/65">{{ item.text }}</p>
              <p class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">{{ item.author }} · {{ format.relative(item.at) }}</p>
            </li>
            <li v-if="!selected.internalNotes.length" class="text-[12px] text-ink/35">No notes yet.</li>
          </ul>
          <textarea v-model="note" rows="3" class="a-input mt-2 text-[12px]" placeholder="Add context for the team…" />
          <button type="button" class="a-btn a-btn-ghost mt-2" :disabled="noteSaving || !note.trim()" @click="addNote">
            <MessageSquare :size="12" /> {{ noteSaving ? 'Adding…' : 'Add note' }}
          </button>
        </div>
      </div>
    </SlideOver>
  </div>
</template>
