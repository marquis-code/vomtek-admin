<script setup lang="ts">
import { Download, Mail, CircleAlert, Search } from 'lucide-vue-next'
import type { Subscriber } from '~/types'

useHead({ title: 'Subscribers — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const format = useFormat()
const loading = ref(true)
const items = ref<Subscriber[]>([])
const error = ref('')
const search = ref('')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return items.value
  return items.value.filter(item => item.email.toLowerCase().includes(term))
})

async function load() {
  loading.value = true
  try {
    const response = await api.subscribers.list()
    items.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

async function toggle(subscriber: Subscriber) {
  const status = subscriber.status === 'active' ? 'unsubscribed' : 'active'
  await api.subscribers.update(subscriber._id, status)
  subscriber.status = status
  toast.success(status === 'active' ? 'Subscriber restored' : 'Subscriber unsubscribed')
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Marketing" title="Field notes subscribers" description="The list that receives new engineering notes. Export it to your email tool.">
      <button type="button" class="a-btn a-btn-ghost" @click="api.subscribers.exportCsv()"><Download :size="12" /> Export CSV</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="a-card overflow-hidden">
      <div class="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <p class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink/40">{{ items.length }} subscribers · {{ items.filter(i => i.status === 'active').length }} active</p>
        <div class="relative">
          <Search :size="12" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
          <input v-model="search" type="search" placeholder="Filter email" class="a-input h-8 w-52 pl-7 text-[12px]">
        </div>
      </div>
      <table class="a-table">
        <thead><tr><th>Email</th><th>Source</th><th>Status</th><th>Joined</th><th /></tr></thead>
        <tbody>
          <tr v-for="item in filtered" :key="item._id">
            <td class="text-[12px]">{{ item.email }}</td>
            <td class="font-mono text-[10px] uppercase tracking-[0.06em] text-ink/40">{{ item.source }}</td>
            <td><StatusBadge :status="item.status === 'active' ? 'approved' : 'archived'" size="sm" /></td>
            <td class="font-mono text-[10.5px] text-ink/40">{{ format.date(item.createdAt) }}</td>
            <td class="text-right"><button type="button" class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/40 underline underline-offset-4 hover:text-ink" @click="toggle(item)">{{ item.status === 'active' ? 'Unsubscribe' : 'Restore' }}</button></td>
          </tr>
        </tbody>
      </table>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 4" :key="i" class="h-8 a-skeleton" /></div>
      <EmptyState v-if="!loading && !filtered.length" title="No subscribers yet" text="The footer and field notes page collect them automatically." :icon="Mail" />
    </div>
  </div>
</template>
