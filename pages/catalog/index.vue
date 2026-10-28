<script setup lang="ts">
import { Plus, Pencil, Trash2, ExternalLink, CircleAlert, PanelsTopLeft } from 'lucide-vue-next'
import type { StandardSystem } from '~/types'

useHead({ title: 'Standard systems — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const format = useFormat()
const media = useMedia()
const config = useRuntimeConfig()

const loading = ref(true)
const items = ref<StandardSystem[]>([])
const error = ref('')
const open = ref(false)
const editing = ref<StandardSystem | null>(null)
const saving = ref(false)
const deleting = ref<StandardSystem | null>(null)
const deleteLoading = ref(false)

const empty = () => ({
  name: '',
  category: 'Controls',
  summary: '',
  description: '',
  priceFrom: 0,
  priceUnit: 'per unit',
  leadTime: '4–6 weeks',
  image: 'panel-line',
  specs: '',
  includes: '',
  active: true,
  featured: false,
  order: 0,
})
const form = reactive(empty())

async function load() {
  loading.value = true
  try {
    const response = await api.catalog.list()
    items.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function startCreate() {
  Object.assign(form, empty())
  editing.value = null
  open.value = true
}

function startEdit(item: StandardSystem) {
  editing.value = item
  Object.assign(form, {
    name: item.name,
    category: item.category,
    summary: item.summary,
    description: item.description || '',
    priceFrom: item.priceFrom,
    priceUnit: item.priceUnit,
    leadTime: item.leadTime,
    image: item.image,
    specs: item.specs.map(spec => `${spec.label}: ${spec.value}`).join('\n'),
    includes: item.includes.join('\n'),
    active: item.active,
    featured: item.featured,
    order: item.order,
  })
  open.value = true
}

function parseSpecs(value: string) {
  return value.split('\n').map((line) => {
    const [label, ...rest] = line.split(':')
    return { label: (label || '').trim(), value: rest.join(':').trim() }
  }).filter(spec => spec.label && spec.value)
}

async function save() {
  if (!form.name || !form.summary) {
    toast.error('Missing fields', 'Name and summary are required.')
    return
  }
  saving.value = true
  const body = {
    name: form.name,
    category: form.category,
    summary: form.summary,
    description: form.description,
    priceFrom: Number(form.priceFrom) || 0,
    priceUnit: form.priceUnit,
    leadTime: form.leadTime,
    image: form.image,
    specs: parseSpecs(form.specs),
    includes: form.includes.split('\n').map(line => line.trim()).filter(Boolean),
    active: form.active,
    featured: form.featured,
    order: Number(form.order) || 0,
  }
  try {
    if (editing.value) {
      const updated = await api.catalog.update(editing.value._id, body) as StandardSystem
      const index = items.value.findIndex(item => item._id === editing.value?._id)
      if (index >= 0) items.value[index] = updated
      toast.success('System updated')
    }
    else {
      const created = await api.catalog.create(body) as StandardSystem
      items.value.unshift(created)
      toast.success('System created')
    }
    open.value = false
  }
  catch (err: unknown) { toast.error('Could not save', (err as Error).message) }
  finally { saving.value = false }
}

async function remove() {
  if (!deleting.value) return
  deleteLoading.value = true
  try {
    await api.catalog.remove(deleting.value._id)
    items.value = items.value.filter(item => item._id !== deleting.value?._id)
    deleting.value = null
    toast.success('System deleted')
  }
  catch (err: unknown) { toast.error('Could not delete', (err as Error).message) }
  finally { deleteLoading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Revenue" title="Standard systems" description="Productised, pre-engineered systems that can be quoted quickly and delivered repeatedly. These appear on the public systems page.">
      <a :href="`${config.public.siteUrl}/systems`" target="_blank" rel="noopener" class="a-btn a-btn-ghost"><ExternalLink :size="12" /> View public page</a>
      <button type="button" class="a-btn a-btn-primary" @click="startCreate"><Plus :size="12" /> New system</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in items" :key="item._id" class="a-card group flex flex-col overflow-hidden" :class="item.active ? '' : 'opacity-60'">
        <div class="relative aspect-[16/10] overflow-hidden bg-paper">
          <img :src="media.url(item.image, 800)" :alt="item.name" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]">
          <span class="absolute left-2 top-2 border border-bone/20 bg-ink/75 px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-bone/70 backdrop-blur">{{ item.category }}</span>
          <span v-if="item.featured" class="absolute right-2 top-2 bg-signal px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-ink">Featured</span>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <h3 class="text-[16px] font-medium tracking-[-0.02em]">{{ item.name }}</h3>
          <p class="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink/45">{{ item.summary }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/40">
            <span class="border border-ink/10 px-1.5 py-1">{{ format.currency(item.priceFrom) }}+</span>
            <span class="border border-ink/10 px-1.5 py-1">{{ item.leadTime }}</span>
          </div>
          <div class="mt-auto flex items-center justify-between border-t border-ink/10 pt-3">
            <span class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">{{ item.active ? 'Live' : 'Hidden' }}</span>
            <div class="flex gap-1">
              <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-ink" aria-label="Edit" @click="startEdit(item)"><Pencil :size="11" /></button>
              <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-signal-deep" aria-label="Delete" @click="deleting = item"><Trash2 :size="11" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><div v-for="i in 3" :key="i" class="h-72 a-skeleton" /></div>
    <EmptyState v-if="!loading && !items.length" title="No standard systems" text="Package the work you do repeatedly and publish it here." :icon="PanelsTopLeft" />

    <SlideOver :open="open" :title="editing ? 'Edit system' : 'New standard system'" :subtitle="editing?.slug || 'Productised offer'" width="max-w-2xl" @close="open = false">
      <div class="space-y-4 p-5">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2"><label class="a-label">Name</label><input v-model="form.name" class="a-input"></div>
          <div><label class="a-label">Category</label><input v-model="form.category" class="a-input"></div>
          <div><label class="a-label">Price from (USD)</label><input v-model.number="form.priceFrom" type="number" class="a-input font-mono"></div>
          <div><label class="a-label">Price unit</label><input v-model="form.priceUnit" class="a-input"></div>
          <div><label class="a-label">Lead time</label><input v-model="form.leadTime" class="a-input"></div>
          <div class="sm:col-span-2"><label class="a-label">Summary</label><textarea v-model="form.summary" rows="2" class="a-input" /></div>
          <div class="sm:col-span-2"><label class="a-label">Description</label><textarea v-model="form.description" rows="3" class="a-input" /></div>
        </div>
        <ImagePicker v-model="form.image" label="Cover image" />
        <div><label class="a-label">Specs (Label: Value, one per line)</label><textarea v-model="form.specs" rows="4" class="a-input font-mono text-[12px]" /></div>
        <div><label class="a-label">Includes (one per line)</label><textarea v-model="form.includes" rows="4" class="a-input font-mono text-[12px]" /></div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div><label class="a-label">Order</label><input v-model.number="form.order" type="number" class="a-input"></div>
          <div class="flex items-end gap-5">
            <ToggleSwitch v-model="form.active" label="Active" />
            <ToggleSwitch v-model="form.featured" label="Featured" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="a-btn a-btn-ghost" @click="open = false">Cancel</button>
          <button type="button" class="a-btn a-btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : (editing ? 'Save system' : 'Create system') }}</button>
        </div>
      </template>
    </SlideOver>

    <ConfirmDialog :open="!!deleting" title="Delete this system?" :text="`“${deleting?.name}” will disappear from the website.`" confirm-label="Delete" danger :loading="deleteLoading" @close="deleting = null" @confirm="remove" />
  </div>
</template>
