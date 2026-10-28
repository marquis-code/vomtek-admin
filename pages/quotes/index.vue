<script setup lang="ts">
import { LayoutGrid, List, Plus, Download, CircleAlert, ArrowUpRight } from 'lucide-vue-next'
import type { Quote, QuoteStatus } from '~/types'

useHead({ title: 'Quotes — Vomtek Studio' })

const api = useApi()
const route = useRoute()
const format = useFormat()
const toast = useToast()

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'value', label: 'Highest value' },
  { value: 'priority', label: 'Priority' },
]

const loading = ref(true)
const error = ref('')
const quotes = ref<Quote[]>([])
const view = ref<'board' | 'table'>('board')
const search = ref('')
const priority = ref('all')
const sort = ref('newest')
const activeStatus = ref<string>(typeof route.query.status === 'string' ? route.query.status : 'all')
const page = ref(1)
const pageSize = 20
const dragging = ref<string | null>(null)
const busy = ref<string | null>(null)

const columns = [
  { key: 'received', label: 'Received' },
  { key: 'engineering_review', label: 'Engineering' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'approved', label: 'Approved' },
  { key: 'in_build', label: 'In build' },
  { key: 'shipped', label: 'Shipped' },
]

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  let list = quotes.value
  if (activeStatus.value !== 'all') list = list.filter(q => q.status === activeStatus.value)
  if (priority.value !== 'all') list = list.filter(q => q.priority === priority.value)
  if (term) list = list.filter(q => [q.ref, q.company, q.name, q.email, ...(q.tags || [])].some(value => (value || '').toLowerCase().includes(term)))
  return [...list].sort((a, b) => {
    if (sort.value === 'value') return (b.value || 0) - (a.value || 0)
    if (sort.value === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt)
    if (sort.value === 'priority') {
      const order: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
    }
    return +new Date(b.createdAt) - +new Date(a.createdAt)
  })
})

const paginated = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

const counts = computed(() => {
  const map: Record<string, number> = { all: quotes.value.length }
  for (const quote of quotes.value) map[quote.status] = (map[quote.status] || 0) + 1
  return map
})

const tabs = computed(() => [
  { key: 'all', label: 'All' },
  ...columns.map(column => ({ key: column.key, label: column.label })),
  { key: 'closed', label: 'Closed' },
  { key: 'cancelled', label: 'Cancelled' },
])

const totalValue = computed(() => quotes.value.reduce((sum, quote) => sum + (quote.value || 0), 0))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await api.quotes.list({ limit: 200, sort: 'newest' })
    quotes.value = response.items
  }
  catch (err: unknown) {
    error.value = (err as Error).message || 'Could not load quotes.'
  }
  finally {
    loading.value = false
  }
}

async function moveTo(status: string) {
  const ref = dragging.value
  dragging.value = null
  if (!ref) return
  const quote = quotes.value.find(item => item.ref === ref)
  if (!quote || quote.status === status) return

  const previous = quote.status
  quote.status = status as QuoteStatus
  busy.value = ref
  try {
    await api.quotes.setStatus(ref, status, `Moved to ${status.replace(/_/g, ' ')} from the pipeline board.`)
    toast.success(`${ref} moved`, `Now in ${status.replace(/_/g, ' ')}.`)
  }
  catch (err: unknown) {
    quote.status = previous
    toast.error('Could not move quote', (err as Error).message)
  }
  finally {
    busy.value = null
  }
}

function open(ref: string) {
  void navigateTo(`/quotes/${ref}`)
}

watch([search, priority, sort], () => { page.value = 1 })

function exportCsv() {
  void api.quotes.exportCsv().catch((err: unknown) => toast.error('Export failed', (err as Error).message))
}

