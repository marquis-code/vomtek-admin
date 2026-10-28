<script setup lang="ts">
import type { SiteSettings } from '~/types/settings'
const model = defineModel<SiteSettings>({ required: true })

const projectTypes = [
  { value: 'control-panel', label: 'Control panel' },
  { value: 'retrofit', label: 'Retrofit / repair' },
  { value: 'pcb', label: 'PCB design' },
  { value: 'harness', label: 'Wire harness' },
  { value: 'motor', label: 'Motor service' },
  { value: 'field', label: 'Field service' },
  { value: 'multiple', label: 'Multiple scopes' },
  { value: 'other', label: 'Other' },
]

const divisionNames: Record<string, string> = {
  electrical: 'Electrical',
  instrumentation: 'Instrumentation',
  automotive: 'Automotive',
  mechanical: 'Mechanical',
  fabrication: 'Fabrication',
  'real-estate': 'Facilities',
}
const serviceNames: Record<string, string> = {
  'control-panels': 'Control panels',
  'pcb-design': 'PCB design',
  'wire-harness': 'Wire harness',
  'motor-rewinding': 'Motor rewinding',
  'motor-testing': 'Motor testing',
  'panel-repair': 'Panel repair',
  'field-service': 'Field service',
}

function addRule() {
  model.value.quote.leadTimeRules.push({ projectType: 'control-panel', maxQuantity: 999, leadTime: 'To be confirmed' })
}
function removeRule(index: number) {
  model.value.quote.leadTimeRules.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <FormSection title="Quote engine" index="01" description="Lead times shown instantly to the customer. Rules are evaluated by project type and quantity, lowest matching max quantity wins.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">Default lead time</label><input v-model="model.quote.defaultLeadTime" class="a-input"></div>
        <div><label class="a-label">Review SLA (hours)</label><input v-model.number="model.quote.reviewSlaHours" type="number" min="1" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Auto-reply subject</label><input v-model="model.quote.autoReplySubject" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Auto-reply body</label><textarea v-model="model.quote.autoReplyBody" rows="3" class="a-input" /></div>
      </div>

      <div class="mt-4">
        <div class="mb-1.5 grid grid-cols-[1fr_100px_1fr_28px] gap-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/35">
          <span>Project type</span><span>Up to qty</span><span>Lead time</span><span />
        </div>
        <div v-for="(rule, i) in model.quote.leadTimeRules" :key="i" class="mb-1.5 grid grid-cols-[1fr_100px_1fr_28px] items-center gap-2">
          <SearchSelect v-model="rule.projectType" :options="projectTypes" compact searchable />
          <input v-model.number="rule.maxQuantity" type="number" min="1" class="a-input h-8 font-mono text-[11.5px]">
          <input v-model="rule.leadTime" class="a-input h-8 text-[11.5px]">
          <button type="button" class="text-ink/30 hover:text-signal-deep" @click="removeRule(i)">×</button>
        </div>
        <button type="button" class="a-btn a-btn-ghost mt-1" @click="addRule">+ Add rule</button>
      </div>
    </FormSection>

    <FormSection title="Notifications" index="02" description="Internal routing for new business. Customer auto-replies use the template above.">
      <ToggleSwitch v-model="model.notifications.notifyOnQuote" label="Notify on new quote" />
      <ToggleSwitch v-model="model.notifications.notifyOnContact" label="Notify on new message" />
      <ToggleSwitch v-model="model.notifications.notifyOnApplication" label="Notify on new application" />
      <ToggleSwitch v-model="model.notifications.sendCustomerAck" label="Send customer acknowledgement" description="Requires a configured mail transport in production." />
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="sm:col-span-2"><label class="a-label">Recipients</label><TagInput v-model="model.notifications.recipients" /></div>
        <div><label class="a-label">From name</label><input v-model="model.notifications.fromName" class="a-input"></div>
        <div><label class="a-label">From email</label><input v-model="model.notifications.fromEmail" class="a-input"></div>
      </div>
    </FormSection>

    <FormSection title="Divisions" index="03" description="Hide a division from navigation or override its public headline and lead. Full body copy lives in the site code.">
      <div class="space-y-2">
        <div v-for="(division, slug) in model.divisions" :key="slug" class="border border-ink/12 bg-paper/40 p-3">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/55">{{ divisionNames[slug] || slug }}</p>
            <ToggleSwitch v-model="division.enabled" label="Visible" />
          </div>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <div><label class="a-label">Headline override</label><input v-model="division.headline" class="a-input" placeholder="Leave blank to use site default"></div>
            <div><label class="a-label">Lead override</label><input v-model="division.lead" class="a-input" placeholder="Leave blank to use site default"></div>
          </div>
        </div>
      </div>
    </FormSection>

    <FormSection title="Capabilities" index="04" description="Toggle a capability off to remove it from navigation, lists and detail pages.">
      <div class="space-y-2">
        <div v-for="(service, slug) in model.services" :key="slug" class="flex flex-wrap items-center justify-between gap-3 border border-ink/12 bg-paper/40 px-3 py-2">
          <p class="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/55">{{ serviceNames[slug] || slug }}</p>
          <div class="flex flex-1 items-center justify-end gap-4">
            <input v-model="service.lead" class="a-input h-8 max-w-md text-[12px]" placeholder="Lead override">
            <ToggleSwitch v-model="service.enabled" label="Visible" />
          </div>
        </div>
      </div>
    </FormSection>
  </div>
</template>
