const TAG_FILTERS = ['money', 'time', 'will', 'lens'];

export function normalize(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

export function filterEntries(chapters, filters) {
  const words = normalize(filters.query || '').split(/\s+/).filter(Boolean);
  const entries = chapters.flatMap(chapter => chapter.entries.map(entry => ({
    ...entry,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    source: chapter.source,
  })));

  return entries.filter(entry => {
    if (filters.chapter && entry.chapterId !== Number(filters.chapter)) return false;

    const text = normalize([entry.title, entry.summary, entry.cost, entry.benefit, entry.notes, entry.sources].join(' '));
    if (!words.every(word => text.includes(word))) return false;

    for (const key of TAG_FILTERS) {
      if (filters[key]?.length && !filters[key].includes(entry.tags[key])) return false;
    }
    if (filters.grade?.length && !filters.grade.includes(entry.grade.trim())) return false;
    if (filters.ratio?.length && !filters.ratio.includes(entry.ratio)) return false;
    if (filters.disputed && !entry.disputed) return false;
    if (filters.unverified && !entry.unverified) return false;
    if (filters.audience?.length && entry.tags.audience) {
      const groups = entry.tags.audience.split(',').map(group => group.split('+'));
      if (!groups.some(group => group.every(value => filters.audience.includes(value)))) return false;
    }
    return true;
  });
}
