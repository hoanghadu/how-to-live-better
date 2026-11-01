<script lang="ts">
import MarkdownIt from 'markdown-it'

const sourceBase = 'https://github.com/eternity4719/HowToLiveBetter/blob/e2605d3e2242bd6216c9255192b8a8957a08c55a/'
const md = new MarkdownIt({ html: false, linkify: true, breaks: true })
const original = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]!
  const href = token.attrGet('href') || ''
  if (href.startsWith('../')) token.attrSet('href', `${sourceBase}${href.slice(3)}`)
  token.attrSet('rel', 'noopener noreferrer')
  return original(tokens, idx, options, env, self)
}

function renderMarkdown(text: string) {
  return md.render(text || '')
}
</script>

<script setup lang="ts">
const props = defineProps<{ text: string }>()
const html = computed(() => renderMarkdown(props.text))
</script>
<template><div class="prose" v-html="html" /></template>
