import { useEffect } from 'react'
import { useDrillStore } from '../stores/useDrillStore'
import { QuestionDisplay } from './QuestionDisplay'
import { AnswerForm } from './AnswerForm'
import { ResultDisplay } from './ResultDisplay'

export function DrillBoard() {
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

  // 初回マウント時に問題を生成
  useEffect(() => {
    if (!currentQuestion) {
      generateNewQuestion()
    }
  }, [currentQuestion, generateNewQuestion])

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">問題を生成中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            麻雀点数計算ドリル
          </h1>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <QuestionDisplay question={currentQuestion} />
        </div>

        {/* 回答エリア */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {isAnswered && userAnswer && judgementResult ? (
            <ResultDisplay
              question={currentQuestion}
              userAnswer={userAnswer}
              result={judgementResult}
              onNext={nextQuestion}
            />
          ) : (
            <AnswerForm onSubmit={submitAnswer} disabled={isAnswered} />
          )}
        </div>
      </div>
    </div>
  )
}
