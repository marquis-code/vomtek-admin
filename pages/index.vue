<script setup lang="ts">
import { RefreshCw, ArrowUpRight, Inbox, FileText, UserRoundSearch, Mail, CircleAlert, Plus, Newspaper, PanelsTopLeft } from 'lucide-vue-next'
import type { Overview, AuditLog } from '~/types'

useHead({ title: 'Dashboard — Vomtek Studio' })

const api = useApi()
const auth = useAuth()
const format = useFormat()
const toast = useToast()

const days = ref(30)
const loading = ref(true)
const overview = ref<Overview | null>(null)
const activity = ref<AuditLog[]>([])
const error = ref('')

const greeting = computed(() => {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
})
const firstName = computed(() => auth.user.value?.name?.split(' ')[0] || 'there')
const canAudit = computed(() => ['owner', 'admin'].includes(auth.user.value?.role || ''))

const statuses = [
  { key: 'received', label: 'Received', color: 'bg-ink/35' },
  { key: 'engineering_review', label: 'Engineering', color: 'bg-amber-600' },
  { key: 'quoted', label: 'Quoted', color: 'bg-sky-700' },
  { key: 'approved', label: 'Approved', color: 'bg-emerald-700' },
  { key: 'in_build', label: 'In build', color: 'bg-signal' },
  { key: 'shipped', label: 'Shipped', color: 'bg-ink' },
]

const pipeline = computed(() => statuses.map(status => ({
  ...status,
  count: overview.value?.quotes.status[status.key]?.count ?? 0,
  value: overview.value?.quotes.status[status.key]?.value ?? 0,
})))

const totalInPipeline = computed(() => pipeline.value.reduce((sum, row) => sum + row.count, 0) || 1)

const chartData = computed(() => {
  const rows = overview.value?.analytics.daily ?? []
  const map = new Map(rows.map(row => [row.date, row]))
  const output: { label: string, value: number }[] = []
  const span = days.value
  for (let i = span - 1; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    output.push({ label: key.slice(5), value: map.get(key)?.views ?? 0 })
  }
  return output
})

const chartTotal = computed(() => chartData.value.reduce((sum, row) => sum + row.value, 0))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [data, audit] = await Promise.all([
      api.overview(days.value),
      canAudit.value ? api.activity(8).catch(() => ({ items: [] as AuditLog[], total: 0, page: 1, limit: 8, pages: 1 })) : Promise.resolve({ items: [] as AuditLog[] }),
    ])
    overview.value = data
    activity.value = audit.items
  }
  catch (err: unknown) {
    error.value = (err as Error).message || 'Could not load the dashboard.'
  }
  finally {
    loading.value = false
  }
}

function setRange(value: number) {
  days.value = value
  void load()
}

onMounted(load)
watch(days, load)
</script>

