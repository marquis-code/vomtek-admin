<script setup lang="ts">
import { Plus, Pencil, Trash2, ExternalLink, ArrowUp, ArrowDown, X, CircleAlert, Newspaper } from 'lucide-vue-next'
import type { Article, ArticleBlock } from '~/types'

useHead({ title: 'Field notes — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const format = useFormat()
const config = useRuntimeConfig()

const toneOptions = [
  { value: 'ink', label: 'Ink' },
  { value: 'signal', label: 'Signal' },
  { value: 'bone', label: 'Bone' },
]

const loading = ref(true)
const articles = ref<Article[]>([])
const error = ref('')
const open = ref(false)
const editing = ref<Article | null>(null)
const saving = ref(false)
const deleting = ref<Article | null>(null)
const deleteLoading = ref(false)

const blockTypes: { value: ArticleBlock['type'], label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h2', label: 'Heading' },
  { value: 'quote', label: 'Quote' },
  { value: 'list', label: 'List' },
]

const emptyBlock = (): ArticleBlock => ({ type: 'p', text: '' })

const empty = () => ({
  title: '',
  excerpt: '',
  category: 'Engineering',
  readingTime: 5,
  publishedAt: new Date().toISOString().slice(0, 10),
  author: 'Vomtek Engineering',
  tone: 'ink' as Article['tone'],
  published: true,
  tags: [] as string[],
  body: [emptyBlock()],
})

const form = reactive(empty())

async function load() {
  loading.value = true
  try {
    const response = await api.articles.list()
    articles.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function startCreate() {
  Object.assign(form, empty())
  editing.value = null
  open.value = true
}

function startEdit(article: Article) {
  editing.value = article
  Object.assign(form, {
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    readingTime: article.readingTime,
    publishedAt: article.publishedAt,
    author: article.author,
    tone: article.tone,
    published: article.published,
    tags: [...article.tags],
    body: article.body.map(block => ({ ...block, items: block.items ? [...block.items] : undefined })),
  })
  open.value = true
}

function addBlock(type: ArticleBlock['type'] = 'p') {
  form.body.push({ type, text: '', ...(type === 'list' ? { items: [] } : {}) })
}

function removeBlock(index: number) {
  form.body.splice(index, 1)
  if (!form.body.length) form.body.push(emptyBlock())
}

function moveBlock(index: number, direction: number) {
  const target = index + direction
  if (target < 0 || target >= form.body.length) return
  const [block] = form.body.splice(index, 1)
  if (block) form.body.splice(target, 0, block)
}

function listItems(block: ArticleBlock) {
  return (block.items || []).join('\n')
}

function setListItems(block: ArticleBlock, value: string) {
  block.items = value.split('\n').map(line => line.trim()).filter(Boolean)
}

async function save() {
  if (!form.title || !form.excerpt) {
    toast.error('Missing fields', 'Title and excerpt are required.')
    return
  }
  saving.value = true
  const body = {
    title: form.title,
    excerpt: form.excerpt,
    category: form.category,
    readingTime: Number(form.readingTime) || 5,
    publishedAt: form.publishedAt,
    author: form.author,
    tone: form.tone,
    published: form.published,
    tags: form.tags,
    body: form.body.filter(block => (block.type === 'list' ? (block.items?.length ?? 0) : block.text?.trim())),
  }
  try {
    if (editing.value) {
      const updated = await api.articles.update(editing.value.slug, body) as Article
      const index = articles.value.findIndex(item => item.slug === editing.value?.slug)
      if (index >= 0) articles.value[index] = updated
      toast.success('Field note updated')
    }
    else {
      const created = await api.articles.create(body) as Article
      articles.value.unshift(created)
      toast.success('Field note published')
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
    await api.articles.remove(deleting.value.slug)
    articles.value = articles.value.filter(item => item.slug !== deleting.value?.slug)
    deleting.value = null
    toast.success('Field note deleted')
  }
  catch (err: unknown) { toast.error('Could not delete', (err as Error).message) }
  finally { deleteLoading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Marketing" title="Field notes" description="Long-form engineering writing that earns search traffic and proves expertise. Drafts stay hidden from the site.">
      <button type="button" class="a-btn a-btn-primary" @click="startCreate"><Plus :size="12" /> New field note</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="a-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="a-table min-w-[760px]">
          <thead><tr><th>Title</th><th>Category</th><th>Tone</th><th>Published</th><th>Status</th><th /></tr></thead>
          <tbody>
            <tr v-for="article in articles" :key="article.slug" class="cursor-pointer" @click="startEdit(article)">
              <td>
                <p class="max-w-md text-[12px] font-medium">{{ article.title }}</p>
                <p class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/30">/insights/{{ article.slug }}</p>
              </td>
              <td class="font-mono text-[10px] uppercase tracking-[0.06em] text-ink/45">{{ article.category }}</td>
              <td class="font-mono text-[10px] uppercase tracking-[0.06em] text-ink/45">{{ article.tone }}</td>
              <td class="whitespace-nowrap font-mono text-[10.5px] text-ink/40">{{ format.date(article.publishedAt) }}</td>
              <td><StatusBadge :status="article.published ? 'approved' : 'archived'" size="sm" /></td>
              <td @click.stop>
                <div class="flex items-center gap-1">
                  <a v-if="article.published" :href="`${config.public.siteUrl}/insights/${article.slug}`" target="_blank" rel="noopener" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-ink" aria-label="View article"><ExternalLink :size="11" /></a>
                  <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-ink" aria-label="Edit" @click="startEdit(article)"><Pencil :size="11" /></button>
                  <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-signal-deep" aria-label="Delete" @click="deleting = article"><Trash2 :size="11" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 5" :key="i" class="h-9 a-skeleton" /></div>
      <EmptyState v-if="!loading && !articles.length" title="No field notes" text="Write the first one from the shop floor." :icon="Newspaper" />
    </div>

    <SlideOver :open="open" :title="editing ? 'Edit field note' : 'New field note'" :subtitle="editing?.slug || 'Draft'" width="max-w-3xl" @close="open = false">
      <div class="space-y-4 p-5">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2"><label class="a-label">Title</label><input v-model="form.title" class="a-input"></div>
          <div><label class="a-label">Category</label><input v-model="form.category" class="a-input"></div>
          <div><label class="a-label">Author</label><input v-model="form.author" class="a-input"></div>
          <div><label class="a-label">Published date</label><input v-model="form.publishedAt" type="date" class="a-input font-mono"></div>
          <div><label class="a-label">Reading time (min)</label><input v-model.number="form.readingTime" type="number" min="1" class="a-input"></div>
          <div><label class="a-label">Tone</label><SearchSelect v-model="form.tone" :options="toneOptions" /></div>
          <div class="flex items-end"><ToggleSwitch v-model="form.published" label="Published" /></div>
        </div>
        <div><label class="a-label">Excerpt</label><textarea v-model="form.excerpt" rows="2" class="a-input" /></div>
        <div><label class="a-label">Tags</label><TagInput v-model="form.tags" /></div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="a-label !mb-0">Body</label>
            <div class="flex gap-1">
              <button v-for="type in blockTypes" :key="type.value" type="button" class="a-btn a-btn-ghost h-7 px-2 text-[9.5px]" @click="addBlock(type.value)">+ {{ type.label }}</button>
            </div>
          </div>
          <div class="space-y-2">
            <div v-for="(block, i) in form.body" :key="i" class="border border-ink/12 bg-paper/40 p-2.5">
              <div class="mb-1.5 flex items-center justify-between">
                <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">{{ block.type }}</span>
                <div class="flex gap-0.5">
                  <button type="button" class="flex size-6 items-center justify-center text-ink/35 hover:text-ink" aria-label="Move up" @click="moveBlock(i, -1)"><ArrowUp :size="11" /></button>
                  <button type="button" class="flex size-6 items-center justify-center text-ink/35 hover:text-ink" aria-label="Move down" @click="moveBlock(i, 1)"><ArrowDown :size="11" /></button>
                  <button type="button" class="flex size-6 items-center justify-center text-ink/35 hover:text-signal-deep" aria-label="Remove" @click="removeBlock(i)"><X :size="11" /></button>
                </div>
              </div>
              <textarea v-if="block.type !== 'list'" v-model="block.text" rows="3" class="a-input text-[12px]" :placeholder="block.type === 'quote' ? 'Quote…' : block.type === 'h2' ? 'Heading…' : 'Paragraph…'" />
              <textarea v-else :value="listItems(block)" rows="3" class="a-input font-mono text-[12px]" placeholder="One item per line" @input="setListItems(block, ($event.target as HTMLTextAreaElement).value)" />
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="a-btn a-btn-ghost" @click="open = false">Cancel</button>
          <button type="button" class="a-btn a-btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : (editing ? 'Save field note' : 'Publish') }}</button>
        </div>
      </template>
    </SlideOver>

    <ConfirmDialog :open="!!deleting" title="Delete this field note?" :text="`“${deleting?.title}” will be removed from the website.`" confirm-label="Delete" danger :loading="deleteLoading" @close="deleting = null" @confirm="remove" />
  </div>
</template>
