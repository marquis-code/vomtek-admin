<script setup lang="ts">
import { Download, ArrowUpRight, Star, FileText, Mail, Phone, Link2, CircleAlert, MessageSquare } from 'lucide-vue-next'
import type { Application } from '~/types'

useHead({ title: 'Applications — Vomtek Studio' })

const api = useApi()
const format = useFormat()
const toast = useToast()

const loading = ref(true)
const applications = ref<Application[]>([])
const error = ref('')
const activeStatus = ref('all')
const search = ref('')
const selected = ref<Application | null>(null)
const note = ref('')
const noteSaving = ref(false)
const saving = ref(false)

const statuses = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
]
const statusOptions = statuses.slice(1).map(status => ({ value: status.key, label: status.label }))

const counts = computed(() => {
  const map: Record<string, number> = { all: applications.value.length }
  for (const app of applications.value) map[app.status] = (map[app.status] || 0) + 1
  return map
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return applications.value.filter((app) => {
    const statusOk = activeStatus.value === 'all' || app.status === activeStatus.value
    const termOk = !term || [app.firstName, app.lastName, app.email, app.jobTitle].some(value => (value || '').toLowerCase().includes(term))
    return statusOk && termOk
  })
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.applications.list({ limit: 200 })
    applications.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message || 'Could not load applications.' }
  finally { loading.value = false }
}

async function openApplication(app: Application) {
  selected.value = app
  note.value = ''
  if (app.status === 'new') await patch(app, { status: 'reviewing' })
}

async function patch(app: Application, body: Record<string, unknown>, notify = false) {
  saving.value = true
  try {
    const updated = await api.applications.update(app._id, body)
    const index = applications.value.findIndex(item => item._id === app._id)
    if (index >= 0) applications.value[index] = updated
    if (selected.value?._id === app._id) selected.value = updated
    if (notify) toast.success('Application updated')
  }
  catch (err: unknown) { toast.error('Could not update', (err as Error).message) }
  finally { saving.value = false }
}

async function addNote() {
  if (!selected.value || !note.value.trim()) return
  noteSaving.value = true
  try {
    const updated = await api.applications.addNote(selected.value._id, note.value.trim())
    selected.value = updated
    const index = applications.value.findIndex(item => item._id === updated._id)
    if (index >= 0) applications.value[index] = updated
    note.value = ''
    toast.success('Note added')
  }
  catch (err: unknown) { toast.error('Could not add note', (err as Error).message) }
  finally { noteSaving.value = false }
}

function exportCsv() {
  void api.applications.exportCsv().catch((err: unknown) => toast.error('Export failed', (err as Error).message))
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="People" title="Applications" description="Every applicant, from first review to offer. Resume links are stored as URLs — no files sit on the server.">
      <button type="button" class="a-btn a-btn-ghost" @click="exportCsv"><Download :size="12" /> Export</button>
      <NuxtLink to="/jobs" class="a-btn a-btn-primary">Manage roles</NuxtLink>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-danger">
      <CircleAlert :size="13" /> {{ error }}
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2 border-b border-ink/12 pb-3">
      <button v-for="status in statuses" :key="status.key" type="button" class="a-tab" :class="activeStatus === status.key ? 'a-tab-active' : ''" @click="activeStatus = status.key">
        {{ status.label }} <span class="ml-1 font-mono text-[9.5px] text-ink/30">{{ counts[status.key] || 0 }}</span>
      </button>
      <SearchField v-model="search" placeholder="Search applicant or role…" class="ml-auto w-64" />
    </div>

    <div class="a-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="a-table min-w-[820px]">
          <thead><tr><th>Applicant</th><th>Role</th><th>Rating</th><th>Status</th><th>Applied</th><th /></tr></thead>
          <tbody>
            <tr v-for="app in filtered" :key="app._id" class="cursor-pointer" :class="app.status === 'new' ? 'bg-signal/[0.025]' : ''" @click="openApplication(app)">
              <td>
                <p class="text-[12px] font-medium">{{ app.firstName }} {{ app.lastName }}</p>
                <p class="text-[11px] text-ink/40">{{ app.email }}</p>
              </td>
              <td class="text-[11.5px] text-ink/60">{{ app.jobTitle }}</td>
              <td>
                <span class="flex gap-0.5 text-signal-deep">
                  <Star v-for="i in 5" :key="i" :size="10" :fill="i <= app.rating ? 'currentColor' : 'none'" :class="i <= app.rating ? '' : 'text-ink/15'" />
                </span>
              </td>
              <td><StatusBadge :status="app.status" size="sm" /></td>
              <td class="whitespace-nowrap font-mono text-[10.5px] text-ink/40">{{ format.date(app.createdAt) }}</td>
              <td><ArrowUpRight :size="13" class="text-ink/25" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 5" :key="i" class="h-9 a-skeleton" /></div>
      <EmptyState v-if="!loading && !filtered.length" title="No applications" text="New applications will appear here." />
    </div>

    <SlideOver :open="!!selected" :title="selected ? `${selected.firstName} ${selected.lastName}` : ''" :subtitle="selected?.jobTitle" @close="selected = null">
      <div v-if="selected" class="space-y-5 p-5">
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="selected.status" />
          <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">{{ format.dateTime(selected.createdAt) }}</span>
          <SearchSelect :model-value="selected.status" :options="statusOptions" compact class="ml-auto w-32" @update:model-value="v => selected && patch(selected, { status: String(v) }, true)" />
        </div>

        <div class="grid gap-2 text-[11.5px]">
          <a :href="`mailto:${selected.email}`" class="flex items-center gap-2 text-signal-deep hover:underline"><Mail :size="12" /> {{ selected.email }}</a>
          <a v-if="selected.phone" :href="`tel:${selected.phone}`" class="flex items-center gap-2 text-ink/55"><Phone :size="12" /> {{ selected.phone }}</a>
          <a :href="selected.resumeUrl" target="_blank" rel="noopener" class="flex items-center gap-2 text-ink/55 hover:text-ink"><FileText :size="12" /> Resume link</a>
          <a v-if="selected.linkedin" :href="selected.linkedin" target="_blank" rel="noopener" class="flex items-center gap-2 text-ink/55 hover:text-ink"><Link2 :size="12" /> LinkedIn</a>
        </div>

        <div>
          <p class="a-label">Rating</p>
          <div class="flex gap-1">
            <button v-for="i in 5" :key="i" type="button" class="text-signal-deep" @click="patch(selected, { rating: i }, true)">
              <Star :size="18" :fill="i <= selected.rating ? 'currentColor' : 'none'" :class="i <= selected.rating ? '' : 'text-ink/15'" />
            </button>
          </div>
        </div>

        <div>
          <p class="a-label">Cover letter</p>
          <p class="whitespace-pre-line border-l-2 border-ink/15 pl-3 text-[12px] leading-relaxed text-ink/60">{{ selected.coverLetter }}</p>
        </div>

        <div>
          <p class="a-label">Tags</p>
          <TagInput :model-value="selected.tags" @update:model-value="patch(selected, { tags: $event })" />
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
          <textarea v-model="note" rows="3" class="a-input mt-2 text-[12px]" placeholder="Add a note…" />
          <button type="button" class="a-btn a-btn-ghost mt-2" :disabled="noteSaving || !note.trim()" @click="addNote"><MessageSquare :size="12" /> Add note</button>
        </div>
      </div>
    </SlideOver>
  </div>
</template>
