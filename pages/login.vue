<script setup lang="ts">
import { ArrowUpRight, Eye, EyeOff, Lock } from 'lucide-vue-next'

definePageMeta({ layout: false })
useHead({ title: 'Sign in — Vomtek Studio' })

const auth = useAuth()
const route = useRoute()
const config = useRuntimeConfig()
const media = useMedia()
const toast = useToast()

const email = ref('')
const password = ref('')
const show = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!email.value || !password.value) {
    error.value = 'Enter your email and password.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    toast.success('Signed in', 'Welcome back to Studio.')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect)
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    error.value = e?.data?.message || e?.message || 'Could not sign in.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
    <div class="relative hidden overflow-hidden bg-brand-deep text-bone lg:block">
      <div class="absolute inset-0 grid-bg-dark opacity-40" aria-hidden="true" style="background-image:linear-gradient(to right,rgba(242,239,230,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(242,239,230,.06) 1px,transparent 1px);background-size:64px 64px" />
      <img :src="media.url('electrician-meter', 1200)" alt="Electrician verifying a control enclosure" class="absolute inset-0 h-full w-full object-cover opacity-35 grayscale">
      <div class="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/85 to-brand/40" />

      <div class="relative flex h-full flex-col justify-between p-10">
        <div class="flex items-center gap-3">
          <span class="flex size-10 items-center justify-center rounded-2xl border border-bone/25 bg-bone/10 font-display text-[18px] font-semibold text-brand-soft">V</span>
          <div>
            <p class="text-[18px] font-semibold leading-none tracking-[-0.04em]">Vomtek</p>
            <p class="mt-1 font-mono text-[9.5px] uppercase tracking-[0.26em] text-bone/40">Studio / Internal</p>
          </div>
        </div>

        <div class="max-w-md">
          <p class="font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand-soft">Operations console</p>
          <h1 class="mt-4 text-[38px] font-medium leading-[1.02] tracking-[-0.045em]">Run the pipeline.<br><span class="font-display text-brand-soft">Keep the promise.</span></h1>
          <p class="mt-5 text-[13.5px] leading-relaxed text-bone/50">Quotes, field work, content and the website — one place to see what needs attention and act on it.</p>
        </div>

        <div class="flex items-center justify-between border-t border-bone/15 pt-4 font-mono text-[9.5px] uppercase tracking-[0.12em] text-bone/30">
          <span>Houston, Texas</span>
          <a :href="config.public.siteUrl" target="_blank" rel="noopener" class="flex items-center gap-1 hover:text-bone">vomtek.com <ArrowUpRight :size="10" /></a>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="flex size-9 items-center justify-center rounded-xl bg-brand-deep font-display font-semibold text-brand-soft">V</span>
          <div>
            <p class="text-[17px] font-semibold leading-none tracking-[-0.04em]">Vomtek Studio</p>
            <p class="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/35">Internal operations</p>
          </div>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink/45">
          <Lock :size="10" /> Restricted access
        </div>
        <h2 class="mt-5 text-[28px] font-medium tracking-[-0.04em]">Sign in</h2>
        <p class="mt-1.5 text-[12.5px] text-ink/45">Use the account your administrator created for you.</p>

        <form class="mt-7 space-y-4" novalidate @submit.prevent="submit">
          <div>
            <label for="email" class="a-label">Email</label>
            <input id="email" v-model="email" type="email" autocomplete="username" class="a-input" placeholder="you@vomtek.com" :disabled="loading">
          </div>
          <div>
            <label for="password" class="a-label">Password</label>
            <div class="relative">
              <input id="password" v-model="password" :type="show ? 'text' : 'password'" autocomplete="current-password" class="a-input pr-10" placeholder="••••••••••" :disabled="loading">
              <button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink" :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
                <component :is="show ? EyeOff : Eye" :size="14" />
              </button>
            </div>
          </div>

          <p v-if="error" class="border border-danger/30 bg-danger-soft px-3 py-2 font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-danger" role="alert">{{ error }}</p>

          <button type="submit" class="a-btn a-btn-primary h-10 w-full" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Enter Studio' }}
            <ArrowUpRight v-if="!loading" :size="13" />
          </button>
        </form>

        <p class="mt-8 border-t border-ink/10 pt-4 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.1em] text-ink/30">
          Sessions expire after 15 minutes of API access and refresh securely. Contact the owner if you need access.
        </p>
      </div>
    </div>
  </div>
</template>
