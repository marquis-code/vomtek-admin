<script setup lang="ts">
import { Plus, Pencil, Trash2, Images, CircleAlert, ExternalLink } from 'lucide-vue-next'
import type { MediaAsset } from '~/types'

useHead({ title: 'Media — Vomtek Studio' })

const api = useApi()
const media = useMedia()
const toast = useToast()
const kindOptions = [
  { value: 'bundled', label: 'Bundled' },
  { value: 'external', label: 'External' },
]

const loading = ref(true)
const items = ref<MediaAsset[]>([])
const error = ref('')
const open = ref(false)
const editing = ref<MediaAsset | null>(null)
const saving = ref(false)
const deleting = ref<MediaAsset | null>(null)
const deleteLoading = ref(false)

const form = reactive({ key: '', alt: '', title: '', credit: '', sourceUrl: '', tags: [] as string[], kind: 'external' as 'bundled' | 'external', externalUrl: '' })

async function load() {
  loading.value = true
  try {
    const response = await api.media.list()
    items.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function startCreate() {
  editing.value = null
  Object.assign(form, { key: '', alt: '', title: '', credit: '', sourceUrl: '', tags: [], kind: 'external', externalUrl: '' })
  open.value = true
}

function startEdit(item: MediaAsset) {
  editing.value = item
  Object.assign(form, {
    key: item.key,
    alt: item.alt,
    title: item.title || '',
    credit: item.credit || '',
    sourceUrl: item.sourceUrl || '',
    tags: [...item.tags],
    kind: item.kind,
    externalUrl: item.externalUrl || '',
  })
  open.value = true
}

async function save() {
  if (!form.key || !form.alt) { toast.error('Key and alt text are required'); return }
  saving.value = true
  try {
    if (editing.value) {
      const updated = await api.media.update(editing.value._id, form) as MediaAsset
      const index = items.value.findIndex(item => item._id === editing.value?._id)
      if (index >= 0) items.value[index] = updated
      toast.success('Asset updated')
    }
    else {
      const created = await api.media.create(form) as MediaAsset
      items.value.unshift(created)
      toast.success('Asset added')
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
    await api.media.remove(deleting.value._id)
    items.value = items.value.filter(item => item._id !== deleting.value?._id)
    deleting.value = null
    toast.success('Asset removed from the library')
  }
  catch (err: unknown) { toast.error('Could not delete', (err as Error).message) }
  finally { deleteLoading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="System" title="Media library" description="The curated photography used by the site, systems and carousel. Add external URLs or use the bundled image set.">
      <button type="button" class="a-btn a-btn-primary" @click="startCreate"><Plus :size="12" /> Add asset</button>
    </PageHeader>
    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="item in items" :key="item._id" class="a-card group overflow-hidden">
        <div class="relative aspect-[4/3] overflow-hidden bg-paper">
          <img :src="item.kind === 'external' ? item.externalUrl : media.url(item.key, 800)" :alt="item.alt" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
          <span class="absolute left-2 top-2 border border-bone/20 bg-ink/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-bone/70">{{ item.kind }}</span>
        </div>
        <div class="p-3">
          <p class="font-mono text-[10px] text-ink/60">{{ item.key }}</p>
          <p class="mt-1 line-clamp-2 text-[11.5px] text-ink/40">{{ item.alt }}</p>
          <div class="mt-2 flex items-center justify-between border-t border-ink/10 pt-2">
            <span class="font-mono text-[9px] uppercase tracking-[0.08em] text-ink/30">{{ item.credit || 'No credit' }}</span>
            <div class="flex gap-1">
              <button type="button" class="flex size-6 items-center justify-center text-ink/35 hover:text-ink" aria-label="Edit" @click="startEdit(item)"><Pencil :size="10" /></button>
              <button type="button" class="flex size-6 items-center justify-center text-ink/35 hover:text-signal-deep" aria-label="Delete" @click="deleting = item"><Trash2 :size="10" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><div v-for="i in 4" :key="i" class="h-52 a-skeleton" /></div>
    <EmptyState v-if="!loading && !items.length" title="Media library empty" text="Add a bundled image key or an external URL." :icon="Images" />

    <SlideOver :open="open" :title="editing ? 'Edit asset' : 'Add media asset'" @close="open = false">
      <div class="space-y-4 p-5">
        <div class="grid gap-3 sm:grid-cols-2">
          <div><label class="a-label">Key</label><input v-model="form.key" class="a-input font-mono text-[12px]" :disabled="!!editing" placeholder="panel-line"></div>
          <div><label class="a-label">Kind</label><SearchSelect v-model="form.kind" :options="kindOptions" /></div>
          <div class="sm:col-span-2"><label class="a-label">Alt text</label><input v-model="form.alt" class="a-input"></div>
          <div class="sm:col-span-2"><label class="a-label">Title</label><input v-model="form.title" class="a-input"></div>
          <div><label class="a-label">Credit</label><input v-model="form.credit" class="a-input"></div>
          <div><label class="a-label">Source URL</label><input v-model="form.sourceUrl" class="a-input"></div>
          <div v-if="form.kind === 'external'" class="sm:col-span-2"><label class="a-label">External image URL</label><input v-model="form.externalUrl" class="a-input font-mono text-[12px]"></div>
          <div class="sm:col-span-2"><label class="a-label">Tags</label><TagInput v-model="form.tags" /></div>
        </div>
        <div class="border border-ink/10 bg-paper/40 p-2">
          <p class="a-label">Preview</p>
          <img v-if="form.kind === 'external' ? form.externalUrl : form.key" :src="form.kind === 'external' ? form.externalUrl : media.url(form.key, 800)" alt="" class="h-40 w-full object-cover">
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="a-btn a-btn-ghost" @click="open = false">Cancel</button>
          <button type="button" class="a-btn a-btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : 'Save asset' }}</button>
        </div>
      </template>
    </SlideOver>

    <ConfirmDialog :open="!!deleting" title="Remove media asset?" :text="`“${deleting?.key}” may still be referenced by settings or systems.`" confirm-label="Remove" danger :loading="deleteLoading" @close="deleting = null" @confirm="remove" />
  </div>
</template>
