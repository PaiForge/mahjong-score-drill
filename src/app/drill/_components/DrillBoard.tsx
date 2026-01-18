'use client'

import { useEffect, useState, useSyncExternalStore, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HaiKind } from '@pai-forge/riichi-mahjong'
import { useDrillStore } from '@/lib/drill/stores/useDrillStore'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerForm } from './AnswerForm'
import { ResultDisplay } from './ResultDisplay'
import { generateQuestionFromQuery } from '@/lib/drill/utils/queryQuestionGenerator'
import type { UserAnswer } from '@/lib/drill/types'

// SSR安全なクライアント判定フック
function useIsClient() {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  )
}

export function DrillBoard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    currentQuestion,
    userAnswer,
    judgementResult,
    isAnswered,
    stats,
    generateNewQuestion,
    submitAnswer,
    nextQuestion,
  } = useDrillStore()

  const [error, setError] = useState<string | null>(null)
  const isClient = useIsClient()
  const initializedRef = useRef(false)

  // 初回マウント時に問題を生成
  const initializeQuestion = useCallback(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // パラメータ取得
    const params = new URLSearchParams(searchParams.toString())
    const hasQueryParams = params.has('tehai') || params.has('agari') || params.has('dora')

    // URLパラメータからの生成を試みる
    // URLパラメータからの生成を試みる
    if (hasQueryParams) {
      const queryResult = generateQuestionFromQuery(params)

      if (queryResult) {
        if (queryResult.type === 'success') {
          useDrillStore.getState().setQuestion(queryResult.question)
        } else {
          setError(queryResult.message)
        }
      } else {
        generateNewQuestion()
      }
    } else {
      // 範囲設定の読み込み
      const rangesParam = params.getAll('ranges') // Next.js read of comma separated? No, standard URLSearchParams.
      // SetupScreen uses params.append, so it might be ranges=non&ranges=plus or ranges=non,plus depending on implementation.
      // SetupScreen implementation: params.append('ranges', 'non'), params.append('ranges', 'plus').
      // So getAll is correct.

      const allowedRanges: ('non_mangan' | 'mangan_plus')[] = []
      // getAll returns array of values.
      const rangesValues = params.getAll('ranges')

      if (rangesValues.length > 0) {
        if (rangesValues.includes('non')) allowedRanges.push('non_mangan')
        if (rangesValues.includes('plus')) allowedRanges.push('mangan_plus')
      } else {
        // デフォルト: 両方
        allowedRanges.push('non_mangan', 'mangan_plus')
      }

      useDrillStore.getState().setOptions({
        allowedRanges
      })

      generateNewQuestion()
    }
  }, [searchParams, generateNewQuestion])

  useEffect(() => {
    if (isClient && !currentQuestion) {
      initializeQuestion()
    }
  }, [isClient, currentQuestion, initializeQuestion])

  const handleBackToSetup = () => {
    router.push('/')
  }

  // サーバーサイドレンダリング時はローディング表示
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">エラー (無効なパラメータ)</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => {
              // クエリパラメータを削除してリロード（ランダム生成へ）
              router.replace('/drill')
              setError(null)
              generateNewQuestion()
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            ランダム問題へ戻る
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">問題を生成中...</div>
      </div>
    )
  }

  const requireYaku = searchParams.get('mode') === 'with_yaku'
  const simplifyMangan = searchParams.get('simple') === '1'
  const requireFuForMangan = searchParams.get('fu_mangan') === '1'
  const autoNext = searchParams.get('auto_next') === '1'

  const handleSubmit = (answer: UserAnswer) => {
    submitAnswer(answer, requireYaku, simplifyMangan, requireFuForMangan)

    // 正解したらすぐに次の問題へ（autoNext有効時）
    if (autoNext) {
      const state = useDrillStore.getState()
      if (state.judgementResult?.isCorrect) {
        nextQuestion()

        // URLパラメータを維持（nextQuestionだけだとパラメータ維持されるが、念の為）
        // 実際にはnextQuestionはstoreのgenerateNewQuestionを呼ぶだけでURL変更しないので、
        // ここでのhandleSubmit内のrouterへのreplaceは不要かもしれないが、
        // 既存実装ではreplaceしているのでそれに倣う。
        // ただし、nextQuestion呼んだ後だとstateが変わってるので、
        // 下記のparam更新フローは「結果表示」のためのものだったかもしれない。
        // 結果表示をスキップするなら、param更新だけして終わり？
        // いや、既存コードは submitAnswer -> router.replace 重複している？
        // 既存コード： submitAnswer したあと、 params を作って router.replace している。
        // これは「結果画面」でもパラメータを維持するため。
        // autoNextの場合は、すぐに次の問題になるので、次の問題のためのパラメータ維持が必要。
        // しかし nextQuestion() は store の state を変えるだけで URL は変えない。
        // なので、ここで router.replace するのは正しい。
      }
    }

    // URLパラメータを維持
    const params = new URLSearchParams()
    if (requireYaku) params.set('mode', 'with_yaku')
    if (simplifyMangan) params.set('simple', '1')
    if (requireFuForMangan) params.set('fu_mangan', '1')
    if (autoNext) params.set('auto_next', '1')


    // 現在のパラメータからrangesを引き継ぐ
    const currentParams = new URLSearchParams(searchParams.toString())
    const ranges = currentParams.getAll('ranges')
    ranges.forEach(r => params.append('ranges', r))

    const queryString = params.toString()
    router.replace(queryString ? `/drill?${queryString}` : '/drill')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-1 sm:px-4">
        {/* ヘッダー */}
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-0">
          <button
            onClick={handleBackToSetup}
            className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </button>
        </div>

        {/* 問題表示 */}
        <div className="bg-white rounded-lg shadow-md p-2 sm:p-6 mb-4 sm:mb-6">
          <QuestionDisplay question={currentQuestion} />
        </div>

        {/* 回答エリア */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {isAnswered && userAnswer && judgementResult ? (
            <ResultDisplay
              question={currentQuestion}
              userAnswer={userAnswer}
              result={judgementResult}
              onNext={nextQuestion}
              requireYaku={requireYaku}
              simplifyMangan={simplifyMangan}
              requireFuForMangan={requireFuForMangan}
            />
          ) : (
            <AnswerForm
              key={stats.total}
              onSubmit={handleSubmit}
              disabled={isAnswered}
              isTsumo={currentQuestion.isTsumo}
              isOya={currentQuestion.jikaze === HaiKind.Ton}
              requireYaku={requireYaku}
              simplifyMangan={simplifyMangan}
              requireFuForMangan={requireFuForMangan}
              onSkip={nextQuestion}
            />
          )}
        </div>
      </div>
    </div>
  )
}
