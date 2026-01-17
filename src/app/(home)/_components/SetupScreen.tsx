'use client'

import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/drill/stores/useSettingsStore'
import { useEffect, useState } from 'react'

export function SetupScreen() {
  const router = useRouter()
  // Hydration mismatch avoidance: wait for client mount
  const [mounted, setMounted] = useState(false)
  const { requireYaku, setRequireYaku, simplifyMangan, setSimplifyMangan } = useSettingsStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    const params = new URLSearchParams()
    if (requireYaku) {
      params.set('mode', 'with_yaku')
    }
    // settings param for future extensibility (though simple=1 is easier for now)
    if (simplifyMangan) {
      params.set('simple', '1')
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-10 border border-slate-100">
        <div className="space-y-3">
          <h1 className="!text-3xl !font-extrabold text-slate-800 tracking-tight">
            麻雀点数計算ドリル
          </h1>
        </div>

        <div className="space-y-6">
          {/* Settings Area */}
          <div className="flex flex-col items-center gap-3">
            <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={requireYaku}
                  onChange={(e) => setRequireYaku(e.target.checked)}
                  className="peer w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                />
              </div>
              <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
                役も回答する
              </span>
            </label>

            <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={simplifyMangan}
                  onChange={(e) => setSimplifyMangan(e.target.checked)}
                  className="peer w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                />
              </div>
              <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
                5翻以降を簡略化
              </span>
            </label>
          </div>

          {/* Main Action */}
          <button
            onClick={handleStart}
            // AnswerFormのボタンと同じスタイルを適用 (!py-3 !px-6 !bg-amber-500 rounded-lg etc)
            className="w-full !py-3 !px-6 !bg-amber-500 !text-white !font-bold !rounded-lg hover:!bg-amber-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>ドリルを開始</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Footer Links */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => router.push('/cheatsheet')}
            className="text-slate-500 hover:text-blue-600 font-medium text-sm py-2 px-4 rounded transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            点数早見表を確認する
          </button>
        </div>
      </div>

      <div className="mt-8 text-slate-400 text-xs">
        © {new Date().getFullYear()} Mahjong Drill
      </div>
    </div>
  )
}
