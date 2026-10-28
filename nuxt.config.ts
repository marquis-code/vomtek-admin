import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  telemetry: false,
  css: [
    '~/assets/css/main.css',
  ],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4010/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3010',
    },
  },
  app: {
    head: {
      title: 'Vomtek Studio',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'theme-color', content: '#004b2b' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preload', href: '/fonts/clash-display-600.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/satoshi-400.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        { rel: 'preload', href: '/fonts/ibm-plex-mono-400.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ],
    },
    pageTransition: { name: 'admin-page', mode: 'out-in' },
  },
  typescript: { strict: true },
})
