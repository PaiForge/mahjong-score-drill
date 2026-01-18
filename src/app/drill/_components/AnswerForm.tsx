'use client'

import { useState } from 'react'
import type { UserAnswer } from '@/lib/drill/types'
import { YakuSelect } from './YakuSelect'

interface Props {
  onSubmit: (answer: UserAnswer) => void
  disabled?: boolean
  isTsumo: boolean
  isOya: boolean
  requireYaku?: boolean
  simplifyMangan?: boolean
  requireFuForMangan?: boolean
  onSkip?: () => void
}

const HAN_OPTIONS = [
  { value: '', label: '選択してください' },
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

const SIMPLIFIED_HAN_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 1, label: '1翻' },
  { value: 2, label: '2翻' },
  { value: 3, label: '3翻' },
  { value: 4, label: '4翻' },
  { value: 5, label: '満貫' },
  { value: 6, label: '跳満' },
  { value: 8, label: '倍満' },
  { value: 11, label: '三倍満' },
  { value: 13, label: '役満' },
]

// 符オプション
const FU_OPTIONS = [
  { value: '', label: '選択してください' },
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

export function AnswerForm({ onSubmit, disabled = false, isTsumo, isOya, requireYaku = false, simplifyMangan = false, requireFuForMangan = false, onSkip }: Props) {
  const [han, setHan] = useState<number | null>(null)
  const [fu, setFu] = useState<number | null>(null)
  const [yakus, setYakus] = useState<string[]>([])
  // ロン or 親ツモ用
  const [score, setScore] = useState<string>('')
  // 子ツモ用
  const [scoreFromKo, setScoreFromKo] = useState<string>('')
  const [scoreFromOya, setScoreFromOya] = useState<string>('')

  const isMangan = han !== null && han >= 5
  // 満貫未満、または満貫以上でも符入力が求められている場合は符の入力が必要
  const isFuRequired = !isMangan || requireFuForMangan
  const isKoTsumo = isTsumo && !isOya

  const hanOptions = simplifyMangan ? SIMPLIFIED_HAN_OPTIONS : HAN_OPTIONS

  const handleHanChange = (value: string) => {
    setHan(value === '' ? null : Number(value))
  }

  const handleFuChange = (value: string) => {
    setFu(value === '' ? null : Number(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 翻数は必須
    if (han === null) return
    // 符が必要な場合は必須
    if (isFuRequired && fu === null) return

    // 役入力が必要な場合、役が選択されているかチェックできるが、
    // 現在の仕様では空でもOKとするか、バリデーションを追加するかは要検討
    // いったんそのまま通す（役なし＝空配列）

    // 提出する役リスト（不要なら空にする）
    const submitYakus = requireYaku ? yakus : []

    const submitFu = isFuRequired ? fu : (isMangan ? null : fu)

    if (isKoTsumo) {
      const koScore = parseInt(scoreFromKo, 10)
      const oyaScore = parseInt(scoreFromOya, 10)
      if (isNaN(koScore) || isNaN(oyaScore)) return

      onSubmit({
        han,
        fu: submitFu,
        scoreFromKo: koScore,
        scoreFromOya: oyaScore,
        yakus: submitYakus,
      })
    } else {
      const scoreNum = parseInt(score, 10)
      if (isNaN(scoreNum)) return

      onSubmit({
        han,
        fu: submitFu,
        score: scoreNum,
        yakus: submitYakus,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 役入力 */}
      {requireYaku && (
        <YakuSelect
          value={yakus}
          onChange={setYakus}
          disabled={disabled}
        />
      )}

      {/* 翻数入力 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          翻数
        </label>
        <select
          value={han ?? ''}
          onChange={(e) => handleHanChange(e.target.value)}
          disabled={disabled}
          required
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 ${han === null ? '!text-gray-400' : '!text-gray-900'}`}
        >
          {hanOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 符入力（満貫未満または符入力必須の場合） */}
      {isFuRequired && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            符
          </label>
          <select
            value={fu ?? ''}
            onChange={(e) => handleFuChange(e.target.value)}
            disabled={disabled}
            required
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 ${fu === null ? '!text-gray-400' : '!text-gray-900'}`}
          >
            {FU_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isFuRequired && isMangan && (
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

      {/* スキップ */}
      {onSkip && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 underline text-sm"
          >
            スキップ
          </button>
        </div>
      )}
    </form>
  )
}
