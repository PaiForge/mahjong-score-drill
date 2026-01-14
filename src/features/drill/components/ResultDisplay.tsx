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
        className={`text-center py-3 rounded-lg ${
          result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        <div className="text-base font-bold">
          {result.isCorrect ? '正解!' : '不正解...'}
        </div>
      </div>

      {/* 詳細比較 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left text-gray-600 py-2 pr-4 font-medium"></th>
              <th className="text-left text-gray-600 py-2 pr-4 font-medium">回答</th>
              <th className="text-left text-gray-600 py-2 font-medium">正解</th>
            </tr>
          </thead>
          <tbody>
            {/* 翻 */}
            <tr>
              <td className="text-gray-600 py-2 pr-4 whitespace-nowrap">翻数</td>
              <td className={`py-2 pr-4 ${result.isHanCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {userAnswer.han}翻 {result.isHanCorrect ? '✓' : '✗'}
              </td>
              <td className="text-gray-800 font-bold py-2">
                {answer.han}翻{scoreLevelName && ` (${scoreLevelName})`}
              </td>
            </tr>

            {/* 符 */}
            {!isManganOrAbove && (
              <tr>
                <td className="text-gray-600 py-2 pr-4 whitespace-nowrap">符</td>
                <td className={`py-2 pr-4 ${result.isFuCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {userAnswer.fu ?? '-'}符 {result.isFuCorrect ? '✓' : '✗'}
                </td>
                <td className="text-gray-800 font-bold py-2">
                  {answer.fu}符
                </td>
              </tr>
            )}

            {/* 点数 */}
            <tr>
              <td className="text-gray-600 py-2 pr-4 whitespace-nowrap">点数</td>
              <td className={`py-2 pr-4 ${result.isScoreCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {userAnswer.scoreFromKo !== undefined
                  ? `${userAnswer.scoreFromKo}/${userAnswer.scoreFromOya}`
                  : `${userAnswer.score}点`} {result.isScoreCorrect ? '✓' : '✗'}
              </td>
              <td className="text-gray-800 font-bold py-2">
                {getPaymentDescription()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 次の問題ボタン */}
      <button
        onClick={onNext}
        className="w-full !py-3 !px-6 !bg-blue-600 !text-white font-bold rounded-lg hover:!bg-blue-700 transition-colors"
      >
        次の問題へ
      </button>
    </div>
  )
}
