'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HaiKind } from '@pai-forge/riichi-mahjong'
import { Toaster, toast } from 'react-hot-toast'
import { useDrillStore } from '@/lib/problem/stores/useDrillStore'
import { useScoreTableStore } from '@/lib/problem/stores/useScoreTableStore'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerForm } from './AnswerForm'
import { ResultDisplay } from './ResultDisplay'
import { generateQuestionFromQuery, generatePathAndQueryFromQuestion } from '@/lib/problem/queryGenerator'
import type { UserAnswer } from '@/lib/problem/types'
import { useTranslations } from 'next-intl'

/** 現在の searchParams からオプションパラメータを引き継いだ URLSearchParams を構築する */
function buildDrillQueryParams(
  searchParams: URLSearchParams,
  overrides?: URLSearchParams
): URLSearchParams {
  const params = overrides ?? new URLSearchParams()

  const optionKeys = ['mode', 'simple', 'fu_mangan', 'auto_next'] as const
  for (const key of optionKeys) {
    if (searchParams.has(key) && !params.has(key)) {
      params.set(key, searchParams.get(key)!)
    }
  }

  const multiValueKeys = ['ranges', 'roles'] as const
  for (const key of multiValueKeys) {
    if (!params.has(key)) {
      const values = searchParams.getAll(key)
      values.forEach(v => params.append(key, v))
    }
  }

  return params
}

// SSR安全なクライアント判定フック
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}

export function DrillBoard() {
  const tProblems = useTranslations('problems')
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

  const { setHighlightedCellId } = useScoreTableStore()

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
    const hasQueryParams = params.has('tehai') || params.has('agari') || params.has('dora')

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
      // SetupScreen の実装: params.append('ranges', 'non'), params.append('ranges', 'plus')
      // なので getAll が正しい
      const allowedRanges: ('non_mangan' | 'mangan_plus')[] = []
      const rangesValues = params.getAll('ranges')

      if (rangesValues.length > 0) {
        if (rangesValues.includes('non')) allowedRanges.push('non_mangan')
        if (rangesValues.includes('plus')) allowedRanges.push('mangan_plus')
      } else {
        // デフォルト: 両方
        allowedRanges.push('non_mangan', 'mangan_plus')
      }

      // roles=oya,ko
      let includeParent = true
      let includeChild = true
      const rolesValues = params.getAll('roles')
      if (rolesValues.length > 0) {
        includeParent = rolesValues.includes('oya')
        includeChild = rolesValues.includes('ko')
      }

      useDrillStore.getState().setOptions({
        allowedRanges,
        includeParent,
        includeChild
      })

      generateNewQuestion()

      const newQuestion = useDrillStore.getState().currentQuestion
      if (newQuestion) {
        const newUrlBase = generatePathAndQueryFromQuestion(newQuestion)
        const urlObj = new URL(newUrlBase, 'http://dummy.com')
        const currentParams = new URLSearchParams(searchParams.toString())
        buildDrillQueryParams(currentParams, urlObj.searchParams)
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
    router.push('/problems/score')
  }

  // サーバーサイドレンダリング時はローディング表示
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">{tProblems('loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">{tProblems('error.title')}</h2>
          <p className="text-slate-700 mb-6">{error}</p>
          <button
            onClick={() => {
              // クエリパラメータを削除してリロード（ランダム生成へ）
              router.replace('/problems/score/play')
              setError(null)
              generateNewQuestion()
            }}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded"
          >
            {tProblems('error.backToRandom')}
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">{tProblems('generating')}</div>
      </div>
    )
  }

  const requireYaku = searchParams.get('mode') === 'with_yaku'
  const simplifyMangan = searchParams.get('simple') === '1'
  const requireFuForMangan = searchParams.get('fu_mangan') === '1'
  const autoNext = searchParams.get('auto_next') === '1'

  const handleNext = () => {
    setHighlightedCellId(null)
    nextQuestion()
    const newQuestion = useDrillStore.getState().currentQuestion
    if (newQuestion) {
      const newUrlBase = generatePathAndQueryFromQuestion(newQuestion)
      const urlObj = new URL(newUrlBase, 'http://dummy.com')
      const currentParams = new URLSearchParams(searchParams.toString())
      buildDrillQueryParams(currentParams, urlObj.searchParams)
      router.push(urlObj.pathname + urlObj.search)
    }
  }

  const handleSubmit = (answer: UserAnswer) => {
    submitAnswer(answer, requireYaku, simplifyMangan, requireFuForMangan)

    // 正解したらすぐに次の問題へ（autoNext有効時）
    if (autoNext) {
      const state = useDrillStore.getState()
      if (state.judgementResult?.isCorrect) {
        toast.success(tProblems('board.correct'), {
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

    const currentParams = new URLSearchParams(searchParams.toString())
    const params = buildDrillQueryParams(currentParams)
    const queryString = params.toString()
    router.replace(queryString ? `/problems/score/play?${queryString}` : '/problems/score/play')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8">
      <Toaster />
      <div className="max-w-2xl mx-auto px-1 sm:px-4">
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
              onExit={handleBackToSetup}
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
              onExit={handleBackToSetup}
            />
          )}
        </div>
      </div>
    </div>
  )
}
