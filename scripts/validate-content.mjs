import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = new URL('../public/content/', import.meta.url);
const read = locale => JSON.parse(readFileSync(new URL(`${locale}.json`, root), 'utf8'));
const source = read('zh-CN');
const urls = text => text.match(/https?:\/\/[^\s<>\)]+/g) || [];
const fields = ['title','cost','summary','benefit','sources','notes','gradeNote'];
for (const locale of ['en','vi']) {
  assert.ok(existsSync(new URL(`${locale}.json`, root)), `Missing complete ${locale} translation. Publication is blocked.`);
  const book = read(locale);
  assert.equal(book.language, locale);
  assert.equal(book.revision, source.revision);
  assert.equal(book.translation.sourceHash, source.sourceHash);
  assert.equal(book.chapters.length, source.chapters.length);
  const check = (before, after, key) => {
    assert.equal(typeof after[key], 'string', `Missing ${key}`);
    assert.ok(!before[key] || after[key].trim(), `Empty ${key}`);
    assert.deepEqual(urls(after[key]), urls(before[key]), `Changed URLs in ${locale}/${before.id}/${key}`);
    if (/[\u3400-\u9fff]/u.test(before[key])) assert.notEqual(after[key], before[key], `Untranslated ${locale}/${before.id}/${key}`);
    assert.doesNotMatch(after[key], /ZXQLINK\d+QXZ/i, 'Unresolved translation marker');
  };
  for (const [index, chapter] of book.chapters.entries()) {
    const original = source.chapters[index];
    assert.equal(chapter.id, original.id);
    assert.equal(chapter.source, original.source);
    assert.equal(chapter.entries.length, original.entries.length);
    for (const key of ['title','intro', ...(original.appendix ? ['appendix'] : [])]) check(original, chapter, key);
    for (const [i, entry] of chapter.entries.entries()) {
      const before = original.entries[i];
      for (const key of ['id','number','grade','ratio','disputed','unverified','tags']) assert.deepEqual(entry[key], before[key], `Changed metadata: ${key}`);
      for (const key of fields) check(before, entry, key);
    }
  }
  console.log(`${locale}: all chapters, fields, IDs, source URLs and metadata verified. Editorial accuracy still requires human review.`);
}
