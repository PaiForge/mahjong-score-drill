import { getPaymentTotal } from '@pai-forge/riichi-mahjong'
import type { DrillQuestion, UserAnswer, JudgementResult } from '../types'

// ScoreLevel定数（ライブラリのメインエクスポートにないためローカル定義）
const ScoreLevel = {
  Normal: 'Normal',
  Mangan: 'Mangan',
  Haneman: 'Haneman',
  Baiman: 'Baiman',
  Sanbaiman: 'Sanbaiman',
  Yakuman: 'Yakuman',
  DoubleYakuman: 'DoubleYakuman',
} as const

/**
 * 満貫以上かどうかを判定
 */
export function isMangan(scoreLevel: string): boolean {
  return (
    scoreLevel === ScoreLevel.Mangan ||
    scoreLevel === ScoreLevel.Haneman ||
    scoreLevel === ScoreLevel.Baiman ||
    scoreLevel === ScoreLevel.Sanbaiman ||
    scoreLevel === ScoreLevel.Yakuman ||
    scoreLevel === ScoreLevel.DoubleYakuman
  )
}

/**
 * ユーザーの回答を判定
 */
export function judgeAnswer(
  question: DrillQuestion,
  userAnswer: UserAnswer
): JudgementResult {
  const { answer } = question
  const correctScore = getPaymentTotal(answer.payment)
  const isManganOrAbove = isMangan(answer.scoreLevel)

  // 翻の判定
  const isHanCorrect = userAnswer.han === answer.han

  // 符の判定（満貫以上は常に正解扱い）
  const isFuCorrect = isManganOrAbove || userAnswer.fu === answer.fu

  // 点数の判定
  const isScoreCorrect = userAnswer.score === correctScore

  // 総合判定
  const isCorrect = isHanCorrect && isFuCorrect && isScoreCorrect

  return {
    isCorrect,
    isHanCorrect,
    isFuCorrect,
    isScoreCorrect,
  }
}

/**
 * 点数レベルを日本語に変換
 */
export function getScoreLevelName(scoreLevel: string): string {
  switch (scoreLevel) {
    case ScoreLevel.Normal:
      return ''
    case ScoreLevel.Mangan:
      return '満貫'
    case ScoreLevel.Haneman:
      return '跳満'
    case ScoreLevel.Baiman:
      return '倍満'
    case ScoreLevel.Sanbaiman:
      return '三倍満'
    case ScoreLevel.Yakuman:
      return '役満'
    case ScoreLevel.DoubleYakuman:
      return 'ダブル役満'
    default:
      return ''
  }
}
