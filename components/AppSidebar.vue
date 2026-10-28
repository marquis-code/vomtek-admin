<script setup lang="ts">
import {
  LayoutDashboard, ChartNoAxesCombined, FileText, Inbox, UserRoundSearch,
  PanelsTopLeft, Briefcase, Images, Newspaper, Mail, Settings2, Users,
  ScrollText, ExternalLink, LogOut, ChevronsLeft, ChevronsRight, X,
} from 'lucide-vue-next'
import { navigation } from '~/lib/navigation'

const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
  counts?: { quotes: number, messages: number, applications: number }
}>()

const emit = defineEmits<{ toggle: [], close: [], navigate: [] }>()

const icons: Record<string, unknown> = {
  LayoutDashboard, ChartNoAxesCombined, FileText, Inbox, UserRoundSearch,
  PanelsTopLeft, Briefcase, Images, Newspaper, Mail, Settings2, Users, ScrollText,
}

const route = useRoute()
const auth = useAuth()
const { initials } = useFormat()
const config = useRuntimeConfig()

const allowed = computed(() => navigation.map(group => ({
  ...group,
  items: group.items.filter(item => !item.permission || item.permission.includes(auth.user.value?.role || '')),
})))

function isActive(to: string, exact?: boolean) {
  return exact ? route.path === to : route.path === to || route.path.startsWith(`${to}/`)
}

function badgeFor(to: string) {
  if (!props.counts) return 0
  if (to === '/quotes') return props.counts.quotes
  if (to === '/messages') return props.counts.messages
  if (to === '/applications') return props.counts.applications
  return 0
}

async function logout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-bone transition-[width,transform] duration-300 ease-[var(--ease-out-expo)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
    :class="[
      collapsed ? 'lg:w-[72px]' : 'lg:w-[248px]',
      mobileOpen ? 'w-[248px] translate-x-0' : 'w-[248px] -translate-x-full',
    ]"
  >
    <div class="flex h-14 shrink-0 items-center justify-between border-b border-bone/10 px-4" :class="collapsed ? 'lg:justify-center lg:px-0' : ''">
      <NuxtLink to="/" class="flex items-center gap-2.5" @click="emit('navigate')">
        <span class="flex size-8 shrink-0 items-center justify-center rounded-xl border border-bone/20 bg-bone/10 font-display text-[15px] font-semibold text-brand-soft">V</span>
        <span v-if="!collapsed" class="flex flex-col leading-none">
          <span class="text-[16px] font-semibold tracking-[-0.04em]">Vomtek</span>
          <span class="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-bone/40">Studio</span>
        </span>
      </NuxtLink>
      <button
        type="button"
        class="text-bone/40 hover:text-bone lg:hidden"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        <X :size="18" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-2.5 py-4">
      <div v-for="group in allowed" :key="group.label" class="mb-5">
        <p v-if="!collapsed" class="mb-1.5 px-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-brand-soft/45">{{ group.label }}</p>
        <NuxtLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="group relative mb-0.5 flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12.5px] transition-colors"
          :class="isActive(item.to, item.exact) ? 'bg-bone/[0.12] !text-white' : 'text-bone/60 hover:bg-bone/[0.06] hover:text-bone/90'"
          :title="collapsed ? item.label : undefined"
          @click="emit('navigate')"
        >
          <span
            v-if="isActive(item.to, item.exact)"
            class="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-brand-soft"
            aria-hidden="true"
          />
          <component :is="icons[item.icon]" :size="15" :stroke-width="1.6" class="shrink-0" />
          <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="!collapsed && badgeFor(item.to) > 0"
            class="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-soft px-1 font-mono text-[9.5px] text-brand-deep"
          >{{ badgeFor(item.to) }}</span>
        </NuxtLink>
      </div>
    </nav>

    <div class="shrink-0 border-t border-bone/10 p-2.5">
      <a
        :href="config.public.siteUrl"
        target="_blank"
        rel="noopener"
        class="mb-2 flex h-8 items-center gap-2 rounded-lg px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-bone/50 transition-colors hover:text-brand-soft"
        :class="collapsed ? 'lg:justify-center' : ''"
      >
        <ExternalLink :size="13" />
        <span v-if="!collapsed">View website</span>
      </a>

      <div class="flex items-center gap-2.5 rounded-xl bg-bone/[0.07] p-2" :class="collapsed ? 'lg:justify-center' : ''">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-[11px] font-semibold text-brand-deep">
          {{ initials(auth.user.value?.name) }}
        </span>
        <div v-if="!collapsed" class="min-w-0 flex-1">
          <p class="truncate text-[11.5px] leading-tight text-bone/85">{{ auth.user.value?.name }}</p>
          <p class="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone/35">{{ auth.user.value?.role }}</p>
        </div>
        <button
          v-if="!collapsed"
          type="button"
          class="text-bone/35 transition-colors hover:text-brand-soft"
          aria-label="Sign out"
          @click="logout"
        >
          <LogOut :size="13" />
        </button>
      </div>

      <button
        type="button"
        class="mt-2 hidden h-7 w-full items-center justify-center gap-2 border border-bone/10 font-mono text-[9.5px] uppercase tracking-[0.1em] text-bone/35 transition-colors hover:text-bone lg:flex"
        @click="emit('toggle')"
      >
        <component :is="collapsed ? ChevronsRight : ChevronsLeft" :size="12" />
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </aside>
</template>
