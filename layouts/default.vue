<script setup lang="ts">
const auth = useAuth()
const api = useApi()
const route = useRoute()

const collapsed = useState('admin-sidebar-collapsed', () => false)
const mobileOpen = ref(false)
const commandOpen = useState('admin-command-open', () => false)
const counts = ref({ quotes: 0, messages: 0, applications: 0 })

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    commandOpen.value = !commandOpen.value
  }
  if (event.key === 'Escape') {
    commandOpen.value = false
    mobileOpen.value = false
  }
}

async function loadCounts() {
  try {
    const overview = await api.overview(30)
    counts.value = {
      quotes: overview.quotes.needsAttention,
      messages: overview.messages.unread,
      applications: overview.applications.new,
    }
  }
  catch { /* counts are non-critical */ }
}

onMounted(() => {
  collapsed.value = localStorage.getItem('vt_admin_collapsed') === '1'
  window.addEventListener('keydown', onKeydown)
  if (auth.user.value) void loadCounts()
})

watch(collapsed, (value) => {
  if (import.meta.client) localStorage.setItem('vt_admin_collapsed', value ? '1' : '0')
})

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  commandOpen.value = false
  void loadCounts()
})

onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="flex min-h-screen">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden" @click="mobileOpen = false" />
    </Transition>

    <AppSidebar
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      :counts="counts"
      @toggle="collapsed = !collapsed"
      @close="mobileOpen = false"
      @navigate="mobileOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppTopbar :attention="counts.quotes" @menu="mobileOpen = true" @search="commandOpen = true" />

      <div v-if="auth.user.value?.mustChangePassword" class="flex flex-wrap items-center justify-between gap-3 border-b border-signal/30 bg-signal/10 px-4 py-2.5 md:px-6">
        <p class="font-mono text-[9px] uppercase tracking-[0.08em] text-signal-deep">You are signed in with a temporary password.</p>
        <NuxtLink to="/account" class="font-mono text-[8.5px] uppercase tracking-[0.1em] underline underline-offset-4">Set a new password</NuxtLink>
      </div>

      <main class="flex-1 px-4 py-5 md:px-6 md:py-6">
        <NuxtPage />
      </main>

      <footer class="flex items-center justify-between border-t border-ink/10 px-4 py-3 font-mono text-[7.5px] uppercase tracking-[0.12em] text-ink/30 md:px-6">
        <span>Vomtek Studio · Internal</span>
        <span>v1.1 · {{ new Date().getFullYear() }}</span>
      </footer>
    </div>

    <CommandPalette :open="commandOpen" @close="commandOpen = false" />
  </div>
</template>
