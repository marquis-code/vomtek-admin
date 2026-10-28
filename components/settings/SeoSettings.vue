<script setup lang="ts">
import type { SiteSettings } from '~/types/settings'
const model = defineModel<SiteSettings>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <FormSection title="Search & social" index="01" description="Defaults used when a page does not provide its own metadata.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">Title suffix</label><input v-model="model.seo.titleSuffix" class="a-input"></div>
        <div><label class="a-label">Twitter handle</label><input v-model="model.seo.twitterHandle" class="a-input" placeholder="@vomtek"></div>
        <div class="sm:col-span-2"><label class="a-label">Default title</label><input v-model="model.seo.defaultTitle" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Default description</label><textarea v-model="model.seo.defaultDescription" rows="3" class="a-input" /></div>
      </div>
      <div class="mt-3">
        <ImagePicker v-model="model.seo.ogImage" label="Open Graph image" />
      </div>
    </FormSection>

    <FormSection title="Integrations" index="02" description="Optional. Leave blank to disable. No third-party scripts load without an ID.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">GA4 measurement ID</label><input v-model="model.integrations.ga4Id" class="a-input font-mono text-[12px]" placeholder="G-XXXXXXX"></div>
        <div><label class="a-label">Meta pixel ID</label><input v-model="model.integrations.metaPixelId" class="a-input font-mono text-[12px]"></div>
        <div><label class="a-label">LinkedIn partner ID</label><input v-model="model.integrations.linkedinPartnerId" class="a-input font-mono text-[12px]"></div>
        <div><label class="a-label">Calendar link</label><input v-model="model.integrations.calendarUrl" class="a-input font-mono text-[12px]" placeholder="https://cal.com/…"></div>
        <div class="sm:col-span-2"><label class="a-label">Webhook URL</label><input v-model="model.integrations.webhookUrl" class="a-input font-mono text-[12px]" placeholder="https://hooks…"></div>
      </div>
    </FormSection>
  </div>
</template>
