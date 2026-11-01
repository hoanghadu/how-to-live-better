export interface Entry {
  id: string
  number: number
  title: string
  cost: string
  summary: string
  benefit: string
  grade: string
  gradeNote: string
  sources: string
  notes: string
  tags: Record<string, string>
  disputed: boolean
  unverified: boolean
  ratio: string
}
export interface Book {
  revision: string
  language: string
  sourceHash: string
  chapters: { id: number; title: string; intro: string; source: string; entries: Entry[]; appendix?: string }[]
}
