'use client'

import { useEffect, useState, useSyncExternalStore, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HaiKind } from '@pai-forge/riichi-mahjong'
import { Toaster, toast } from 'react-hot-toast'
import { useDrillStore } from '@/lib/drill/stores/useDrillStore'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerForm } from './AnswerForm'
import { ResultDisplay } from './ResultDisplay'
import { generateQuestionFromQuery, generatePathAndQueryFromQuestion } from '@/lib/drill/utils/queryQuestionGenerator'
import type { UserAnswer } from '@/lib/drill/types'

// SSR安全なクライアント判定フック
function useIsClient() {
  return useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  )
}

// Static Export対応: Dynamic Route ではなく Query Parameters を使用する
// export function DrillBoard({ initialTehai }: DrillBoardProps) {
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
    // Static Export対応: propsからの初期化は行わず、常にクエリパラメータまたはランダム生成を使用
    /*
    if (initialTehai) {
      params.set('tehai', initialTehai)
    }
    */
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
      const rangesParam = params.getAll('ranges') // Next.js の仕様確認: 標準の URLSearchParams と同じ
      // SetupScreen では params.append を使用しているため、実装によっては ranges=non&ranges=plus のようになるか、ranges=non,plus のようになる可能性がある
      // SetupScreen の実装: params.append('ranges', 'non'), params.append('ranges', 'plus')
      // なので getAll が正しい
      // getAll は値の配列を返す

      const allowedRanges: ('non_mangan' | 'mangan_plus')[] = []
      // getAll は値の配列を返す
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

      // ランダム生成後、即座にクエリパラメータ付きURLへ遷移
      const newQuestion = useDrillStore.getState().currentQuestion
      if (newQuestion) {
        // generatePathAndQueryFromQuestion は /problems/score?tehai=... を返す
        const newUrlBase = generatePathAndQueryFromQuestion(newQuestion)
        const urlObj = new URL(newUrlBase, 'http://dummy.com')

        // オプション定義 (rangesなど) は維持したいが、generateNewQuestionでstoreに入っているので
        // 次回のレンダリングで正しいはずだが、URLには残しておきたい
        const currentParams = new URLSearchParams(searchParams.toString())
        const ranges = currentParams.getAll('ranges')
        ranges.forEach(r => urlObj.searchParams.append('ranges', r))

        // modeなども維持
        if (searchParams.has('mode')) urlObj.searchParams.set('mode', searchParams.get('mode')!)
        if (searchParams.has('simple')) urlObj.searchParams.set('simple', searchParams.get('simple')!)
        if (searchParams.has('fu_mangan')) urlObj.searchParams.set('fu_mangan', searchParams.get('fu_mangan')!)
        if (searchParams.has('auto_next')) urlObj.searchParams.set('auto_next', searchParams.get('auto_next')!)

        router.replace(urlObj.pathname + urlObj.search)
      }
    }
  }, [searchParams, generateNewQuestion, router])

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
              router.replace('/problems/score')
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

  const handleNext = () => {
    nextQuestion()
    // 新しいURLへ遷移
    const newQuestion = useDrillStore.getState().currentQuestion
    if (newQuestion) {
      // 現在のオプションパラメータを引き継ぐ (generatePathAndQueryFromQuestion は /problems/score?tehai=... を返す)
      const newUrlBase = generatePathAndQueryFromQuestion(newQuestion)
      const urlObj = new URL(newUrlBase, 'http://dummy.com')

      if (requireYaku) urlObj.searchParams.set('mode', 'with_yaku')
      if (simplifyMangan) urlObj.searchParams.set('simple', '1')
      if (requireFuForMangan) urlObj.searchParams.set('fu_mangan', '1')
      if (autoNext) urlObj.searchParams.set('auto_next', '1')

      // ranges
      const currentParams = new URLSearchParams(searchParams.toString())
      const ranges = currentParams.getAll('ranges')
      ranges.forEach(r => urlObj.searchParams.append('ranges', r))

      // パスパラメータではなくクエリパラメータのみを使用するため、pathnameは固定でQueryStringを付与
      router.push(urlObj.pathname + urlObj.search)
    }
  }

  const handleSubmit = (answer: UserAnswer) => {
    submitAnswer(answer, requireYaku, simplifyMangan, requireFuForMangan)

    // 正解したらすぐに次の問題へ（autoNext有効時）
    if (autoNext) {
      const state = useDrillStore.getState()
      if (state.judgementResult?.isCorrect) {
        toast.success('正解！', {
          duration: 1500,
          position: 'top-center',
          icon: '✅',
          style: {
            background: '#E6FFFA',
            color: '#2C7A7B',
            fontWeight: 'bold',
          },
        })
        toast.success('正解！', {
          duration: 1500,
          position: 'top-center',
          icon: '✅',
          style: {
            background: '#E6FFFA',
            color: '#2C7A7B',
            fontWeight: 'bold',
          },
        })
        handleNext()

        // URLパラメータを維持（nextQuestionだけだとパラメータ維持されるが、念の為）
        // handleNext() 内で遷移するのでここは不要
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
    router.replace(queryString ? `/problems/score?${queryString}` : '/problems/score')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <Toaster />
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
              onNext={handleNext}
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
              onSkip={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  )
}
