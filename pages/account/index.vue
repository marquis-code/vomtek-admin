<script setup lang="ts">
import { KeyRound, ShieldCheck, LogOut } from 'lucide-vue-next'

useHead({ title: 'Account — Vomtek Studio' })

const auth = useAuth()
const toast = useToast()
const format = useFormat()

const current = ref('')
const next = ref('')
const confirm = ref('')
const saving = ref(false)

async function changePassword() {
  if (next.value.length < 10) { toast.error('Password too short', 'Use at least 10 characters.'); return }
  if (next.value !== confirm.value) { toast.error('Passwords do not match'); return }
  saving.value = true
  try {
    await auth.changePassword(current.value, next.value)
    toast.success('Password changed', 'Use it the next time you sign in.')
    current.value = ''; next.value = ''; confirm.value = ''
  }
  catch (err: unknown) { toast.error('Could not change password', (err as Error).message) }
  finally { saving.value = false }
}

async function logout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader eyebrow="Account" title="Your account" description="Profile, security and session controls." />

    <div class="grid gap-4 md:grid-cols-2">
      <div class="a-card p-5">
        <div class="flex items-center gap-3">
          <span class="flex size-12 items-center justify-center rounded-full bg-ink font-mono text-[13px] text-bone">{{ format.initials(auth.user.value?.name) }}</span>
          <div>
            <p class="text-[16px] font-medium">{{ auth.user.value?.name }}</p>
            <p class="font-mono text-[10.5px] text-ink/40">{{ auth.user.value?.email }}</p>
          </div>
        </div>
        <div class="mt-5 space-y-2 border-t border-ink/10 pt-4">
          <div class="flex justify-between"><span class="text-[12px] text-ink/45">Role</span><span class="font-mono text-[10.5px] uppercase tracking-[0.06em]">{{ auth.user.value?.role }}</span></div>
          <div class="flex justify-between"><span class="text-[12px] text-ink/45">Last sign in</span><span class="font-mono text-[10.5px]">{{ format.dateTime(auth.user.value?.lastLoginAt) }}</span></div>
          <div class="flex justify-between"><span class="text-[12px] text-ink/45">Password</span><StatusBadge :status="auth.user.value?.mustChangePassword ? 'received' : 'approved'" size="sm" /></div>
        </div>
        <button type="button" class="a-btn a-btn-ghost mt-4 w-full" @click="logout"><LogOut :size="12" /> Sign out</button>
      </div>

      <div class="a-card p-5">
        <div class="flex items-center gap-2 border-b border-ink/10 pb-3">
          <KeyRound :size="15" class="text-signal-deep" />
          <p class="text-[14px] font-medium">Change password</p>
        </div>
        <div class="mt-4 space-y-3">
          <div><label class="a-label">Current password</label><input v-model="current" type="password" class="a-input" autocomplete="current-password"></div>
          <div><label class="a-label">New password</label><input v-model="next" type="password" class="a-input" autocomplete="new-password"></div>
          <div><label class="a-label">Confirm new password</label><input v-model="confirm" type="password" class="a-input" autocomplete="new-password"></div>
          <p class="flex items-start gap-2 text-[11px] leading-relaxed text-ink/35"><ShieldCheck :size="11" class="mt-0.5 shrink-0" /> Sessions are short-lived; changing your password ends other refresh sessions.</p>
          <button type="button" class="a-btn a-btn-primary w-full" :disabled="saving" @click="changePassword">{{ saving ? 'Saving…' : 'Set new password' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
