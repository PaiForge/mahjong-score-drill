'use client'

import { useState } from 'react'
import type { DrillQuestion, UserAnswer, JudgementResult } from '@/lib/problem/types'
import { isMangan, getScoreLevelName } from '@/lib/problem/judgement'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  question: DrillQuestion
  userAnswer: UserAnswer
  result: JudgementResult
  onNext: () => void
  onExit?: () => void
  requireYaku?: boolean
  simplifyMangan?: boolean
  requireFuForMangan?: boolean
}

export function ResultDisplay({ question, userAnswer, result, onNext, onExit, requireYaku = false, simplifyMangan = false, requireFuForMangan = false }: Props) {
  const tProblems = useTranslations('problems')
  const { answer } = question
  const isManganOrAbove = isMangan(answer.scoreLevel)
  const scoreLevelName = getScoreLevelName(answer.scoreLevel)
  const [showFuDetails, setShowFuDetails] = useState(false)
  const [showYakuDetails, setShowYakuDetails] = useState(false)

  const getPaymentDescription = () => {
    const { payment } = answer
    if (payment.type === 'ron') {
      return `${payment.amount}${tProblems('form.labels.score')}`
    }
    if (payment.type === 'koTsumo') {
      return `${payment.amount[0]}/${payment.amount[1]}`
    }
    if (payment.type === 'oyaTsumo') {
      return `${payment.amount}${tProblems('form.options.all')}`
    }
    return ''
  }

  const getHanDisplay = (han: number, scoreLevelName?: string) => {
    if (simplifyMangan && han >= 5) {
      if (scoreLevelName) return scoreLevelName

      if (han >= 13) return tProblems('form.options.yakuman')
      if (han >= 11) return tProblems('form.options.sanbaiman')
      if (han >= 8) return tProblems('form.options.baiman')
      if (han >= 6) return tProblems('form.options.haneman')
      if (han >= 5) return tProblems('form.options.mangan')
    }
    return `${han}${tProblems('form.options.han_suffix')}`
  }

  return (
    <div className="space-y-4">
      {/* 正解/不正解 */}
      <div
        className={cn(
          "text-center py-3 rounded-lg",
          result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}
      >
        <div className="text-base font-bold">
          {result.isCorrect ? tProblems('result.title.correct') : tProblems('result.title.incorrect')}
        </div>
      </div>

      {/* 詳細内容表示（正解・不正解問わず表示） */}
      <div className="bg-slate-50 rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-slate-600 pt-2 pb-3 pr-4 font-bold"></th>
              <th className="text-left text-slate-600 pt-2 pb-3 pr-4 font-bold">{tProblems('result.headers.answer')}</th>
              <th className="text-left text-slate-600 pt-2 pb-3 font-bold">{tProblems('result.headers.correct')}</th>
            </tr>
          </thead>
          <tbody>
            {/* 役 */}
            {requireYaku && (
              <tr>
                <td className="text-slate-600 py-2 pr-4 whitespace-nowrap align-top">{tProblems('form.labels.yaku')}</td>
                <td className="py-2 pr-4 align-top">
                  <div className="flex flex-wrap gap-1">
                    {userAnswer.yakus.length > 0 ? (
                      userAnswer.yakus.map((yaku, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs border",
                            result.isYakuCorrect ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          )}
                        >
                          {yaku}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">{tProblems('result.details.none')}</span>
                    )}
                    <span className={cn("ml-1", result.isYakuCorrect ? 'text-green-600' : 'text-red-600')}>
                      {result.isYakuCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                </td>
                <td className="text-slate-800 font-bold py-2 align-top">
                </td>
              </tr>
            )}

            {/* 翻 */}
            <tr>
              <td className="text-slate-600 py-2 pr-4 whitespace-nowrap">{tProblems('form.labels.han')}</td>
              <td className={cn("py-2 pr-4", result.isHanCorrect ? 'text-green-600' : 'text-red-600')}>
                {getHanDisplay(userAnswer.han)} {result.isHanCorrect ? '✓' : '✗'}
              </td>
              <td className="text-slate-800 font-bold py-2">
                {getHanDisplay(answer.han)}
                {!simplifyMangan && scoreLevelName && ` (${scoreLevelName})`}
                {question.yakuDetails && question.yakuDetails.length > 0 && (
                  <button
                    onClick={() => setShowYakuDetails(!showYakuDetails)}
                    className="ml-2 text-xs text-amber-600 hover:text-amber-800 font-normal focus:outline-none"
                  >
                    {showYakuDetails ? '▲' : '▼'}
                  </button>
                )}
              </td>
            </tr>
            {showYakuDetails && question.yakuDetails && (
              <tr>
                <td colSpan={3} className="py-2">
                  <div className="bg-white rounded px-2 py-0 text-xs text-slate-600">
                    <div>
                      {question.yakuDetails.map((detail, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-100 last:border-0 py-1.5">
                          <span>{detail.name}</span>
                          <span>{detail.han}{tProblems('form.options.han_suffix')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold mt-0 pt-1.5 pb-1.5 border-t border-slate-200">
                      <span>{tProblems('result.details.total')}</span>
                      <span>
                        {question.yakuDetails.reduce((acc, curr) => acc + curr.han, 0)}{tProblems('form.options.han_suffix')}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* 符 (満貫未満、または符入力を要求している場合に表示) */}
            {(!isManganOrAbove || requireFuForMangan) && (
              <>
                <tr>
                  <td className="text-slate-600 py-2 pr-4 whitespace-nowrap">{tProblems('form.labels.fu')}</td>
                  <td className={cn("py-2 pr-4", result.isFuCorrect ? 'text-green-600' : 'text-red-600')}>
                    {userAnswer.fu ?? '-'}{tProblems('form.options.fu_suffix')} {result.isFuCorrect ? '✓' : '✗'}
                  </td>
                  <td className="text-slate-800 font-bold py-2">
                    {answer.fu}{tProblems('form.options.fu_suffix')}
                    {question.fuDetails && (
                      <button
                        onClick={() => setShowFuDetails(!showFuDetails)}
                        className="ml-2 text-xs text-amber-600 hover:text-amber-800 font-normal focus:outline-none"
                      >
                        {showFuDetails ? '▲' : '▼'}
                      </button>
                    )}
                  </td>
                </tr>
                {showFuDetails && question.fuDetails && (
                  <tr>
                    <td colSpan={3} className="py-2">
                      <div className="bg-white rounded px-2 py-0 text-xs text-slate-600">
                        <div>
                          {question.fuDetails.map((detail, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-100 last:border-0 py-1.5">
                              <span>{detail.reason}</span>
                              <span>{detail.fu}{tProblems('form.options.fu_suffix')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between font-bold mt-0 pt-1.5 pb-1.5 border-t border-slate-200">
                          <span>{tProblems('result.details.total')}</span>
                          <span>
                            {question.fuDetails.reduce((acc, curr) => acc + curr.fu, 0)}{tProblems('form.options.fu_suffix')}
                          </span>
                        </div>
                        {question.fuDetails.reduce((acc, curr) => acc + curr.fu, 0) !== answer.fu && (
                          <div className="text-right text-[10px] text-slate-400 mt-1">
                            {question.fuDetails.reduce((acc, curr) => acc + curr.fu, 0)}{tProblems('form.options.fu_suffix')} → {answer.fu}{tProblems('form.options.fu_suffix')} ({tProblems('result.details.roundUp')})
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}

            {/* 点数 */}
            <tr>
              <td className="text-slate-600 py-2 pr-4 whitespace-nowrap">{tProblems('form.labels.score')}</td>
              <td className={cn("py-2 pr-4", result.isScoreCorrect ? 'text-green-600' : 'text-red-600')}>
                {userAnswer.scoreFromKo !== undefined
                  ? `${userAnswer.scoreFromKo}/${userAnswer.scoreFromOya}`
                  : `${userAnswer.score}点`} {result.isScoreCorrect ? '✓' : '✗'}
              </td>
              <td className="text-slate-800 font-bold py-2">
                {getPaymentDescription()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 次の問題ボタン */}
      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
      >
        {tProblems('result.next')}
      </button>

      {/* 終了する */}
      {onExit && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onExit}
            className="text-slate-500 hover:text-slate-600 underline text-sm"
          >
            {tProblems('form.buttons.exit')}
          </button>
        </div>
      )}
    </div>
  )
}
