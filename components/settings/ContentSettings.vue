<script setup lang="ts">
import type { SiteSettings } from '~/types/settings'
const model = defineModel<SiteSettings>({ required: true })

function addSlide() {
  model.value.carousel.items.push({ image: 'panel-line', alt: '', title: '', caption: '', label: 'Assembly', credit: '' })
}
function removeSlide(index: number) {
  model.value.carousel.items.splice(index, 1)
}
function moveSlide(index: number, direction: number) {
  const target = index + direction
  if (target < 0 || target >= model.value.carousel.items.length) return
  const [item] = model.value.carousel.items.splice(index, 1)
  if (item) model.value.carousel.items.splice(target, 0, item)
}
function addPlan() {
  model.value.plans.push({ slug: `plan-${model.value.plans.length + 1}`, name: '', price: '', period: 'per site / year', description: '', features: [], featured: false, ctaLabel: 'Request assessment' })
}
function removePlan(index: number) {
  model.value.plans.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <FormSection title="Photo carousel" index="01" description="The “inside the work” section on the homepage. Use real photography and honest captions.">
      <ToggleSwitch v-model="model.carousel.enabled" label="Show carousel" />
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">Eyebrow</label><input v-model="model.carousel.eyebrow" class="a-input"></div>
        <div><label class="a-label">Title</label><input v-model="model.carousel.title" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Subtitle</label><textarea v-model="model.carousel.subtitle" rows="2" class="a-input" /></div>
      </div>

      <div class="mt-4 space-y-3">
        <div v-for="(item, i) in model.carousel.items" :key="i" class="border border-ink/12 bg-paper/40 p-3">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">Slide {{ i + 1 }}</span>
            <div class="flex gap-1 text-ink/35">
              <button type="button" class="px-1 hover:text-ink" @click="moveSlide(i, -1)">↑</button>
              <button type="button" class="px-1 hover:text-ink" @click="moveSlide(i, 1)">↓</button>
              <button type="button" class="px-1 hover:text-signal-deep" @click="removeSlide(i)">×</button>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-[180px_1fr]">
            <ImagePicker v-model="item.image" />
            <div class="grid gap-2">
              <div class="grid gap-2 sm:grid-cols-2">
                <div><label class="a-label">Label</label><input v-model="item.label" class="a-input"></div>
                <div><label class="a-label">Title</label><input v-model="item.title" class="a-input"></div>
              </div>
              <div><label class="a-label">Caption</label><input v-model="item.caption" class="a-input"></div>
              <div><label class="a-label">Alt text (accessibility)</label><input v-model="item.alt" class="a-input"></div>
              <div><label class="a-label">Credit</label><input v-model="item.credit" class="a-input"></div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="a-btn a-btn-ghost mt-3" @click="addSlide">+ Add slide</button>
    </FormSection>

    <FormSection title="Uptime Care plans" index="02" description="The revenue page tiers. Pricing should be reviewed with the owner before publishing.">
      <div class="space-y-3">
        <div v-for="(plan, i) in model.plans" :key="i" class="border border-ink/12 bg-paper/40 p-3" :class="plan.featured ? 'border-signal/40' : ''">
          <div class="mb-2 flex items-center justify-between">
            <span class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">{{ plan.name || `Plan ${i + 1}` }}</span>
            <div class="flex items-center gap-3">
              <ToggleSwitch v-model="plan.featured" label="Featured" />
              <button type="button" class="text-ink/35 hover:text-signal-deep" @click="removePlan(i)">×</button>
            </div>
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            <div><label class="a-label">Name</label><input v-model="plan.name" class="a-input"></div>
            <div><label class="a-label">Price</label><input v-model="plan.price" class="a-input"></div>
            <div><label class="a-label">Period</label><input v-model="plan.period" class="a-input"></div>
            <div><label class="a-label">CTA label</label><input v-model="plan.ctaLabel" class="a-input"></div>
            <div class="sm:col-span-2"><label class="a-label">Description</label><textarea v-model="plan.description" rows="2" class="a-input" /></div>
            <div class="sm:col-span-2">
              <label class="a-label">Features (one per line)</label>
              <textarea :value="plan.features.join('\n')" rows="5" class="a-input font-mono text-[12px]" @input="plan.features = ($event.target as HTMLTextAreaElement).value.split('\n').map(f => f.trim()).filter(Boolean)" />
            </div>
          </div>
        </div>
      </div>
      <button type="button" class="a-btn a-btn-ghost mt-3" @click="addPlan">+ Add plan</button>
    </FormSection>
  </div>
</template>