function columnQuotes(key: string) {
  return quotes.value.filter(q => q.status === key)
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Revenue"
      title="Quote pipeline"
      description="Every request from first acknowledgement to shipped. Drag a card to move the stage — the customer tracker updates from the same record."
    >
      <button type="button" class="a-btn a-btn-ghost" @click="exportCsv"><Download :size="12" /> Export</button>
      <NuxtLink to="/settings" class="a-btn a-btn-primary"><Plus :size="12" /> Quote rules</NuxtLink>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-danger">
      <CircleAlert :size="13" /> {{ error }}
    </div>

    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <div class="a-card flex items-center justify-between px-4 py-3">
        <div>
          <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Projects on file</p>
          <p class="mt-1 text-[22px] font-medium leading-none">{{ quotes.length }}</p>
        </div>
        <ArrowUpRight :size="17" class="text-ink/20" />
      </div>
      <div class="a-card flex items-center justify-between px-4 py-3">
        <div>
          <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Total priced value</p>
          <p class="mt-1 text-[22px] font-medium leading-none">{{ format.currency(totalValue) }}</p>
        </div>
        <span class="font-mono text-[9.5px] uppercase text-ink/30">USD</span>
      </div>
      <div class="a-card flex items-center justify-between px-4 py-3">
        <div>
          <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">Awaiting action</p>
          <p class="mt-1 text-[22px] font-medium leading-none">{{ (counts.received || 0) + (counts.engineering_review || 0) }}</p>
        </div>
        <span class="size-2 animate-pulse rounded-full bg-signal" />
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2 border-b border-ink/12 pb-3">
      <button v-for="tab in tabs" :key="tab.key" type="button" class="a-tab" :class="activeStatus === tab.key ? 'a-tab-active' : ''" @click="activeStatus = tab.key; page = 1">
        {{ tab.label }}
        <span class="ml-1 font-mono text-[9.5px] text-ink/30">{{ counts[tab.key] || 0 }}</span>
      </button>
      <div class="ml-auto flex flex-wrap items-center gap-2">
        <SearchField v-model="search" placeholder="Search ref, company, tag…" class="w-56" />
        <SearchSelect v-model="priority" :options="priorityOptions" compact class="w-36" />
        <SearchSelect v-model="sort" :options="sortOptions" compact class="w-36" />
        <div class="flex rounded-full border border-ink/15 bg-surface p-0.5">
          <button type="button" class="flex size-7 items-center justify-center" :class="view === 'board' ? 'bg-ink text-bone' : 'text-ink/40'" aria-label="Board view" @click="view = 'board'"><LayoutGrid :size="13" /></button>
          <button type="button" class="flex size-7 items-center justify-center" :class="view === 'table' ? 'bg-ink text-bone' : 'text-ink/40'" aria-label="Table view" @click="view = 'table'"><List :size="13" /></button>
        </div>
      </div>
    </div>

    <div v-if="view === 'board'" class="flex gap-3 overflow-x-auto pb-4">
      <div
        v-for="column in columns"
        :key="column.key"
        class="flex w-[250px] shrink-0 flex-col border border-ink/12 bg-paper/50"
        @dragover.prevent
        @drop="moveTo(column.key)"
      >
        <div class="flex items-center justify-between border-b border-ink/10 bg-surface px-3 py-2.5">
          <span class="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/50">
            {{ column.label }}
            <span class="text-ink/25">{{ counts[column.key] || 0 }}</span>
          </span>
        </div>
        <div class="flex-1 space-y-2 p-2">
          <template v-if="loading">
            <div v-for="i in 3" :key="i" class="h-24 a-skeleton" />
          </template>
          <template v-else>
            <div v-for="quote in columnQuotes(column.key)" :key="quote.ref" @dragstart="dragging = quote.ref">
              <QuoteCard :quote="quote" @open="open(quote.ref)" @dragstart="dragging = quote.ref" />
            </div>
            <p v-if="!columnQuotes(column.key).length" class="py-8 text-center font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/25">Drop here</p>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="a-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="a-table min-w-[900px]">
          <thead>
            <tr>
              <th>Ref</th><th>Company / contact</th><th>Scope</th><th>Value</th><th>Priority</th><th>Status</th><th>Received</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="quote in paginated" :key="quote.ref" class="cursor-pointer" @click="open(quote.ref)">
              <td class="whitespace-nowrap font-mono text-[10.5px] text-signal-deep">{{ quote.ref }}</td>
              <td>
                <p class="text-[12px] font-medium">{{ quote.company || quote.name }}</p>
                <p class="text-[11px] text-ink/40">{{ quote.name }} · {{ quote.email }}</p>
              </td>
              <td>
                <p class="capitalize text-ink/60">{{ quote.projectTypeLabel }}</p>
                <p class="font-mono text-[9.5px] uppercase tracking-[0.05em] text-ink/30">{{ quote.quantity }}u · {{ quote.industry || '—' }}</p>
              </td>
              <td class="font-mono text-[11px]">{{ quote.value ? format.currency(quote.value) : '—' }}</td>
              <td><PriorityBadge :priority="quote.priority" /></td>
              <td><StatusBadge :status="quote.status" size="sm" /></td>
              <td class="whitespace-nowrap font-mono text-[10.5px] text-ink/40">{{ format.date(quote.createdAt) }}</td>
              <td><ArrowUpRight :size="13" class="text-ink/25" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-if="!loading && !filtered.length" title="No quotes match" text="Adjust the search or filters." />
      <div v-if="loading" class="space-y-2 p-4">
        <div v-for="i in 5" :key="i" class="h-9 a-skeleton" />
      </div>
      <PaginationBar v-if="filtered.length" :page="page" :pages="pages" :total="filtered.length" :limit="pageSize" @change="page = $event" />
    </div>
  </div>
</template>
