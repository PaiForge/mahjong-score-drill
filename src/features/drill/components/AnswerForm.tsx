import { useState } from 'react'
import type { UserAnswer } from '../types'

interface Props {
  onSubmit: (answer: UserAnswer) => void
  disabled?: boolean
  isTsumo: boolean
  isOya: boolean
}

// 翻数オプション（1〜13翻 + 役満）
const HAN_OPTIONS = [
  { value: 1, label: '1翻' },
  { value: 2, label: '2翻' },
  { value: 3, label: '3翻' },
  { value: 4, label: '4翻' },
  { value: 5, label: '5翻' },
  { value: 6, label: '6翻' },
  { value: 7, label: '7翻' },
  { value: 8, label: '8翻' },
  { value: 9, label: '9翻' },
  { value: 10, label: '10翻' },
  { value: 11, label: '11翻' },
  { value: 12, label: '12翻' },
  { value: 13, label: '役満' },
]

// 符オプション
const FU_OPTIONS = [
  { value: 20, label: '20符' },
  { value: 25, label: '25符' },
  { value: 30, label: '30符' },
  { value: 40, label: '40符' },
  { value: 50, label: '50符' },
  { value: 60, label: '60符' },
  { value: 70, label: '70符' },
  { value: 80, label: '80符' },
  { value: 90, label: '90符' },
  { value: 100, label: '100符' },
  { value: 110, label: '110符' },
]

export function AnswerForm({ onSubmit, disabled = false, isTsumo, isOya }: Props) {
  const [han, setHan] = useState<number>(1)
  const [fu, setFu] = useState<number>(30)
  // ロン or 親ツモ用
  const [score, setScore] = useState<string>('')
  // 子ツモ用
  const [scoreFromKo, setScoreFromKo] = useState<string>('')
  const [scoreFromOya, setScoreFromOya] = useState<string>('')

  const isMangan = han >= 5
  const isKoTsumo = isTsumo && !isOya

  const handleHanChange = (value: number) => {
    setHan(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isKoTsumo) {
      const koScore = parseInt(scoreFromKo, 10)
      const oyaScore = parseInt(scoreFromOya, 10)
      if (isNaN(koScore) || isNaN(oyaScore)) return

      onSubmit({
        han,
        fu: isMangan ? null : fu,
        scoreFromKo: koScore,
        scoreFromOya: oyaScore,
      })
    } else {
      const scoreNum = parseInt(score, 10)
      if (isNaN(scoreNum)) return

      onSubmit({
        han,
        fu: isMangan ? null : fu,
        score: scoreNum,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 翻数入力 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          翻数
        </label>
        <select
          value={han}
          onChange={(e) => handleHanChange(Number(e.target.value))}
          disabled={disabled}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
        >
          {HAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 符入力（満貫未満のみ） */}
      {!isMangan && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            符
          </label>
          <select
            value={fu}
            onChange={(e) => setFu(Number(e.target.value))}
            disabled={disabled}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
          >
            {FU_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isMangan && (
        <div className="text-sm text-gray-500 italic">
          5翻以上のため符の入力は不要です
        </div>
      )}

      {/* 点数入力 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          点数
        </label>
        {isKoTsumo ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={scoreFromKo}
                onChange={(e) => setScoreFromKo(e.target.value)}
                disabled={disabled}
                required
                placeholder="子から"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
              />
            </div>
            <span className="text-gray-500 font-medium">/</span>
            <div className="flex-1">
              <input
                type="number"
                value={scoreFromOya}
                onChange={(e) => setScoreFromOya(e.target.value)}
                disabled={disabled}
                required
                placeholder="親から"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        ) : (
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            disabled={disabled}
            required
            placeholder={isOya && isTsumo ? '例: 4000（オール）' : '例: 7700'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
          />
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={disabled}
        className="w-full !py-3 !px-6 !bg-amber-500 !text-white font-bold rounded-lg hover:!bg-amber-600 transition-colors disabled:!bg-gray-400 disabled:!text-gray-200 disabled:cursor-not-allowed"
      >
        回答する
      </button>
    </form>
  )
}
