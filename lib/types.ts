export interface VocabQuestion {
  order: number
  word: string
  choices: string[]
  answerIndex: number
}

export interface SentenceQuestion {
  order: number
  word: string
  ja_sentence: string
  model_answer: string
  tips?: string
}

export interface DailyContent {
  vocab: VocabQuestion[]
  sentences: SentenceQuestion[]
}
