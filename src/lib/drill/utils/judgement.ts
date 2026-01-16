import type { DrillQuestion, UserAnswer, JudgementResult } from '@/lib/drill/types'
import { IGNORE_YAKU_FOR_JUDGEMENT } from '@/lib/drill/constants'

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
 * 点数の判定
 */
function judgeScore(
  payment: DrillQuestion['answer']['payment'],
  userAnswer: UserAnswer
): boolean {
  switch (payment.type) {
    case 'ron':
      return userAnswer.score === payment.amount
    case 'oyaTsumo':
      // 親ツモ: オールなので単一の点数
      return userAnswer.score === payment.amount
    case 'koTsumo':
      // 子ツモ: [子からの点数, 親からの点数]
      return (
        userAnswer.scoreFromKo === payment.amount[0] &&
        userAnswer.scoreFromOya === payment.amount[1]
      )
  }
}

/**
 * 役の判定
 * ドラ・裏ドラなどは無視して比較する
 */
function judgeYaku(
  answerYakuDetails: DrillQuestion['yakuDetails'],
  userYakus: string[]
): boolean {
  if (!answerYakuDetails) return userYakus.length === 0

  // 正解データから判定対象外の役（ドラなど）を除外してセット化
  const expectedYakus = new Set(
    answerYakuDetails
      .map(d => d.name)
      .filter(name => !IGNORE_YAKU_FOR_JUDGEMENT.includes(name))
  )

  // ユーザー回答もセット化
  const userYakuSet = new Set(userYakus)

  // サイズチェック
  if (expectedYakus.size !== userYakuSet.size) return false

  // 内容チェック
  for (const yaku of expectedYakus) {
    if (!userYakuSet.has(yaku)) return false
  }

  return true
}

/**
 * ユーザーの回答を判定
 */
export function judgeAnswer(
  question: DrillQuestion,
  userAnswer: UserAnswer
): JudgementResult {
  const { answer } = question
  const isManganOrAbove = isMangan(answer.scoreLevel)

  // 翻の判定
  const isHanCorrect = userAnswer.han === answer.han

  // 符の判定（満貫以上は常に正解扱い）
  const isFuCorrect = isManganOrAbove || userAnswer.fu === answer.fu

  // 点数の判定
  const isScoreCorrect = judgeScore(answer.payment, userAnswer)

  // 役の判定
  const isYakuCorrect = judgeYaku(question.yakuDetails, userAnswer.yakus)

  // 総合判定
  const isCorrect = isHanCorrect && isFuCorrect && isScoreCorrect && isYakuCorrect

  return {
    isCorrect,
    isHanCorrect,
    isFuCorrect,
    isScoreCorrect,
    isYakuCorrect,
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
