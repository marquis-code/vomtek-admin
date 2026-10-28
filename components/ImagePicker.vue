<script setup lang="ts">
import { ImagePlus, X, Check, RefreshCw } from 'lucide-vue-next'
import type { MediaAsset } from '~/types'

const model = defineModel<string>({ default: '' })
const props = defineProps<{ label?: string }>()

const api = useApi()
const media = useMedia()
const open = ref(false)
const loading = ref(false)
const assets = ref<MediaAsset[]>([])
const external = ref('')

async function load() {
  if (assets.value.length) return
  loading.value = true
  try {
    const response = await api.media.list()
    assets.value = response.items
  }
  finally {
    loading.value = false
  }
}

async function show() {
  open.value = true
  await load()
}

function choose(key: string) {
  model.value = key
  open.value = false
}

function useExternal() {
  if (!external.value.trim()) return
  model.value = external.value.trim()
  external.value = ''
  open.value = false
}

const preview = computed(() => media.url(model.value, 800))
</script>

<template>
  <div>
    <label v-if="props.label" class="a-label">{{ props.label }}</label>
    <button type="button" class="group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden border border-ink/15 bg-paper" @click="show">
      <img v-if="model" :src="preview" :alt="model" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]">
      <span v-else class="flex flex-col items-center gap-2 text-ink/30">
        <ImagePlus :size="22" />
        <span class="font-mono text-[9.5px] uppercase tracking-[0.12em]">Choose image</span>
      </span>
      <span class="absolute bottom-2 left-2 border border-bone/20 bg-ink/70 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-bone/70 backdrop-blur">{{ model || 'No image' }}</span>
    </button>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="open" class="fixed inset-0 z-[85] flex items-center justify-center bg-ink/45 px-4 backdrop-blur-sm" @click.self="open = false">
          <div class="modal-panel flex max-h-[85vh] w-full max-w-3xl flex-col border border-ink/20 bg-surface shadow-[0_30px_90px_-30px_rgba(10,12,11,.5)]">
            <div class="flex items-center justify-between border-b border-ink/12 px-4 py-3">
              <div>
                <p class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-signal-deep">Media library</p>
                <h3 class="mt-0.5 text-[16px] font-medium">Choose an image</h3>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="a-btn a-btn-ghost" :disabled="loading" @click="assets = []; load()">
                  <RefreshCw :size="11" :class="loading ? 'animate-spin' : ''" /> Refresh
                </button>
                <button type="button" class="flex size-8 items-center justify-center rounded-full border border-ink/15 text-ink/40 hover:text-ink" @click="open = false"><X :size="14" /></button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4">
              <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <button v-for="asset in assets" :key="asset._id" type="button" class="group relative overflow-hidden border border-ink/12 bg-paper text-left" :class="model === asset.key ? 'border-signal ring-2 ring-signal/20' : ''" @click="choose(asset.key)">
                  <div class="aspect-[4/3] overflow-hidden">
                    <img :src="media.url(asset.key, 480)" :alt="asset.alt" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                  </div>
                  <div class="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span class="truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink/45">{{ asset.key }}</span>
                    <Check v-if="model === asset.key" :size="11" class="shrink-0 text-signal-deep" />
                  </div>
                </button>
              </div>
              <p v-if="loading" class="py-10 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/35">Loading library…</p>
              <p v-if="!loading && !assets.length" class="py-10 text-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/35">No media assets yet.</p>

              <div class="mt-5 border-t border-ink/10 pt-4">
                <label class="a-label">Or use an external image URL</label>
                <div class="flex gap-2">
                  <input v-model="external" type="url" class="a-input font-mono text-[12px]" placeholder="https://…">
                  <button type="button" class="a-btn a-btn-ghost shrink-0" @click="useExternal">Use URL</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