<template>
  <div>
    <div class="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p class="font-mono text-[9.5px] uppercase tracking-[0.18em] text-signal-deep">Live pipeline</p>
        <h1 class="mt-1 text-[28px] font-medium tracking-[-0.045em] md:text-[34px]">{{ greeting }}, {{ firstName }}.</h1>
        <p class="mt-1.5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/35">
          <span class="size-1.5 animate-pulse rounded-full bg-signal" />
          {{ overview ? `Updated ${format.relative(overview.generatedAt)}` : 'Loading pipeline' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex rounded-full border border-ink/15 bg-surface p-0.5">
          <button v-for="range in [7, 30, 90]" :key="range" type="button" class="rounded-full px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors" :class="days === range ? 'bg-brand-deep text-white' : 'text-ink/45 hover:text-ink'" @click="setRange(range)">
            {{ range }}d
          </button>
        </div>
        <button type="button" class="a-btn a-btn-ghost" :disabled="loading" @click="load">
          <RefreshCw :size="12" :class="loading ? 'animate-spin' : ''" /> Refresh
        </button>
        <NuxtLink to="/quotes" class="a-btn a-btn-primary">Open pipeline <ArrowUpRight :size="12" /></NuxtLink>
      </div>
    </div>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-danger">
      <CircleAlert :size="13" /> {{ error }}
    </div>

    <!-- KPIs -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Open pipeline value" :value="format.currency(overview?.quotes.pipelineValue)" :hint="`${overview?.quotes.total ?? 0} projects on file`" :loading="loading" accent />
      <KpiCard label="New requests" :value="overview?.quotes.newInRange ?? 0" :hint="`In the last ${days} days`" :loading="loading" />
      <KpiCard label="Quote → build" :value="`${overview?.quotes.conversionRate ?? 0}%`" hint="Approved, in build, shipped or closed" :loading="loading" />
      <KpiCard label="Needs attention" :value="overview?.quotes.needsAttention ?? 0" hint="Open for more than 24 hours" :loading="loading" :accent="(overview?.quotes.needsAttention ?? 0) > 0" />
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-12">
      <!-- pipeline -->
      <section class="a-card xl:col-span-5">
        <div class="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div>
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Pipeline</p>
            <p class="mt-0.5 text-[14px] font-medium">Where the work is</p>
          </div>
          <NuxtLink to="/quotes" class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">View all →</NuxtLink>
        </div>
        <div class="space-y-3 p-4">
          <div v-for="row in pipeline" :key="row.key" class="group">
            <div class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-2 text-[11.5px] text-ink/60">
                <span class="size-1.5" :class="row.color" />
                {{ row.label }}
              </span>
              <span class="flex items-baseline gap-2">
                <span class="font-mono text-[10.5px] text-ink/35">{{ row.value ? format.currency(row.value) : '' }}</span>
                <span class="text-[14px] font-medium tabular-nums">{{ row.count }}</span>
              </span>
            </div>
            <div class="mt-1.5 h-1 w-full bg-ink/8">
              <div class="h-1 transition-all duration-500" :class="row.color" :style="{ width: `${(row.count / totalInPipeline) * 100}%` }" />
            </div>
          </div>
        </div>
      </section>

      <!-- traffic -->
      <section class="a-card xl:col-span-4">
        <div class="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div>
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Website traffic</p>
            <p class="mt-0.5 text-[14px] font-medium"><span class="text-[22px]">{{ format.number(chartTotal) }}</span> <span class="text-[11px] font-normal text-ink/35">page views</span></p>
          </div>
          <NuxtLink to="/analytics" class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">Analytics →</NuxtLink>
        </div>
        <div class="p-4">
          <SparkArea :values="chartData.map(d => d.value)" :height="96" />
          <div class="mt-2 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/25">
            <span>{{ chartData[0]?.label }}</span>
            <span>{{ chartData[Math.floor(chartData.length / 2)]?.label }}</span>
            <span>{{ chartData[chartData.length - 1]?.label }}</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-px border-t border-ink/10 bg-ink/10">
          <div class="bg-surface px-4 py-3">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Quote submits</p>
            <p class="mt-1 text-[18px] font-medium">{{ overview?.analytics.quoteSubmits ?? 0 }}</p>
          </div>
          <div class="bg-surface px-4 py-3">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Messages</p>
            <p class="mt-1 text-[18px] font-medium">{{ overview?.analytics.contactSubmits ?? 0 }}</p>
          </div>
        </div>
      </section>

      <!-- attention -->
      <section class="a-card xl:col-span-3">
        <div class="border-b border-ink/10 px-4 py-3">
          <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Needs a human</p>
          <p class="mt-0.5 text-[14px] font-medium">Today’s queue</p>
        </div>
        <div class="divide-y divide-ink/10">
          <NuxtLink to="/messages" class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper">
            <span class="flex items-center gap-2 text-[11.5px] text-ink/60"><Inbox :size="13" class="text-ink/35" /> Unread messages</span>
            <span class="text-[14px] font-medium">{{ overview?.messages.unread ?? 0 }}</span>
          </NuxtLink>
          <NuxtLink to="/applications" class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper">
            <span class="flex items-center gap-2 text-[11.5px] text-ink/60"><UserRoundSearch :size="13" class="text-ink/35" /> New applications</span>
            <span class="text-[14px] font-medium">{{ overview?.applications.new ?? 0 }}</span>
          </NuxtLink>
          <NuxtLink to="/subscribers" class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper">
            <span class="flex items-center gap-2 text-[11.5px] text-ink/60"><Mail :size="13" class="text-ink/35" /> Subscribers</span>
            <span class="text-[14px] font-medium">{{ overview?.subscribers.active ?? 0 }}</span>
          </NuxtLink>
          <NuxtLink to="/jobs" class="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-paper">
            <span class="flex items-center gap-2 text-[11.5px] text-ink/60"><FileText :size="13" class="text-ink/35" /> Open roles</span>
            <span class="text-[14px] font-medium">{{ overview?.jobs.active ?? 0 }}</span>
          </NuxtLink>
        </div>
        <div class="border-t border-ink/10 p-3">
          <NuxtLink to="/quotes?status=received" class="a-btn a-btn-ghost w-full">Triage received quotes</NuxtLink>
        </div>
      </section>
    </div>

    <!-- lower -->
    <div class="mt-4 grid gap-4 xl:grid-cols-12">
      <section class="a-card overflow-hidden xl:col-span-8">
        <div class="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div>
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Recent requests</p>
            <p class="mt-0.5 text-[14px] font-medium">The top of the funnel</p>
          </div>
          <NuxtLink to="/quotes" class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">All quotes →</NuxtLink>
        </div>
        <div class="hidden grid-cols-[100px_1fr_110px_110px_30px] gap-3 border-b border-ink/10 bg-paper/60 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/35 md:grid">
          <span>Reference</span><span>Contact / scope</span><span>Value</span><span>Status</span><span />
        </div>
        <div v-if="loading" class="space-y-2 p-4">
          <div v-for="i in 4" :key="i" class="h-9 a-skeleton" />
        </div>
        <div v-else-if="overview?.quotes.recent.length" class="divide-y divide-ink/10">
          <NuxtLink v-for="quote in overview.quotes.recent" :key="quote.ref" :to="`/quotes/${quote.ref}`" class="grid gap-2 px-4 py-3 transition-colors hover:bg-paper md:grid-cols-[100px_1fr_110px_110px_30px] md:items-center md:gap-3">
            <span class="font-mono text-[10.5px] text-signal-deep">{{ quote.ref }}</span>
            <span class="min-w-0">
              <span class="block truncate text-[12px] font-medium">{{ quote.company || quote.name }}</span>
              <span class="block truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/35">{{ quote.projectTypeLabel }} · {{ format.relative(quote.createdAt) }}</span>
            </span>
            <span class="font-mono text-[10.5px] text-ink/55">{{ quote.value ? format.currency(quote.value) : '—' }}</span>
            <StatusBadge :status="quote.status" size="sm" />
            <ArrowUpRight :size="12" class="hidden text-ink/25 md:block" />
          </NuxtLink>
        </div>
        <EmptyState v-else title="No requests yet" text="Once a quote comes in it will appear here." />
      </section>

      <div class="space-y-4 xl:col-span-4">
        <section class="a-card p-4">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Top pages</p>
            <NuxtLink to="/analytics" class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">More →</NuxtLink>
          </div>
          <BarList class="mt-3" :items="(overview?.analytics.topPages ?? []).slice(0, 6).map(p => ({ label: p.path, value: p.count }))" />
        </section>

        <section v-if="canAudit" class="a-card p-4">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Recent activity</p>
            <NuxtLink to="/audit" class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">Audit →</NuxtLink>
          </div>
          <ul class="mt-3 space-y-2.5">
            <li v-for="item in activity" :key="item._id" class="flex gap-2.5">
              <span class="mt-1.5 size-1 shrink-0 bg-signal" />
              <div class="min-w-0">
                <p class="truncate text-[12px] text-ink/65">{{ item.summary }}</p>
                <p class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">{{ item.actor?.name || 'System' }} · {{ format.relative(item.createdAt) }}</p>
              </div>
            </li>
            <li v-if="!activity.length" class="py-3 text-center font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/30">No activity recorded.</li>
          </ul>
        </section>

        <section class="a-card p-4">
          <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Quick actions</p>
          <div class="mt-3 grid gap-1.5">
            <NuxtLink to="/catalog" class="flex items-center justify-between border border-ink/10 px-3 py-2.5 text-[11.5px] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink">
              <span class="flex items-center gap-2"><PanelsTopLeft :size="13" /> Add a standard system</span><Plus :size="12" />
            </NuxtLink>
            <NuxtLink to="/articles" class="flex items-center justify-between border border-ink/10 px-3 py-2.5 text-[11.5px] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink">
              <span class="flex items-center gap-2"><Newspaper :size="13" /> Write a field note</span><Plus :size="12" />
            </NuxtLink>
            <NuxtLink to="/settings" class="flex items-center justify-between border border-ink/10 px-3 py-2.5 text-[11.5px] text-ink/60 transition-colors hover:border-ink/30 hover:text-ink">
              <span class="flex items-center gap-2"><FileText :size="13" /> Update site settings</span><ArrowUpRight :size="12" />
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
