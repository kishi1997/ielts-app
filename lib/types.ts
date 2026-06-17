export interface Tip {
  phrase: string
  synonyms: string[]
}

export interface Exercise {
  order: number
  topic: string
  ja_paragraph: string
  phrases: string[]
  model_answer: string
  tips: Tip[]
}
