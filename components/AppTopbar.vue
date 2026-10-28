<script setup lang="ts">
import { Menu, Search, Bell, ExternalLink, ChevronDown, UserRound, LogOut, Settings2 } from 'lucide-vue-next'
import { navigation, pageTitles } from '~/lib/navigation'

defineProps<{ attention?: number }>()
const emit = defineEmits<{ menu: [], search: [] }>()

const route = useRoute()
const auth = useAuth()
const config = useRuntimeConfig()
const menuOpen = ref(false)
const { initials } = useFormat()

const title = computed(() => {
  const path = route.path
  if (pageTitles[path]) return pageTitles[path]
  const base = `/${path.split('/')[1] || ''}`
  if (pageTitles[base]) return pageTitles[base]
  return 'Studio'
})

const group = computed(() => navigation.find(g => g.items.some(i => route.path === i.to || route.path.startsWith(`${i.to}/`)))?.label || 'Vomtek')

async function logout() {
  menuOpen.value = false
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-ink/12 bg-paper/95 px-4 backdrop-blur md:px-6">
    <div class="flex min-w-0 items-center gap-3">
      <button type="button" class="flex size-8 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:border-brand hover:text-brand lg:hidden" aria-label="Open navigation" @click="emit('menu')">
        <Menu :size="16" />
      </button>
      <div class="min-w-0">
        <p class="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink/35">{{ group }}</p>
        <h1 class="truncate text-[15px] font-medium tracking-[-0.02em]">{{ title }}</h1>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="hidden h-9 w-56 items-center gap-2 rounded-full border border-ink/15 bg-surface px-3 text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink/35 transition-colors hover:border-brand/40 hover:text-ink/60 md:flex"
        @click="emit('search')"
      >
        <Search :size="12" />
        <span class="flex-1">Search or jump to…</span>
        <kbd class="border border-ink/15 px-1 py-0.5 text-[9.5px]">⌘K</kbd>
      </button>

      <NuxtLink
        to="/quotes?status=received"
        class="relative flex size-8 items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-brand hover:text-brand"
        aria-label="Open quote pipeline"
      >
        <Bell :size="14" />
        <span v-if="attention" class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-signal font-mono text-[9px] text-white">{{ attention }}</span>
      </NuxtLink>

      <a
        :href="config.public.siteUrl"
        target="_blank"
        rel="noopener"
        class="hidden size-8 items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-brand hover:text-brand sm:flex"
        aria-label="View website"
      >
        <ExternalLink :size="13" />
      </a>

      <div class="relative">
        <button
          type="button"
          class="flex h-9 items-center gap-2 rounded-full border border-ink/15 pl-1 pr-3 transition-colors hover:border-brand/40"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <span class="flex size-7 items-center justify-center rounded-full bg-brand-deep font-display text-[10.5px] font-semibold text-brand-soft">{{ initials(auth.user.value?.name) }}</span>
          <span class="hidden max-w-24 truncate text-[12px] text-ink/65 sm:block">{{ auth.user.value?.name }}</span>
          <ChevronDown :size="11" class="text-ink/35" />
        </button>

        <Transition
          enter-active-class="transition duration-150"
          enter-from-class="opacity-0 translate-y-1"
          leave-active-class="transition duration-100"
          leave-to-class="opacity-0"
        >
          <div v-if="menuOpen" class="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-ink/15 bg-surface p-1.5 shadow-[0_20px_50px_-20px_rgba(10,12,11,.35)]">
            <div class="border-b border-ink/10 px-2 py-2">
              <p class="truncate text-[11.5px] font-medium">{{ auth.user.value?.name }}</p>
              <p class="truncate font-mono text-[9.5px] text-ink/40">{{ auth.user.value?.email }}</p>
            </div>
            <NuxtLink to="/account" class="mt-1 flex items-center gap-2 px-2 py-2 text-[11.5px] text-ink/65 hover:bg-paper" @click="menuOpen = false">
              <UserRound :size="13" /> Account & password
            </NuxtLink>
            <NuxtLink v-if="['owner', 'admin'].includes(auth.user.value?.role || '')" to="/settings" class="flex items-center gap-2 px-2 py-2 text-[11.5px] text-ink/65 hover:bg-paper" @click="menuOpen = false">
              <Settings2 :size="13" /> Site settings
            </NuxtLink>
            <button type="button" class="flex w-full items-center gap-2 px-2 py-2 text-left text-[11.5px] text-signal-deep hover:bg-paper" @click="logout">
              <LogOut :size="13" /> Sign out
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
