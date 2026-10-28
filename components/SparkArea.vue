<script setup lang="ts">
const props = withDefaults(defineProps<{
  values: number[]
  height?: number
  color?: string
  fill?: boolean
}>(), {
  height: 64,
  color: '#007d48',
  fill: true,
})

const width = 300
const uid = useId()

const geometry = computed(() => {
  const values = props.values.length ? props.values : [0]
  const max = Math.max(1, ...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / Math.max(1, values.length - 1)
  const points = values.map((value, index) => ({
    x: index * step,
    y: props.height - 4 - ((value - min) / range) * (props.height - 12),
  }))
  const line = points.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const area = `${line} L${width} ${props.height} L0 ${props.height} Z`
  return { line, area, points }
})
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" class="w-full" :style="{ height: `${height}px` }" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient :id="`fill-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity=".16" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill" :d="geometry.area" :fill="`url(#fill-${uid})`" />
    <path :d="geometry.line" fill="none" :stroke="color" stroke-width="1.6" vector-effect="non-scaling-stroke" />
  </svg>
</template>
