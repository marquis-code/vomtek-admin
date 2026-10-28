<script setup lang="ts">
import { Search, CircleAlert, ChevronDown } from 'lucide-vue-next'
import type { AuditLog } from '~/types'

useHead({ title: 'Audit log — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const format = useFormat()

const loading = ref(true)
const items = ref<AuditLog[]>([])
const total = ref(0)
const pages = ref(1)
const page = ref(1)
const q = ref('')
const entity = ref('all')
const error = ref('')
const expanded = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

const entities = ['all', 'quote', 'message', 'application', 'job', 'article', 'catalog', 'settings', 'user', 'auth']
const entityOptions = entities.map(value => ({ value, label: value === 'all' ? 'All entities' : value }))

async function load() {
  loading.value = true
  try {
    const response = await api.audit({ page: page.value, limit: 30, q: q.value || undefined, entity: entity.value })
    items.value = response.items
    total.value = response.total
    pages.value = response.pages
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

watch([entity], () => { page.value = 1; void load() })
watch(page, () => void load())
watch(q, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { page.value = 1; void load() }, 350)
})

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="System" title="Audit log" description="A record of every meaningful admin action — who changed what, and when.">
      <button type="button" class="a-btn a-btn-ghost" @click="load">Refresh</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="mb-3 flex flex-wrap items-center gap-2">
      <div class="relative">
        <Search :size="12" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
        <input v-model="q" type="search" placeholder="Search actions or people…" class="a-input h-9 w-64 pl-7 text-[12px]">
      </div>
      <SearchSelect v-model="entity" :options="entityOptions" compact class="w-44" />
      <span class="ml-auto font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">{{ total }} events</span>
    </div>

    <div class="a-card overflow-hidden">
      <table class="a-table">
        <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Summary</th><th /></tr></thead>
        <tbody>
          <template v-for="item in items" :key="item._id">
            <tr class="cursor-pointer" @click="expanded = expanded === item._id ? null : item._id">
              <td class="whitespace-nowrap font-mono text-[10.5px] text-ink/40">{{ format.dateTime(item.createdAt) }}</td>
              <td>
                <p class="text-[11.5px]">{{ item.actor?.name || 'System' }}</p>
                <p class="font-mono text-[9.5px] text-ink/35">{{ item.actor?.email || '—' }}</p>
              </td>
              <td><span class="border border-ink/12 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/45">{{ item.action }}</span></td>
              <td class="text-[11.5px] text-ink/60">{{ item.summary }}</td>
              <td><ChevronDown :size="12" class="text-ink/25 transition-transform" :class="expanded === item._id ? 'rotate-180' : ''" /></td>
            </tr>
            <tr v-if="expanded === item._id">
              <td colspan="5" class="bg-paper/60 p-3">
                <div class="flex flex-wrap gap-4 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/40">
                  <span>Entity: {{ item.entity }}</span>
                  <span v-if="item.entityId">ID: {{ item.entityId }}</span>
                  <span v-if="item.ip">IP: {{ item.ip }}</span>
                </div>
                <pre v-if="item.meta" class="mt-2 max-h-52 overflow-auto border border-ink/10 bg-surface p-2 font-mono text-[10.5px] text-ink/55">{{ JSON.stringify(item.meta, null, 2) }}</pre>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 6" :key="i" class="h-8 a-skeleton" /></div>
      <EmptyState v-if="!loading && !items.length" title="No audit events" text="Actions will appear here as the team works." />
      <PaginationBar v-if="total" :page="page" :pages="pages" :total="total" :limit="30" @change="page = $event" />
    </div>
  </div>
</template>
