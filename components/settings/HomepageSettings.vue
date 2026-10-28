<script setup lang="ts">
import type { SiteSettings } from '~/types/settings'
const model = defineModel<SiteSettings>({ required: true })

function addStat() {
  model.value.stats.push({ value: '', label: '', note: '' })
}
function removeStat(index: number) {
  model.value.stats.splice(index, 1)
}
function addHeroSlide() {
  model.value.hero.slides.push({
    image: 'panel-line',
    alt: '',
    label: `0${model.value.hero.slides.length + 1} / New`,
    kicker: 'Panel build',
    title: '',
    description: '',
    emphasis: 'hold the line.',
  })
}
function removeHeroSlide(index: number) {
  model.value.hero.slides.splice(index, 1)
}
const sectionLabels: Record<string, string> = {
  carousel: 'Inside the work (photo carousel)',
  divisions: 'Divisions explorer',
  capabilities: 'Capabilities list',
  panelIndex: 'Panel index',
  process: 'Five-stage process',
  principles: 'Why Vomtek principles',
  foundation: 'Des Foundation band',
  insights: 'Field notes',
  catalog: 'Standard systems',
  industries: 'Industries',
  plans: 'Uptime Care plans',
}
const featureLabels: Record<string, string> = {
  foundation: 'Des Foundation page & nav',
  careers: 'Careers',
  automotive: 'Automotive division',
  facilities: 'Facilities division',
  catalog: 'Standard systems page',
  tracker: 'Customer project tracker',
  newsletter: 'Newsletter signups',
  mobileCta: 'Mobile sticky CTA',
  whatsapp: 'WhatsApp floating chat',
  consult: 'Consultation dock',
  quotes: 'Quote configurator',
  plans: 'Uptime Care plans',
}
</script>

<template>
  <div class="space-y-4">
    <FormSection title="Hero" index="01" description="The first promise a buyer reads. The emphasis phrase is the last line of the headline; keep it short.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">Eyebrow</label><input v-model="model.hero.eyebrow" class="a-input"></div>
        <div><label class="a-label">Location</label><input v-model="model.hero.location" class="a-input"></div>
        <div><label class="a-label">Headline — line 1</label><input v-model="model.hero.titleLine1" class="a-input"></div>
        <div><label class="a-label">Headline — line 2 prefix</label><input v-model="model.hero.titleLine2" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Emphasis phrase</label><input v-model="model.hero.emphasis" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Subtitle</label><textarea v-model="model.hero.subtitle" rows="3" class="a-input" /></div>
        <div><label class="a-label">Primary CTA label</label><input v-model="model.hero.primaryLabel" class="a-input"></div>
        <div><label class="a-label">Primary CTA URL</label><input v-model="model.hero.primaryHref" class="a-input font-mono text-[12px]"></div>
        <div><label class="a-label">Secondary CTA label</label><input v-model="model.hero.secondaryLabel" class="a-input"></div>
        <div><label class="a-label">Secondary CTA URL</label><input v-model="model.hero.secondaryHref" class="a-input font-mono text-[12px]"></div>
        <div class="sm:col-span-2"><label class="a-label">Trust badges</label><TagInput v-model="model.hero.badges" /></div>
      </div>
    </FormSection>


    <FormSection title="Hero story slides" index="02" description="Each slide changes the headline emphasis, description and photograph together. Keep the language plain and customer-facing.">
      <div class="space-y-3">
        <div v-for="(slide, i) in model.hero.slides" :key="i" class="border border-ink/12 bg-paper/40 p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-mono text-[8px] uppercase tracking-[0.1em] text-signal-deep">Slide {{ i + 1 }}</span>
            <button type="button" class="text-ink/35 hover:text-danger" @click="removeHeroSlide(i)">×</button>
          </div>
          <div class="grid gap-3 sm:grid-cols-[170px_1fr]">
            <ImagePicker v-model="slide.image" />
            <div class="grid gap-2">
              <div class="grid gap-2 sm:grid-cols-2">
                <div><label class="a-label">Label</label><input v-model="slide.label" class="a-input" placeholder="01 / Build"></div>
                <div><label class="a-label">Kicker</label><input v-model="slide.kicker" class="a-input" placeholder="Panel build"></div>
              </div>
              <div><label class="a-label">Image alt text</label><input v-model="slide.alt" class="a-input"></div>
              <div><label class="a-label">Image title</label><input v-model="slide.title" class="a-input" placeholder="Built to hold the line."></div>
              <div><label class="a-label">Headline emphasis</label><input v-model="slide.emphasis" class="a-input" placeholder="hold the line."></div>
              <div><label class="a-label">Description</label><textarea v-model="slide.description" rows="2" class="a-input" /></div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="a-btn a-btn-ghost mt-3" @click="addHeroSlide">+ Add hero slide</button>
    </FormSection>

    <FormSection title="Proof numbers" index="03" description="Four short proof points below the manifesto. Keep them factual.">
      <div class="space-y-2">
        <div v-for="(stat, i) in model.stats" :key="i" class="grid grid-cols-[80px_1fr_1fr_28px] items-center gap-2">
          <input v-model="stat.value" class="a-input font-mono text-[12px]" placeholder="06">
          <input v-model="stat.label" class="a-input text-[12px]" placeholder="Divisions">
          <input v-model="stat.note" class="a-input text-[12px]" placeholder="One accountable team">
          <button type="button" class="flex size-7 items-center justify-center text-ink/30 hover:text-signal-deep" aria-label="Remove" @click="removeStat(i)">×</button>
        </div>
      </div>
      <button type="button" class="a-btn a-btn-ghost mt-2" @click="addStat">+ Add proof point</button>
    </FormSection>

    <FormSection title="Homepage sections" index="04" description="Show or hide blocks without touching code.">
      <div class="grid gap-x-6 sm:grid-cols-2">
        <ToggleSwitch v-for="(value, key) in model.sections" :key="key" v-model="model.sections[key]" :label="sectionLabels[key] || key" />
      </div>
    </FormSection>

    <FormSection title="Site features" index="05" description="Global switches for pages, nav links and conversion elements.">
      <div class="grid gap-x-6 sm:grid-cols-2">
        <ToggleSwitch v-for="(value, key) in model.features" :key="key" v-model="model.features[key]" :label="featureLabels[key] || key" />
      </div>
    </FormSection>
  </div>
</template>
