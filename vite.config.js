import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { IonicResolver } from 'unplugin-vue-components/resolvers'
import { VitePWA } from 'vite-plugin-pwa'
import replace from '@rollup/plugin-replace'
import lightningcss from 'vite-plugin-lightningcss'

const pwaOptions = {
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.svg'],
  manifest: {
    name: 'Vue 3 PWA ',
    short_name: 'Vite 3 PWA ',
    theme_color: '#ffffff',
    display: 'standalone',
    background_color: '#ffffff',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
  /*devOptions: {
    enabled: process.env.SW_DEV === 'true',
     when using generateSW the PWA plugin will switch to classic 
    type: 'module',
    navigateFallback: 'index.html',
    suppressWarnings: true
  }*/
}

const replaceOptions = { __DATE__: new Date().toISOString() }
const claims = process.env.CLAIMS === 'true'
const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src'
  pwaOptions.filename = claims ? 'claims-sw.js' : 'prompts-sw.js'
  pwaOptions.strategies = 'injectManifest'
  pwaOptions.manifest.name = 'PWA Inject Manifest'
  pwaOptions.manifest.short_name = 'PWA Inject'
  pwaOptions.injectManifest = {
    globPatterns: [
      // all packaged resources are stored here
      '**/*.{css,js,html,svg,png,ico,txt,woff2}',
      'assets/*'
    ]
  }
}

if (claims) {
  pwaOptions.registerType = 'autoUpdate'
  pwaOptions.workbox = {
    globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff2}']
  }
}

if (reload) {
  // @ts-expect-error overrides
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying) pwaOptions.selfDestroying = selfDestroying

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  plugins: [
    vue(),
    VitePWA(pwaOptions),
    replace(replaceOptions, {
      preventAssinment: true
    }),
    lightningcss({
      browserslist: '>= 0.25%'
    }),
    Components({
      resolvers: [IonicResolver()]
    }),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/ // .vue
      ],

      // global imports to register
      imports: [
        // presets
        'vue',
        'vue-router',
        { '@ionic/vue': ['IonicVue'], '@ionic/vue-router': ['createRouter', 'createWebHistory'] }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
