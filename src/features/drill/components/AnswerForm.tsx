import { useState } from 'react'
import type { UserAnswer } from '../types'

interface Props {
  onSubmit: (answer: UserAnswer) => void
  disabled?: boolean
}

const HAN_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const FU_OPTIONS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]

export function AnswerForm({ onSubmit, disabled = false }: Props) {
  const [han, setHan] = useState<number>(1)
  const [fu, setFu] = useState<number | null>(30)
  const [score, setScore] = useState<string>('')
  const [isMangan, setIsMangan] = useState(false)

  const handleHanChange = (value: number) => {
    setHan(value)
    // 5翻以上は満貫以上
    if (value >= 5) {
      setIsMangan(true)
      setFu(null)
    } else {
      setIsMangan(false)
      if (fu === null) setFu(30)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const scoreNum = parseInt(score, 10)
    if (isNaN(scoreNum)) return

    onSubmit({
      han,
      fu: isMangan ? null : fu,
      score: scoreNum,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 翻数入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          翻数
        </label>
        <div className="flex flex-wrap gap-2">
          {HAN_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => handleHanChange(h)}
              disabled={disabled}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                han === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              {h}翻
            </button>
          ))}
        </div>
      </div>

      {/* 符入力（満貫未満のみ） */}
      {!isMangan && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            符
          </label>
          <div className="flex flex-wrap gap-2">
            {FU_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFu(f)}
                disabled={disabled}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  fu === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                {f}符
              </button>
            ))}
          </div>
        </div>
      )}

      {isMangan && (
        <div className="text-sm text-gray-500 italic">
          5翻以上のため符の入力は不要です
        </div>
      )}

      {/* 点数入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          点数（和了者が受け取る総点数）
        </label>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          disabled={disabled}
          placeholder="例: 7700"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-400 mt-1">
          ツモの場合は全員からの合計点数を入力してください
        </p>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={disabled || !score}
        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        回答する
      </button>
    </form>
  )
}
