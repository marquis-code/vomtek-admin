<script setup lang="ts">
import type { SiteSettings } from '~/types/settings'
const model = defineModel<SiteSettings>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <FormSection title="Company" index="01" description="Canonical business details used across the website, metadata and customer emails.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">Name</label><input v-model="model.company.name" class="a-input"></div>
        <div><label class="a-label">Legal name</label><input v-model="model.company.legalName" class="a-input"></div>
        <div><label class="a-label">Tagline</label><input v-model="model.company.tagline" class="a-input"></div>
        <div><label class="a-label">Short description</label><input v-model="model.company.description" class="a-input"></div>
        <div><label class="a-label">Phone</label><input v-model="model.company.phone" class="a-input"></div>
        <div><label class="a-label">Phone link</label><input v-model="model.company.phoneHref" class="a-input font-mono text-[12px]"></div>
        <div><label class="a-label">Email</label><input v-model="model.company.email" type="email" class="a-input"></div>
        <div><label class="a-label">Hours</label><input v-model="model.company.hours" class="a-input"></div>
        <div><label class="a-label">Service area</label><input v-model="model.company.serviceArea" class="a-input"></div>
        <div><label class="a-label">Coordinates</label><input v-model="model.company.coordinates" class="a-input font-mono text-[12px]"></div>
        <div class="sm:col-span-2"><label class="a-label">Street address</label><input v-model="model.company.address.street" class="a-input"></div>
        <div><label class="a-label">City</label><input v-model="model.company.address.city" class="a-input"></div>
        <div><label class="a-label">State</label><input v-model="model.company.address.state" class="a-input"></div>
        <div><label class="a-label">Postal code</label><input v-model="model.company.address.postalCode" class="a-input"></div>
        <div><label class="a-label">Country</label><input v-model="model.company.address.country" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Full address (display)</label><input v-model="model.company.address.full" class="a-input"></div>
        <div class="sm:col-span-2"><label class="a-label">Google Maps URL</label><input v-model="model.company.address.maps" class="a-input font-mono text-[12px]"></div>
      </div>
    </FormSection>

    <FormSection title="Social profiles" index="02" description="Leave blank to hide a link. Only add profiles that are actively maintained.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div><label class="a-label">LinkedIn</label><input v-model="model.socials.linkedin" class="a-input font-mono text-[12px]" placeholder="https://"></div>
        <div><label class="a-label">Facebook</label><input v-model="model.socials.facebook" class="a-input font-mono text-[12px]" placeholder="https://"></div>
        <div><label class="a-label">Instagram</label><input v-model="model.socials.instagram" class="a-input font-mono text-[12px]" placeholder="https://"></div>
        <div><label class="a-label">YouTube</label><input v-model="model.socials.youtube" class="a-input font-mono text-[12px]" placeholder="https://"></div>
        <div><label class="a-label">X / Twitter</label><input v-model="model.socials.x" class="a-input font-mono text-[12px]" placeholder="https://"></div>
      </div>
    </FormSection>

    <FormSection title="Announcement bar" index="03" description="A single strip above the navigation. Use it for capacity, lead times or an event — then turn it off.">
      <ToggleSwitch v-model="model.announcement.enabled" label="Show announcement bar" />
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="sm:col-span-2"><label class="a-label">Message</label><input v-model="model.announcement.text" class="a-input"></div>
        <div><label class="a-label">Link label</label><input v-model="model.announcement.linkLabel" class="a-input"></div>
        <div><label class="a-label">Link URL</label><input v-model="model.announcement.linkUrl" class="a-input font-mono text-[12px]"></div>
      </div>
      <div class="mt-3 border border-ink/10 bg-ink p-2.5 text-bone">
        <p class="font-mono text-[9px] uppercase tracking-[0.14em] text-bone/35">Preview</p>
        <p class="mt-1 flex items-center justify-between gap-3 text-[11.5px]">
          <span>{{ model.announcement.text }}</span>
          <span class="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.08em] text-signal">{{ model.announcement.linkLabel }} →</span>
        </p>
      </div>
    </FormSection>
  </div>
</template>
