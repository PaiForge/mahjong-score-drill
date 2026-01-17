import { create } from 'zustand'
import type { DrillQuestion, UserAnswer, JudgementResult, QuestionGeneratorOptions } from '@/lib/drill/types'
import { generateValidQuestion } from '@/lib/drill/utils/questionGenerator'
import { judgeAnswer } from '@/lib/drill/utils/judgement'

interface DrillState {
  /** 現在の問題 */
  currentQuestion: DrillQuestion | null
  /** ユーザーの回答 */
  userAnswer: UserAnswer | null
  /** 判定結果 */
  judgementResult: JudgementResult | null
  /** 回答済みかどうか */
  isAnswered: boolean
  /** 問題生成オプション */
  options: QuestionGeneratorOptions
  /** 統計 */
  stats: {
    total: number
    correct: number
  }
}

interface DrillActions {
  /** 新しい問題を生成 */
  generateNewQuestion: () => void
  /** 回答を送信 */
  submitAnswer: (answer: UserAnswer, requireYaku?: boolean) => void
  /** 次の問題へ */
  nextQuestion: () => void
  /** 統計をリセット */
  resetStats: () => void
  /** オプションを更新 */
  /** オプションを更新 */
  setOptions: (options: Partial<QuestionGeneratorOptions>) => void
  /** 問題を直接設定 */
  setQuestion: (question: DrillQuestion) => void
}

type DrillStore = DrillState & DrillActions

export const useDrillStore = create<DrillStore>((set, get) => ({
  currentQuestion: null,
  userAnswer: null,
  judgementResult: null,
  isAnswered: false,
  options: {
    includeFuro: true,
    includeChiitoi: false,
  },
  stats: {
    total: 0,
    correct: 0,
  },

  generateNewQuestion: () => {
    const { options } = get()
    const question = generateValidQuestion(options)
    set({
      currentQuestion: question,
      userAnswer: null,
      judgementResult: null,
      isAnswered: false,
    })
  },

  submitAnswer: (answer: UserAnswer, requireYaku: boolean = false) => {
    const { currentQuestion, stats } = get()
    if (!currentQuestion) return

    const result = judgeAnswer(currentQuestion, answer, requireYaku)

    set({
      userAnswer: answer,
      judgementResult: result,
      isAnswered: true,
      stats: {
        total: stats.total + 1,
        correct: stats.correct + (result.isCorrect ? 1 : 0),
      },
    })
  },

  nextQuestion: () => {
    get().generateNewQuestion()
  },

  resetStats: () => {
    set({
      stats: {
        total: 0,
        correct: 0,
      },
    })
  },

  setOptions: (options: Partial<QuestionGeneratorOptions>) => {
    set((state) => ({
      options: {
        ...state.options,
        ...options,
      },
    }))
  },

  setQuestion: (question: DrillQuestion) => {
    set({
      currentQuestion: question,
      userAnswer: null,
      judgementResult: null,
      isAnswered: false,
    })
  },
}))
