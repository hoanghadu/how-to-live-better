<script setup lang="ts">
import { ui } from '~/utils/ui'
import { filterEntries } from '~/utils/catalog.mjs'
import manifest from '../../public/content/manifest.json'
import type { Book } from '~/utils/types'
const route = useRoute()
const lang = computed(() => route.params.lang === 'en' ? 'en' : 'vi')
if (!['en', 'vi'].includes(String(route.params.lang))) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
const t = computed(() => ui[lang.value])
// Translation files are generated and validated before publication. Missing
// locales are explicit, never silently presented as translated Chinese text.
const locales = import.meta.glob('../../public/content/{en,vi}.json', { import: 'default' })
const { data: book } = await useAsyncData(`book-${lang.value}`, async () => {
  const loader = locales[`../../public/content/${lang.value}.json`]
  return loader ? await loader() as Book : null
})
const filters = reactive({ query: String(route.query.q || ''), chapter: String(route.query.chapter || ''), money: [] as string[], time: [] as string[], will: [] as string[], grade: [] as string[], ratio: [] as string[], lens: [] as string[], audience: [] as string[], disputed: false, unverified: false })
const page = ref(1)
const pageSize = 15
const mobileMenu = ref(false)
const chapters = computed(() => book.value?.chapters || [])
const total = computed(() => chapters.value.reduce((n, chapter) => n + chapter.entries.length, 0))
const results = computed(() => filterEntries(chapters.value, filters))
const visible = computed(() => results.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const pageCount = computed(() => Math.max(1, Math.ceil(results.value.length / pageSize)))
const currentChapter = computed(() => chapters.value.find(c => c.id === Number(filters.chapter)))
const groups = computed(() => [
  { key: 'ratio' as const, title: t.value.ratio, values: ['very-high','high','ordinary'], labels: t.value.ratioOptions },
  { key: 'lens' as const, title: t.value.lens, values: ['死亡率','金钱','时间','自由'], labels: t.value.lensOptions },
  { key: 'grade' as const, title: t.value.grade, values: ['A','B','C'], labels: ['A','B','C'] },
  { key: 'money' as const, title: t.value.money, values: ['0','少','多'], labels: t.value.moneyOptions },
  { key: 'time' as const, title: t.value.time, values: ['少','中','多'], labels: t.value.timeOptions },
  { key: 'will' as const, title: t.value.will, values: ['否','些','是'], labels: t.value.willOptions },
  { key: 'audience' as const, title: t.value.audience, values: ['怀孕','婴幼儿','孩子','老人','35岁','60岁','女性','none'], labels: t.value.audienceOptions },
])
function toggle(key: typeof groups.value[number]['key'], value: string) {
  const list = filters[key]
  const index = list.indexOf(value)
  if (index >= 0) list.splice(index, 1)
  else list.push(value)
}
function clear() {
  filters.query = ''; filters.chapter = ''
  for (const group of groups.value) filters[group.key] = []
  filters.disputed = false; filters.unverified = false
}
function selectChapter(id: string) { filters.chapter = id; mobileMenu.value = false }
watch(filters, () => { page.value = 1 }, { deep: true })
watch(() => route.params.lang, () => reloadNuxtApp({ path: route.fullPath }))
const languageLink = computed(() => ({ path: `/${lang.value === 'en' ? 'vi' : 'en'}`, query: { ...(filters.chapter ? { chapter: filters.chapter } : {}) }, hash: route.hash }))
useHead(() => ({ htmlAttrs: { lang: lang.value }, title: `${t.value.brand} · HowToLiveBetter` }))
onMounted(() => {
  if (route.hash.startsWith('#idea-')) {
    const id = route.hash.replace('#idea-', '')
    const index = results.value.findIndex(entry => entry.id === id)
    if (index >= 0) { page.value = Math.floor(index / pageSize) + 1; nextTick(() => document.getElementById(`idea-${id}`)?.scrollIntoView()) }
  }
})
</script>

<template>
  <div id="top">
    <a class="skip-link" href="#guide">{{ t.reading }}</a>
    <header class="header">
      <NuxtLink :to="`/${lang}`" class="brand"><span class="brand-icon" aria-hidden="true">L<span>●</span></span><span>{{ t.brand }}<small>{{ t.subtitle }}</small></span></NuxtLink>
      <nav aria-label="Main"><a href="#guide">{{ t.library }}</a><a href="#about">{{ t.about }}</a><NuxtLink :to="languageLink" class="language" :aria-label="lang === 'vi' ? 'Read in English' : 'Đọc tiếng Việt'">{{ lang === 'vi' ? 'EN' : 'VI' }} <span aria-hidden="true">↗</span></NuxtLink></nav>
    </header>
    <main>
      <section class="hero">
        <div class="hero-copy"><p class="eyebrow"><span class="dot" />{{ t.eyebrow }}</p><h1>{{ t.title }}</h1><p class="intro">{{ t.intro }}</p><a class="primary" href="#guide">{{ t.browse }} <span aria-hidden="true">↗</span></a><p class="edition">{{ t.edition }}</p></div>
        <div class="hero-note"><span class="note-number" aria-hidden="true">01 — 34</span><div class="leaf-art" aria-hidden="true"><i /><i /><i /></div><blockquote>{{ t.principle }}</blockquote><p>{{ t.principleBody }}</p><div class="stats"><span><strong>{{ manifest.chapters }}</strong>{{ t.chapterCount }}</span><span><strong>{{ manifest.entries }}</strong>{{ t.entries }}</span><span><strong>EN / VI</strong>{{ t.languages }}</span></div></div>
      </section>
      <section id="about" class="notice"><span class="notice-symbol" aria-hidden="true">i</span><div><strong>{{ t.notice }}</strong><p>{{ t.noticeBody }}</p></div></section>
      <section id="guide" class="guide">
        <div class="guide-heading"><div><p class="eyebrow">{{ t.reading }}</p><h2>{{ t.library }}</h2></div><span class="machine">{{ t.machine }}</span></div>
        <div v-if="!book" class="pending" role="status">
          <h3>{{ lang === 'vi' ? 'Bản dịch đầy đủ đang được chuẩn bị' : 'The complete translation is being prepared' }}</h3>
          <p>{{ lang === 'vi' ? 'Chưa có bản dịch hoàn chỉnh đã vượt qua kiểm tra. Bạn có thể đọc nguồn tiếng Trung trong lúc chờ.' : 'No complete translation has passed validation yet. The original Chinese edition remains available.' }}</p>
          <a href="https://eternity4719.github.io/HowToLiveBetter/">{{ t.original }} ↗</a>
        </div>
        <template v-else>
          <form class="search" @submit.prevent><span aria-hidden="true">⌕</span><label class="sr-only" for="search">{{ t.search }}</label><input id="search" v-model="filters.query" type="search" :placeholder="t.placeholder"><span class="search-count">{{ total }} {{ t.entries }}</span></form>
          <button class="mobile-toggle" :aria-expanded="mobileMenu" aria-controls="sidebar" @click="mobileMenu = !mobileMenu">{{ mobileMenu ? t.close : t.menu }} <span>☰</span></button>
          <div class="reader-layout">
            <aside id="sidebar" :class="{ 'mobile-open': mobileMenu }">
              <div class="sidebar-title"><h3>{{ t.chapters }}</h3><span>{{ chapters.length }}</span></div>
              <nav class="chapter-list" :aria-label="t.chapters"><button :class="{ active: !filters.chapter }" @click="selectChapter('')"><span>◎</span>{{ t.all }}<small>{{ total }}</small></button><button v-for="chapter in chapters" :key="chapter.id" :class="{ active: filters.chapter === String(chapter.id) }" @click="selectChapter(String(chapter.id))"><span>{{ String(chapter.id).padStart(2, '0') }}</span>{{ chapter.title }}<small>{{ chapter.entries.length }}</small></button></nav>
              <div class="sidebar-title filter-title"><h3>{{ t.filter }}</h3><button class="text-button" @click="clear">{{ t.clear }}</button></div>
              <fieldset v-for="group in groups" :key="group.key"><legend>{{ group.title }}</legend><div class="filter-options"><button v-for="(value, index) in group.values" :key="value" :aria-pressed="filters[group.key].includes(value)" @click="toggle(group.key, value)">{{ group.labels[index] }}</button></div></fieldset>
              <label class="check"><input v-model="filters.disputed" type="checkbox">{{ t.disputed }}</label><label class="check"><input v-model="filters.unverified" type="checkbox">{{ t.unverified }}</label><p class="filter-help">{{ t.filterHelp }}</p><p class="filter-help">{{ t.evidenceHelp }}</p>
            </aside>
            <div class="results">
              <div class="results-bar" aria-live="polite"><h3>{{ currentChapter?.title || t.all }}</h3><span>{{ results.length }} {{ t.result }}</span></div>
              <details v-if="currentChapter" class="chapter-intro"><summary>{{ t.chapterIntro }}</summary><ProseText :text="currentChapter.intro" /></details>
              <div v-if="!results.length" class="empty"><span aria-hidden="true">⌕</span><h3>{{ t.empty }}</h3><p>{{ t.emptyHelp }}</p><button class="primary" @click="clear">{{ t.clear }}</button></div>
              <article v-for="entry in visible" :id="`idea-${entry.id}`" :key="entry.id" class="entry">
                <div class="entry-top"><span class="chapter-label">{{ String(entry.chapterId).padStart(2,'0') }} / {{ entry.chapterTitle }}</span><span class="grade">{{ t.grade }} {{ entry.grade }}</span></div>
                <h3><a :href="`#idea-${entry.id}`" :aria-label="`${t.link}: ${entry.title}`"><span class="entry-number">{{ String(entry.number).padStart(2,'0') }}.</span>{{ entry.title }}</a></h3>
                <div class="badges"><span class="value-badge">{{ t.ratioOptions[['very-high','high','ordinary'].indexOf(entry.ratio)] }}</span><span>{{ t.moneyOptions[['0','少','多'].indexOf(entry.tags.money)] }}</span><span v-if="entry.disputed" class="warning">{{ t.disputed }}</span><span v-if="entry.unverified" class="warning">{{ t.unverified }}</span></div>
                <ProseText class="entry-summary" :text="entry.summary" />
                <div class="cost"><strong>{{ t.cost }}</strong><ProseText :text="entry.cost" /></div>
                <details class="evidence"><summary>{{ t.details }}<span aria-hidden="true">＋</span></summary><ProseText v-if="entry.gradeNote" :text="entry.gradeNote" /><section><h4>{{ t.benefit }}</h4><ProseText :text="entry.benefit" /></section><section v-if="entry.notes"><h4>{{ t.notes }}</h4><ProseText :text="entry.notes" /></section><section><h4>{{ t.sources }}</h4><ProseText :text="entry.sources" /></section></details>
                <a class="original-link" :href="entry.source" target="_blank" rel="noopener noreferrer">{{ t.original }} · {{ entry.id }} ↗</a>
              </article>
              <nav v-if="results.length" class="pagination" aria-label="Pagination"><button :disabled="page === 1" @click="page--">← {{ t.previous }}</button><span>{{ page }} / {{ pageCount }}</span><button :disabled="page >= pageCount" @click="page++">{{ t.next }} →</button></nav>
            </div>
          </div>
        </template>
      </section>
    </main>
    <footer><div><strong>{{ t.brand }}</strong><p>{{ t.sourceCredit }}</p><p><a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · <a href="https://github.com/eternity4719/HowToLiveBetter">{{ t.sourceRepo }} ↗</a></p></div><a href="#top">{{ t.top }} ↑</a></footer>
  </div>
</template>
