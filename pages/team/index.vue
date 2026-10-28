<script setup lang="ts">
import { UserPlus, Copy, Check, ShieldCheck, CircleAlert, Power } from 'lucide-vue-next'
import type { AdminUser, Role } from '~/types'

useHead({ title: 'Team — Vomtek Studio' })

const api = useApi()
const auth = useAuth()
const toast = useToast()
const format = useFormat()

const loading = ref(true)
const users = ref<AdminUser[]>([])
const error = ref('')
const open = ref(false)
const saving = ref(false)
const tempPassword = ref('')
const coped = ref(false)
const form = reactive({ name: '', email: '', role: 'sales' as Role, password: '' })

const roles: Role[] = ['owner', 'admin', 'sales', 'ops', 'viewer']
const roleOptions = roles.map(role => ({ value: role, label: role }))

async function load() {
  loading.value = true
  try {
    const response = await api.users.list()
    users.value = response.items
  }
  catch (err: unknown) { error.value = (err as Error).message }
  finally { loading.value = false }
}

function startInvite() {
  Object.assign(form, { name: '', email: '', role: 'sales', password: '' })
  tempPassword.value = ''
  open.value = true
}

async function invite() {
  if (!form.name || !form.email) { toast.error('Name and email are required'); return }
  saving.value = true
  try {
    const response = await api.users.create({ name: form.name, email: form.email, role: form.role, password: form.password || undefined })
    users.value.push(response.user)
    tempPassword.value = response.temporaryPassword || ''
    if (!tempPassword.value) open.value = false
    toast.success('Team member added', response.temporaryPassword ? 'Share the temporary password securely.' : 'They can sign in now.')
  }
  catch (err: unknown) { toast.error('Could not add user', (err as Error).message) }
  finally { saving.value = false }
}

async function update(user: AdminUser, body: Record<string, unknown>) {
  try {
    const updated = await api.users.update(user.id, body)
    const index = users.value.findIndex(item => item.id === user.id)
    if (index >= 0) users.value[index] = updated
    toast.success('User updated')
  }
  catch (err: unknown) { toast.error('Could not update user', (err as Error).message) }
}

async function copyPassword() {
  await navigator.clipboard.writeText(tempPassword.value)
  coped.value = true
  setTimeout(() => { coped.value = false }, 1800)
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="System" title="Team & access" description="Who can see the pipeline, content and settings. Roles are enforced by the API, not just the interface.">
      <button type="button" class="a-btn a-btn-primary" @click="startInvite"><UserPlus :size="12" /> Invite teammate</button>
    </PageHeader>

    <div v-if="error" class="mb-4 flex items-center gap-2 border border-danger/30 bg-danger-soft px-3 py-2.5 font-mono text-[10.5px] uppercase text-danger"><CircleAlert :size="13" /> {{ error }}</div>

    <div class="a-card overflow-hidden">
      <table class="a-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign in</th><th /></tr></thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="flex items-center gap-2">
                <span class="flex size-7 items-center justify-center rounded-full bg-ink font-mono text-[9.5px] text-bone">{{ user.name.split(' ').map(n => n[0]).join('').slice(0,2) }}</span>
                <div>
                  <p class="text-[12px] font-medium">{{ user.name }} <span v-if="user.id === auth.user.value?.id" class="font-mono text-[9.5px] uppercase text-ink/30">(you)</span></p>
                  <p v-if="user.mustChangePassword" class="font-mono text-[9.5px] uppercase text-signal-deep">Must change password</p>
                </div>
              </div>
            </td>
            <td class="font-mono text-[11px] text-ink/50">{{ user.email }}</td>
            <td>
              <SearchSelect :model-value="user.role" :options="roleOptions" :disabled="user.id === auth.user.value?.id" compact class="w-28" @update:model-value="v => update(user, { role: String(v) })" />
            </td>
            <td><StatusBadge :status="user.active ? 'approved' : 'archived'" size="sm" /></td>
            <td class="font-mono text-[10.5px] text-ink/40">{{ user.lastLoginAt ? format.relative(user.lastLoginAt) : 'Never' }}</td>
            <td class="text-right">
              <button type="button" class="flex h-7 items-center gap-1 border border-ink/15 px-2 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink/40 hover:border-ink/35 hover:text-ink" :disabled="user.id === auth.user.value?.id" @click="update(user, { active: !user.active })">
                <Power :size="10" /> {{ user.active ? 'Deactivate' : 'Reactivate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="loading" class="space-y-2 p-4"><div v-for="i in 3" :key="i" class="h-9 a-skeleton" /></div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="role in roles" :key="role" class="a-card p-3">
        <p class="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink/45"><ShieldCheck :size="10" /> {{ role }}</p>
        <p class="mt-1 text-[11.5px] leading-relaxed text-ink/40">
          {{ role === 'owner' ? 'Full access, including team and settings.' : role === 'admin' ? 'Full access except ownership transfers.' : role === 'sales' ? 'Quotes, messages, catalog, subscribers.' : role === 'ops' ? 'Jobs, applications, quotes operations.' : 'Read-only dashboards and pipeline.' }}
        </p>
      </div>
    </div>

    <SlideOver :open="open" title="Invite teammate" subtitle="Access is scoped by role" @close="open = false">
      <div class="space-y-4 p-5">
        <div><label class="a-label">Name</label><input v-model="form.name" class="a-input"></div>
        <div><label class="a-label">Email</label><input v-model="form.email" type="email" class="a-input"></div>
        <div><label class="a-label">Role</label><SearchSelect v-model="form.role" :options="roleOptions" /></div>
        <div><label class="a-label">Temporary password (optional)</label><input v-model="form.password" class="a-input font-mono text-[12px]" placeholder="Leave blank to generate"></div>
        <div v-if="tempPassword" class="border border-signal/30 bg-signal/8 p-3">
          <p class="font-mono text-[9.5px] uppercase tracking-[0.1em] text-signal-deep">Temporary password — shown once</p>
          <div class="mt-1.5 flex items-center gap-2">
            <code class="flex-1 border border-ink/15 bg-surface px-2 py-1.5 font-mono text-[12px]">{{ tempPassword }}</code>
            <button type="button" class="flex size-8 items-center justify-center rounded-full border border-ink/15" @click="copyPassword"><component :is="coped ? Check : Copy" :size="12" /></button>
          </div>
          <p class="mt-1.5 text-[11px] text-ink/45">Share this over a secure channel. They will be prompted to change it.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <button type="button" class="a-btn a-btn-ghost" @click="open = false">Cancel</button>
          <button v-if="!tempPassword" type="button" class="a-btn a-btn-primary" :disabled="saving" @click="invite">{{ saving ? 'Adding…' : 'Add teammate' }}</button>
          <button v-else type="button" class="a-btn a-btn-primary" @click="open = false">Done</button>
        </div>
      </template>
    </SlideOver>
  </div>
</template>
