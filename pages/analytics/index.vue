<script setup lang="ts">
import { RefreshCw, CircleAlert, TrendingUp, Users, MousePointerClick, FileText } from 'lucide-vue-next'
import type { AnalyticsSummary } from '~/types'

useHead({ title: 'Analytics — Vomtek Studio' })

const api = useApi()
const format = useFormat()
const loading = ref(true)
const days = ref(30)
const data = ref<AnalyticsSummary | null>(null)
const error = ref('')

const chart = computed(() => {
  const rows = data.value?.daily ?? []
  const map = new Map(rows.map(row => [row.date, row]))
  const output: { label: string, value: number, secondary: number }[] = []
  for (let i = days.value - 1; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    output.push({ label: key.slice(5), value: map.get(key)?.views ?? 0, secondary: map.get(key)?.sessions ?? 0 })
  }
  return output
})

const totals = computed(() => ({
  views: chart.value.reduce((sum, row) => sum + row.value, 0),
  sessions: data.value?.conversions.sessions ?? 0,
}))

async function load() {
  loading.value = true
  error.value = ''
  try { data.value = await api.analytics(days.value) }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function range(value: number) { days.value = value; void load() }

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Growth" title="Analytics" description="First-party, cookie-free funnel data. Page views, quote intent and submissions from the marketing site.">
      <div class="flex rounded-full border border-ink/15 bg-surface p-0.5">
        <button v-for="r in [7, 30, 90]" :key="r" type="button" class="rounded-full px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] transition-colors" :class="days === r ? 'bg-brand-deep text-white' : 'text-ink/45'" @click="range(r)">{{ r }}d</button>
      </div>
      <button type="button" class="a-btn a-btn-ghost" :disabled="loading" @click="load"><RefreshCw :size="12" :class="loading ? 'animate-spin' : ''" /> Refresh</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Page views" :value="format.number(totals.views)" :hint="`Last ${days} days`" :loading="loading" />
      <KpiCard label="Sessions" :value="format.number(totals.sessions)" hint="Unique first-party session ids" :loading="loading" />
      <KpiCard label="Quote configurator views" :value="format.number(data?.conversions.quoteViews)" hint="Intent signal" :loading="loading" />
      <KpiCard label="View → submit" :value="`${data?.conversions.viewToSubmit ?? 0}%`" :hint="`${data?.conversions.submissions ?? 0} submissions`" :loading="loading" accent />
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-12">
      <section class="a-card xl:col-span-8">
        <div class="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div>
            <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Traffic</p>
            <p class="mt-0.5 flex items-baseline gap-2 text-[14px] font-medium">{{ format.number(totals.views) }} views <span class="text-[11px] font-normal text-ink/35">{{ format.number(totals.sessions) }} sessions</span></p>
          </div>
          <div class="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.08em] text-ink/35">
            <span class="flex items-center gap-1"><span class="size-1.5 bg-signal" /> views</span>
          </div>
        </div>
        <div class="p-4">
          <SparkArea :values="chart.map(d => d.value)" :height="160" color="#007d48" />
          <div class="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-ink/25">
            <span>{{ chart[0]?.label }}</span><span>{{ chart[Math.floor(chart.length / 2)]?.label }}</span><span>{{ chart[chart.length - 1]?.label }}</span>
          </div>
        </div>
      </section>

      <section class="a-card xl:col-span-4">
        <div class="border-b border-ink/10 px-4 py-3">
          <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Conversion</p>
          <p class="mt-0.5 text-[14px] font-medium">The path to a quote</p>
        </div>
        <div class="space-y-4 p-4">
          <div v-for="row in [
            { label: 'Sessions', value: totals.sessions, icon: Users },
            { label: 'Quote page views', value: data?.conversions.quoteViews ?? 0, icon: FileText },
            { label: 'Quote submissions', value: data?.conversions.submissions ?? 0, icon: MousePointerClick },
          ]" :key="row.label" class="flex items-center justify-between border-b border-ink/8 pb-3">
            <span class="flex items-center gap-2 text-[11.5px] text-ink/55"><component :is="row.icon" :size="13" class="text-ink/30" /> {{ row.label }}</span>
            <span class="font-mono text-[12px]">{{ row.value }}</span>
          </div>
          <div class="border border-signal/30 bg-signal/8 p-3">
            <p class="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep"><TrendingUp :size="11" /> View to submit</p>
            <p class="mt-1 text-[26px] font-medium leading-none">{{ data?.conversions.viewToSubmit ?? 0 }}%</p>
            <p class="mt-1 text-[11px] text-ink/45">Of people who open the configurator, this share submit.</p>
          </div>
        </div>
      </section>

      <section class="a-card p-4 xl:col-span-4">
        <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Top pages</p>
        <BarList class="mt-3" :items="(data?.topPages ?? []).map(p => ({ label: p.path, value: p.views }))" />
      </section>

      <section class="a-card p-4 xl:col-span-4">
        <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Referrers</p>
        <BarList class="mt-3" :items="(data?.sources ?? []).map(s => ({ label: s.source === 'direct' ? 'Direct / none' : s.source, value: s.count }))" />
      </section>

      <section class="a-card p-4 xl:col-span-4">
        <p class="font-mono text-[9.5px] uppercase tracking-[0.13em] text-ink/40">Events</p>
        <div class="mt-3 space-y-2">
          <div v-for="event in data?.topEvents ?? []" :key="event.name" class="flex items-center justify-between border-b border-ink/8 pb-2">
            <span class="font-mono text-[10.5px] text-ink/55">{{ event.name }}</span>
            <span class="font-mono text-[11px] text-ink/70">{{ event.count }}</span>
          </div>
        </div>
      </section>
    </div>

    <p class="mt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-ink/30">
      First-party. No ad cookies. Respects Do Not Track and Global Privacy Control. Events expire after 180 days.
    </p>
  </div>
</template>
