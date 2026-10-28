<script setup lang="ts">
import { Plus, Pencil, Trash2, ExternalLink, Briefcase, CircleAlert } from 'lucide-vue-next'
import type { Job } from '~/types'

useHead({ title: 'Jobs — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const format = useFormat()
const config = useRuntimeConfig()

const loading = ref(true)
const jobs = ref<Job[]>([])
const error = ref('')
const open = ref(false)
const editing = ref<Job | null>(null)
const saving = ref(false)
const deleting = ref<Job | null>(null)
const deleteLoading = ref(false)

const empty = () => ({
  title: '',
  division: 'Instrumentation',
  location: 'Houston, TX',
  type: 'Full-time',
  level: 'Experienced',
  summary: '',
  responsibilities: '',
  requirements: '',
  niceToHave: '',
  postedAt: new Date().toISOString().slice(0, 10),
  active: true,
})

const form = reactive(empty())

const divisions = ['Electrical', 'Instrumentation', 'Automotive', 'Mechanical', 'Fabrication', 'Facilities']
const divisionOptions = divisions.map(value => ({ value, label: value }))
const typeOptions = ['Full-time', 'Part-time', 'Contract'].map(value => ({ value, label: value }))

async function load() {
  loading.value = true
  try {
    const response = await api.jobs.list()
    jobs.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function startCreate() {
  Object.assign(form, empty())
  editing.value = null
  open.value = true
}

function startEdit(job: Job) {
  editing.value = job
  Object.assign(form, {
    title: job.title,
    division: job.division,
    location: job.location,
    type: job.type,
    level: job.level,
    summary: job.summary,
    responsibilities: job.responsibilities.join('\n'),
    requirements: job.requirements.join('\n'),
    niceToHave: job.niceToHave.join('\n'),
    postedAt: job.postedAt,
    active: job.active,
  })
  open.value = true
}

function lines(value: string) {
  return value.split('\n').map(line => line.trim()).filter(Boolean)
}

async function save() {
  if (!form.title || !form.summary) {
    toast.error('Missing fields', 'Title and summary are required.')
    return
  }
  saving.value = true
  const body = {
    title: form.title,
    division: form.division,
    location: form.location,
    type: form.type,
    level: form.level,
    summary: form.summary,
    responsibilities: lines(form.responsibilities),
    requirements: lines(form.requirements),
    niceToHave: lines(form.niceToHave),
    postedAt: form.postedAt,
    active: form.active,
  }
  try {
    if (editing.value) {
      const updated = await api.jobs.update(editing.value._id, body) as Job
      const index = jobs.value.findIndex(item => item._id === editing.value?._id)
      if (index >= 0) jobs.value[index] = updated
      toast.success('Role updated')
    }
    else {
      const created = await api.jobs.create(body) as Job
      jobs.value.unshift(created)
      toast.success('Role published')
    }
    open.value = false
  }
  catch (err: unknown) { toast.error('Could not save role', (err as Error).message) }
  finally { saving.value = false }
}

async function toggleActive(job: Job) {
  const updated = await api.jobs.update(job._id, { active: !job.active }) as Job
  const index = jobs.value.findIndex(item => item._id === job._id)
  if (index >= 0) jobs.value[index] = updated
  toast.success(updated.active ? 'Role published' : 'Role hidden')
}

async function remove() {
  if (!deleting.value) return
  deleteLoading.value = true
  try {
    await api.jobs.remove(deleting.value._id)
    jobs.value = jobs.value.filter(item => item._id !== deleting.value?._id)
    deleting.value = null
    toast.success('Role deleted')
  }
  catch (err: unknown) { toast.error('Could not delete', (err as Error).message) }
  finally { deleteLoading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="People" title="Open roles" description="Publish roles to the careers page. Applications flow into the same pipeline.">
      <button type="button" class="a-btn a-btn-primary" @click="startCreate"><Plus :size="12" /> New role</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="job in jobs" :key="job._id" class="a-card flex flex-col p-4" :class="job.active ? '' : 'opacity-60'">
        <div class="flex items-start justify-between gap-3">
          <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">{{ job.division }}</span>
          <StatusBadge :status="job.active ? 'approved' : 'archived'" size="sm" />
        </div>
        <h3 class="mt-2 text-[17px] font-medium tracking-[-0.025em]">{{ job.title }}</h3>
        <p class="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink/50">{{ job.summary }}</p>
        <div class="mt-3 flex flex-wrap gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/35">
          <span class="border border-ink/10 px-1.5 py-1">{{ job.location }}</span>
          <span class="border border-ink/10 px-1.5 py-1">{{ job.type }}</span>
          <span class="border border-ink/10 px-1.5 py-1">{{ job.level }}</span>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
          <span class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/30">Posted {{ format.date(job.postedAt) }}</span>
          <div class="flex items-center gap-1">
            <a :href="`${config.public.siteUrl}/careers/${job.slug}`" target="_blank" rel="noopener" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:border-ink/35 hover:text-ink" aria-label="View role"><ExternalLink :size="11" /></a>
            <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:border-ink/35 hover:text-ink" aria-label="Edit role" @click="startEdit(job)"><Pencil :size="11" /></button>
            <button type="button" class="flex size-7 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:border-signal hover:text-signal-deep" aria-label="Delete role" @click="deleting = job"><Trash2 :size="11" /></button>
          </div>
        </div>
        <button type="button" class="mt-2 h-7 border border-ink/10 font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/40 hover:border-ink/30 hover:text-ink" @click="toggleActive(job)">
          {{ job.active ? 'Hide from careers page' : 'Publish role' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><div v-for="i in 3" :key="i" class="h-52 a-skeleton" /></div>
    <EmptyState v-if="!loading && !jobs.length" title="No roles yet" text="Create the first role and publish it to the site." />

    <SlideOver :open="open" :title="editing ? 'Edit role' : 'New role'" :subtitle="editing ? editing.slug : 'Publish to careers'" @close="open = false">
      <div class="space-y-4 p-5">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="sm:col-span-2"><label class="a-label">Title</label><input v-model="form.title" class="a-input"></div>
          <div><label class="a-label">Division</label><SearchSelect v-model="form.division" :options="divisionOptions" /></div>
          <div><label class="a-label">Location</label><input v-model="form.location" class="a-input"></div>
          <div><label class="a-label">Type</label><SearchSelect v-model="form.type" :options="typeOptions" /></div>
          <div><label class="a-label">Level</label><input v-model="form.level" class="a-input"></div>
          <div><label class="a-label">Posted</label><input v-model="form.postedAt" type="date" class="a-input font-mono"></div>
          <div class="flex items-end"><ToggleSwitch v-model="form.active" label="Published" /></div>
        </div>
        <div><label class="a-label">Summary</label><textarea v-model="form.summary" rows="3" class="a-input" /></div>
        <div><label class="a-label">Responsibilities (one per line)</label><textarea v-model="form.responsibilities" rows="5" class="a-input font-mono text-[12px]" /></div>
        <div><label class="a-label">Requirements (one per line)</label><textarea v-model="form.requirements" rows="5" class="a-input font-mono text-[12px]" /></div>
        <div><label class="a-label">Nice to have (one per line)</label><textarea v-model="form.niceToHave" rows="3" class="a-input font-mono text-[12px]" /></div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="a-btn a-btn-ghost" @click="open = false">Cancel</button>
          <button type="button" class="a-btn a-btn-primary" :disabled="saving" @click="save">{{ saving ? 'Saving…' : (editing ? 'Save role' : 'Publish role') }}</button>
        </div>
      </template>
    </SlideOver>

    <ConfirmDialog :open="!!deleting" title="Delete this role?" :text="`“${deleting?.title}” and its public page will be removed. Applications stay in the database.`" confirm-label="Delete role" danger :loading="deleteLoading" @close="deleting = null" @confirm="remove" />
  </div>
</template>
