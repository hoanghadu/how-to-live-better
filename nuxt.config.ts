export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Live Better · Sống tốt hơn',
      meta: [{ name: 'description', content: 'A practical guide to living better. Read HowToLiveBetter in English and Vietnamese, with original sources and evidence ratings.' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${process.env.NUXT_APP_BASE_URL || '/'}favicon.svg` }]
    }
  },
  nitro: { prerender: { routes: ['/en', '/vi'], crawlLinks: true } }
})
