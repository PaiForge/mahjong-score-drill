import { getPaymentTotal } from '@pai-forge/riichi-mahjong'
import type { DrillQuestion, UserAnswer, JudgementResult } from '../types'
import { isMangan, getScoreLevelName } from '../utils/judgement'

interface Props {
  question: DrillQuestion
  userAnswer: UserAnswer
  result: JudgementResult
  onNext: () => void
}

export function ResultDisplay({ question, userAnswer, result, onNext }: Props) {
  const { answer } = question
  const correctScore = getPaymentTotal(answer.payment)
  const isManganOrAbove = isMangan(answer.scoreLevel)
  const scoreLevelName = getScoreLevelName(answer.scoreLevel)

  const getPaymentDescription = () => {
    const { payment } = answer
    if (payment.type === 'ron') {
      return `ロン ${payment.amount}点`
    }
    if (payment.type === 'koTsumo') {
      return `ツモ ${payment.amount[0]}/${payment.amount[1]} (計${correctScore}点)`
    }
    if (payment.type === 'oyaTsumo') {
      return `ツモ ${payment.amount}オール (計${correctScore}点)`
    }
    return ''
  }

  return (
    <div className="space-y-4">
      {/* 正解/不正解 */}
      <div
        className={`text-center py-4 rounded-lg ${
          result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        <div className="text-2xl font-bold">
          {result.isCorrect ? '正解!' : '不正解...'}
        </div>
      </div>

      {/* 詳細比較 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-bold text-gray-700 border-b pb-2">回答の詳細</h3>

        {/* 翻 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">翻数</span>
          <div className="flex items-center gap-4">
            <span className={result.isHanCorrect ? 'text-green-600' : 'text-red-600'}>
              あなた: {userAnswer.han}翻
              {result.isHanCorrect ? ' ✓' : ' ✗'}
            </span>
            <span className="text-gray-800 font-bold">
              正解: {answer.han}翻
              {scoreLevelName && ` (${scoreLevelName})`}
            </span>
          </div>
        </div>

        {/* 符 */}
        {!isManganOrAbove && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">符</span>
            <div className="flex items-center gap-4">
              <span className={result.isFuCorrect ? 'text-green-600' : 'text-red-600'}>
                あなた: {userAnswer.fu ?? '-'}符
                {result.isFuCorrect ? ' ✓' : ' ✗'}
              </span>
              <span className="text-gray-800 font-bold">
                正解: {answer.fu}符
              </span>
            </div>
          </div>
        )}

        {/* 点数 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">点数</span>
          <div className="flex items-center gap-4">
            <span className={result.isScoreCorrect ? 'text-green-600' : 'text-red-600'}>
              あなた: {userAnswer.scoreFromKo !== undefined
                ? `${userAnswer.scoreFromKo}/${userAnswer.scoreFromOya}`
                : `${userAnswer.score}点`}
              {result.isScoreCorrect ? ' ✓' : ' ✗'}
            </span>
            <span className="text-gray-800 font-bold">
              正解: {getPaymentDescription()}
            </span>
          </div>
        </div>
      </div>

      {/* 次の問題ボタン */}
      <button
        onClick={onNext}
        className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
      >
        次の問題へ
      </button>
    </div>
  )
}
