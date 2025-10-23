import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt'
  ],

  css: [
    '~/assets/css/main.css',
    '~/assets/css/global.css'
  ],

  plugins: [
    '~/plugins/api.js',
    '~/plugins/primevue.js'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Fredy Fasbear Industries'
    }
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Fredy Fasbear Industries - Empeña y Compra con Confianza',
      meta: [
        { name: 'description', content: 'Sistema de empeño profesional y confiable en Guatemala' },
        { name: 'keywords', content: 'empeño, guatemala, joyas, electrónicos, vehículos, préstamos' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  devServer: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0'
  },

  typescript: {
    typeCheck: false
  },

  nitro: {
    preset: 'node-server'
  },

  build: {
    transpile: []
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            $primary-color: #D4AF37;
            $secondary-color: #2C3E50;
          `
        }
      }
    }
  },

  ssr: true,

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  imports: {
    dirs: [
      'composables',
      'utils'
    ]
  }
})