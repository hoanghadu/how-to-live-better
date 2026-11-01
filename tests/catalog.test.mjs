import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterEntries, normalize } from '../app/utils/catalog.mjs';
const { chapters } = JSON.parse(readFileSync(new URL('../public/content/zh-CN.json', import.meta.url)));
const all = chapters.flatMap(chapter => chapter.entries);
test('imports every source entry once and keeps original evidence grades', () => {
  assert.equal(chapters.length, 34);
  assert.equal(all.length, 767);
  assert.equal(new Set(all.map(entry => entry.id)).size, all.length);
  assert.ok(all.every(entry => /^[ABC]$/.test(entry.grade)));
  assert.ok(all.every(entry => entry.title && entry.cost && entry.benefit && entry.sources));
});
test('Vietnamese search normalizes accents and crossed d', () => {
  assert.equal(normalize('Đừng lãng phí thời gian'), 'dung lang phi thoi gian');
});
test('chapter and search intersect', () => {
  const results = filterEntries(chapters, { chapter: '1', query: '安全带' });
  assert.ok(results.some(entry => entry.id === '1-1'));
  assert.ok(results.every(entry => entry.chapterId === 1));
  assert.equal(filterEntries(chapters, { query: 'nomatch-unique-86423799' }).length, 0);
});
test('filters union within groups and intersect across groups', () => {
  const results = filterEntries(chapters, { money: ['0','少'], grade: ['A','B'], lens: ['死亡率'] });
  assert.ok(results.length > 0);
  assert.ok(results.every(entry => ['0','少'].includes(entry.tags.money) && ['A','B'].includes(entry.grade) && entry.tags.lens === '死亡率'));
});
test('audience OR/AND metadata and untagged entries retain source semantics', () => {
  const results = filterEntries(chapters, { audience: ['女性'] });
  const ids = new Set(results.map(entry => entry.id));
  assert.ok(all.filter(entry => !entry.tags.audience).every(entry => ids.has(entry.id)));
  assert.ok(all.filter(entry => entry.tags.audience === '女性+35岁').every(entry => !ids.has(entry.id)));
  const both = new Set(filterEntries(chapters, { audience: ['女性','35岁'] }).map(entry => entry.id));
  assert.ok(all.filter(entry => entry.tags.audience === '女性+35岁').every(entry => both.has(entry.id)));
  assert.ok(filterEntries(chapters, { audience: ['none'] }).every(entry => !entry.tags.audience));
});
test('disputed and unverified filters return only source-flagged entries', () => {
  const disputed = filterEntries(chapters, { disputed: true });
  assert.ok(disputed.length > 0);
  assert.ok(disputed.every(entry => entry.disputed));
  assert.ok(filterEntries(chapters, { unverified: true }).every(entry => entry.unverified));
});
