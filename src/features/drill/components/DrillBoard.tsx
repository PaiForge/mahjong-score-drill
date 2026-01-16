import { useEffect, useState } from 'react'
import { HaiKind } from '@pai-forge/riichi-mahjong'
import { useDrillStore } from '../stores/useDrillStore'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerForm } from './AnswerForm'
import { ResultDisplay } from './ResultDisplay'
import { generateQuestionFromQuery } from '../utils/queryQuestionGenerator'
import type { UserAnswer } from '../types'

interface DrillBoardProps {
  onBackToSetup: () => void
}

export function DrillBoard({ onBackToSetup }: DrillBoardProps) {
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

  // 初回マウント時に問題を生成
  useEffect(() => {
    if (!currentQuestion) {
      // URLパラメータからの生成を試みる
      const params = new URLSearchParams(window.location.search)
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
    }
  }, [currentQuestion, generateNewQuestion])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">エラー (無効なパラメータ)</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => {
              // クエリパラメータを削除してリロード（ランダム生成へ）
              window.history.replaceState(null, '', window.location.pathname);
              setError(null);
              generateNewQuestion();
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

  const handleSubmit = (answer: UserAnswer) => {
    submitAnswer(answer)
    // URLパラメータを削除
    window.history.replaceState(null, '', window.location.pathname)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-1 sm:px-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4 sm:mb-6 px-2 sm:px-0">
          <button
            onClick={onBackToSetup}
            className="text-xl sm:text-2xl font-bold text-gray-800 hover:opacity-75 transition-opacity text-left"
          >
            麻雀点数計算ドリル
          </button>
          <div className="text-sm text-gray-600">
            {stats.correct} / {stats.total} 正解
            {stats.total > 0 && (
              <span className="ml-2">
                ({Math.round((stats.correct / stats.total) * 100)}%)
              </span>
            )}
          </div>
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
            />
          ) : (
            <AnswerForm
              key={stats.total}
              onSubmit={handleSubmit}
              disabled={isAnswered}
              isTsumo={currentQuestion.isTsumo}
              isOya={currentQuestion.jikaze === HaiKind.Ton}
            />
          )}
        </div>
      </div>
    </div>
  )
}
