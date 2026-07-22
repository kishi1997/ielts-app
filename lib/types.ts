export interface VocabQuestion {
  order: number
  word: string
  choices: string[]
  answerIndex: number
  meaning?: string
  etymology?: string
  mnemonic?: string
  example?: string
  exampleJa?: string
}

export interface SentenceQuestion {
  order: number
  word: string
  ja_sentence: string
  model_answer: string
  tips?: string
  explanation?: string
}

export interface DailyContent {
  vocab: VocabQuestion[]
  sentences: SentenceQuestion[]
}

export type ProblemType = 'vocab' | 'sentence'

export interface MissedProblem {
  id: string
  sourceDate: string
  problemType: ProblemType
  problemOrder: number
  title: string
  prompt: string
  answer: string
  explanation: string
  createdAt: string
  updatedAt: string
}
