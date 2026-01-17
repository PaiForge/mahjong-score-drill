'use client'

import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/drill/stores/useSettingsStore'
import { useEffect, useState } from 'react'

export function SetupScreen() {
  const router = useRouter()
  // Hydration mismatch avoidance: wait for client mount
  const [mounted, setMounted] = useState(false)
  const { requireYaku, setRequireYaku } = useSettingsStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    const params = new URLSearchParams()
    if (requireYaku) {
      params.set('mode', 'with_yaku')
    }
    const queryString = params.toString()
    router.push(queryString ? `/drill?${queryString}` : '/drill')
  }

  // Prevent hydration mismatch by rendering a placeholder or default until mounted
  // For interaction elements like checkboxes, it's safer to wait or render consistent server state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 text-center space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              麻雀点数計算ドリル
            </h1>
            <p className="text-gray-600">
              読み込み中...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            麻雀点数計算ドリル
          </h1>
          <p className="text-gray-600">
            ランダムに出題される点数計算問題を解いて、
            <br />
            計算力を鍛えましょう。
          </p>
        </div>

        <div className="space-y-4 w-full">
          <label className="flex items-center justify-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={requireYaku}
              onChange={(e) => setRequireYaku(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium select-none ml-3">役も回答する</span>
          </label>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-sm"
          >
            スタート
          </button>

          <button
            onClick={() => router.push('/cheatsheet')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-lg border border-gray-300 transition-colors shadow-sm"
          >
            点数早見表
          </button>
        </div>
      </div>
    </div>
  )
}
