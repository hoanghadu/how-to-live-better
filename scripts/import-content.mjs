import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const fields = { '成本': 'cost', '说人话': 'summary', '收益': 'benefit', '证据等级': 'grade', '来源': 'sources', '备注': 'notes' };
const tags = { '钱': 'money', '时间': 'time', '毅力': 'will', '收益': 'level', '口径': 'lens', '人群': 'audience' };
const chapters = [];
for (const file of readdirSync(new URL('docs/upstream/book/', root)).filter(f => f.endsWith('.md')).sort()) {
  const raw = readFileSync(new URL(`docs/upstream/book/${file}`, root), 'utf8');
  const heading = raw.match(/^# (\d+)\. (.+)$/m);
  if (!heading) throw new Error(`Missing heading: ${file}`);
  const chapter = { id: Number(heading[1]), title: heading[2], intro: '', source: `https://github.com/eternity4719/HowToLiveBetter/blob/e2605d3e2242bd6216c9255192b8a8957a08c55a/book/${encodeURIComponent(file)}`, entries: [] };
  let entry;
  let inChapter = false;
  let appendix = false;
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('# ')) { inChapter = true; continue; }
    if (!inChapter) continue;
    if (line.startsWith('## ')) { appendix = true; chapter.appendix = ''; }
    if (appendix) { chapter.appendix += `${line}\n`; continue; }
    const match = line.match(/^### (\d+)\. (.+)$/);
    if (match) {
      entry = { id: `${chapter.id}-${match[1]}`, number: Number(match[1]), title: match[2], cost: '', summary: '', benefit: '', grade: '', sources: '', notes: '', tags: {} };
      chapter.entries.push(entry);
      continue;
    }
    if (!entry) { chapter.intro += `${line}\n`; continue; }
    const meta = line.match(/^<!-- 成本标签:\s*(.*?)\s*-->/);
    if (meta) {
      for (const pair of meta[1].split(/\s+/)) {
        const [key, value] = pair.split('=');
        if (!tags[key]) throw new Error(`Unknown metadata: ${key}`);
        entry.tags[tags[key]] = value;
      }
      continue;
    }
    const field = line.match(/^- ([^：]+)：(.*)$/);
    if (field && fields[field[1]]) entry[fields[field[1]]] = field[2];
    else if (line.trim()) throw new Error(`Unparsed content in ${file}: ${line.slice(0,100)}`);
  }
  chapter.intro = chapter.intro.trim();
  for (const item of chapter.entries) {
    item.gradeNote = item.grade.slice(1);
    item.grade = item.grade[0];
    item.disputed = /^争议/.test(item.notes);
    item.unverified = /待核实|TODO/.test(item.sources + item.benefit + item.notes + item.cost);
    const weights = { money: { '0': 0, '少': 1, '多': 2 }, time: { '少': 0, '中': 1, '多': 2 }, will: { '否': 0, '些': 1, '是': 2 } };
    const cost = Object.entries(weights).reduce((sum, [key, values]) => sum + (values[item.tags[key]] ?? 0), 0);
    item.ratio = item.tags.level === '大' ? (cost === 0 ? 'very-high' : cost <= 2 ? 'high' : 'ordinary') : item.tags.level === '中' && cost === 0 ? 'high' : 'ordinary';
  }
  chapters.push(chapter);
}
const data = { upstream: 'eternity4719/HowToLiveBetter', revision: 'e2605d3e2242bd6216c9255192b8a8957a08c55a', license: 'CC-BY-4.0', language: 'zh-CN', chapters };
data.sourceHash = createHash('sha256').update(JSON.stringify(chapters)).digest('hex');
writeFileSync(new URL('public/content/zh-CN.json', root), JSON.stringify(data, null, 2) + '\n');
console.log(`Imported ${chapters.length} chapters and ${chapters.reduce((n,c) => n+c.entries.length,0)} entries.`);

writeFileSync(new URL('public/content/manifest.json', root), JSON.stringify({ revision: data.revision, chapters: chapters.length, entries: chapters.reduce((n,c) => n+c.entries.length,0) }, null, 2) + '\n');
