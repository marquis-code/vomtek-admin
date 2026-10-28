<script setup lang="ts">
import { Save, RotateCcw, ExternalLink, Check, CircleAlert, Braces } from 'lucide-vue-next'
import type { SiteSettings } from '~/types/settings'

useHead({ title: 'Site settings — Vomtek Studio' })

const api = useApi()
const toast = useToast()
const config = useRuntimeConfig()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const tab = ref<'company' | 'homepage' | 'content' | 'operations' | 'seo' | 'advanced'>('company')
const settings = ref<SiteSettings | null>(null)
const snapshot = ref('')
const confirmReset = ref(false)
const resetting = ref(false)
const raw = ref('')
const rawError = ref('')

const tabs = [
  { key: 'company', label: 'Company' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'content', label: 'Carousel & plans' },
  { key: 'operations', label: 'Quote & notifications' },
  { key: 'seo', label: 'SEO & integrations' },
  { key: 'advanced', label: 'Advanced JSON' },
] as const

const dirty = computed(() => !!settings.value && JSON.stringify(settings.value) !== snapshot.value)

async function load() {
  loading.value = true
  error.value = ''
  try {
    settings.value = await api.settings.get()
    snapshot.value = JSON.stringify(settings.value)
    raw.value = JSON.stringify(settings.value, null, 2)
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

async function save() {
  if (!settings.value) return
  saving.value = true
  try {
    settings.value = await api.settings.update(settings.value) as SiteSettings
    snapshot.value = JSON.stringify(settings.value)
    raw.value = JSON.stringify(settings.value, null, 2)
    toast.success('Settings saved', 'The website will reflect the change on the next load.')
  }
  catch (err: unknown) { toast.error('Could not save settings', (err as Error).message) }
  finally { saving.value = false }
}

function discard() {
  if (!settings.value) return
  settings.value = JSON.parse(snapshot.value) as SiteSettings
  raw.value = JSON.stringify(settings.value, null, 2)
  toast.info('Changes discarded')
}

async function resetAll() {
  resetting.value = true
  try {
    settings.value = await api.settings.reset() as SiteSettings
    snapshot.value = JSON.stringify(settings.value)
    raw.value = JSON.stringify(settings.value, null, 2)
    confirmReset.value = false
    toast.success('Settings reset to defaults')
  }
  catch (err: unknown) { toast.error('Could not reset', (err as Error).message) }
  finally { resetting.value = false }
}

function applyRaw() {
  rawError.value = ''
  try {
    const parsed = JSON.parse(raw.value) as SiteSettings
    settings.value = parsed
    toast.info('JSON applied', 'Review the tabs, then save.')
  }
  catch (err: unknown) { rawError.value = (err as Error).message }
}

onMounted(load)
</script>

<template>
  <div class="pb-20">
    <PageHeader eyebrow="System" title="Site settings" description="The site is configuration-driven. Change copy, photography, offers, lead times and routing without a deploy.">
      <a :href="config.public.siteUrl" target="_blank" rel="noopener" class="a-btn a-btn-ghost"><ExternalLink :size="12" /> View site</a>
      <button type="button" class="a-btn a-btn-ghost" :disabled="resetting" @click="confirmReset = true"><RotateCcw :size="12" /> Reset</button>
      <button type="button" class="a-btn a-btn-primary" :disabled="saving || !dirty" @click="save"><Save :size="12" /> {{ saving ? 'Saving…' : 'Save changes' }}</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div v-if="loading" class="space-y-4"><div class="h-10 a-skeleton" /><div class="h-96 a-skeleton" /></div>

    <template v-else-if="settings">
      <div class="mb-4 flex flex-wrap gap-1 overflow-x-auto border-b border-ink/12">
        <button v-for="item in tabs" :key="item.key" type="button" class="a-tab" :class="tab === item.key ? 'a-tab-active' : ''" @click="tab = item.key">
          {{ item.label }}
        </button>
        <span v-if="dirty" class="ml-auto flex items-center gap-1.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">
          <span class="size-1.5 animate-pulse rounded-full bg-signal" /> Unsaved changes
        </span>
      </div>

      <SettingsBrandSettings v-if="tab === 'company'" v-model="settings" />
      <SettingsHomepageSettings v-else-if="tab === 'homepage'" v-model="settings" />
      <SettingsContentSettings v-else-if="tab === 'content'" v-model="settings" />
      <SettingsOperationsSettings v-else-if="tab === 'operations'" v-model="settings" />
      <SettingsSeoSettings v-else-if="tab === 'seo'" v-model="settings" />

      <div v-else class="space-y-4">
        <FormSection title="Advanced settings" index="01" description="Power-user access to the whole configuration. Apply moves it into the form; Save persists it.">
          <div class="mb-2 flex items-center justify-between">
            <p class="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35"><Braces :size="11" /> site-settings.json</p>
            <button type="button" class="a-btn a-btn-ghost" @click="applyRaw">Apply JSON</button>
          </div>
          <textarea v-model="raw" rows="26" class="a-input font-mono text-[11.5px] leading-relaxed" spellcheck="false" />
          <p v-if="rawError" class="mt-2 font-mono text-[10px] uppercase tracking-[0.06em] text-signal-deep">{{ rawError }}</p>
        </FormSection>
      </div>
    </template>

    <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-3 opacity-0" leave-active-class="transition duration-150" leave-to-class="translate-y-3 opacity-0">
      <div v-if="settings && dirty" class="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 border border-ink/20 bg-ink px-3 py-2 text-bone shadow-[0_16px_50px_-20px_rgba(10,12,11,.6)]">
        <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone/50">Unsaved changes</span>
        <button type="button" class="a-btn a-btn-ghost !h-7 !border-bone/20 !text-bone/60 hover:!text-bone" @click="discard">Discard</button>
        <button type="button" class="a-btn a-btn-signal !h-7" :disabled="saving" @click="save"><Check :size="11" /> Save</button>
      </div>
    </Transition>

    <ConfirmDialog :open="confirmReset" title="Reset all settings?" text="Every section returns to the shipped defaults. This is reversible only by re-entering your changes." confirm-label="Reset everything" danger :loading="resetting" @close="confirmReset = false" @confirm="resetAll" />
  </div>
</template>
