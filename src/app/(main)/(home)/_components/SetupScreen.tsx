'use client'

import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/lib/problem/stores/useSettingsStore'
import { cn } from '@/lib/utils'
import { useDrillStore } from '@/lib/problem/stores/useDrillStore'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function SetupScreen({ className, hideDrillLinks = false, hideTitle = false }: { className?: string, hideDrillLinks?: boolean, hideTitle?: boolean }) {
  const tHome = useTranslations('home')
  const router = useRouter()
  // Hydration mismatch avoidance: wait for client mount
  const [mounted, setMounted] = useState(false)
  const {
    requireYaku, setRequireYaku,
    simplifyMangan, setSimplifyMangan,
    requireFuForMangan, setRequireFuForMangan,
    targetScoreRanges, setTargetScoreRanges,
    autoNext, setAutoNext,
    includeParent, setIncludeParent,
    includeChild, setIncludeChild
  } = useSettingsStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    const params = new URLSearchParams()
    if (requireYaku) {
      params.set('mode', 'with_yaku')
    }
    if (simplifyMangan) {
      params.set('simple', '1')
    }
    if (requireFuForMangan) {
      params.set('fu_mangan', '1')
    }
    if (autoNext) {
      params.set('auto_next', '1')
    }
    // ranges=non,plus
    if (targetScoreRanges.length > 0 && targetScoreRanges.length < 2) {
      if (targetScoreRanges.includes('non_mangan')) params.append('ranges', 'non')
      if (targetScoreRanges.includes('mangan_plus')) params.append('ranges', 'plus')
    }

    // roles=oya,ko
    if (includeParent) params.append('roles', 'oya')
    if (includeChild) params.append('roles', 'ko')

    // Reset current question to force re-initialization in DrillBoard
    useDrillStore.getState().setQuestion(null as any)

    const queryString = params.toString()
    // Preserve language param if exists
    if (typeof window !== 'undefined') {
      const currentUrlParams = new URLSearchParams(window.location.search)
      const lang = currentUrlParams.get('lang')
      if (lang) {
        if (queryString) {
          router.push(`/problems/score/play?${queryString}&lang=${lang}`)
        } else {
          router.push(`/problems/score/play?lang=${lang}`)
        }
        return
      }
    }

    router.push(queryString ? `/problems/score/play?${queryString}` : '/problems/score/play')
  }

  const handleToggleRange = (range: 'non_mangan' | 'mangan_plus') => {
    if (targetScoreRanges.includes(range)) {
      setTargetScoreRanges(targetScoreRanges.filter(r => r !== range))
    } else {
      setTargetScoreRanges([...targetScoreRanges, range])
    }
  }

  if (!mounted) {
    return (
      <div className={cn("bg-white rounded-lg shadow-md w-full max-w-md p-8 text-center space-y-8", className)}>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            ...
          </h1>
          <p className="text-slate-600">
            ...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-10 border border-slate-100", className)}>
      {!hideTitle && (
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {tHome('title')}
          </h1>
        </div>
      )}

      <div className="space-y-6">
        {/* Settings Area */}
        <div className="flex flex-col items-center gap-3">
          <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={requireYaku}
                onChange={(e) => setRequireYaku(e.target.checked)}
                className="peer w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
              />
            </div>
            <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
              {tHome('setup.settings.requireYaku')}
            </span>
          </label>

          <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={simplifyMangan}
                onChange={(e) => setSimplifyMangan(e.target.checked)}
                className="peer w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
              />
            </div>
            <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
              {tHome('setup.settings.simplifyMangan')}
            </span>
          </label>

          <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={requireFuForMangan}
                onChange={(e) => setRequireFuForMangan(e.target.checked)}
                className="peer w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
              />
            </div>
            <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
              {tHome('setup.settings.requireFu')}
            </span>
          </label>

          <label className="group inline-flex items-center space-x-3 py-3 px-5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 w-full justify-center">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                className="peer w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
              />
            </div>
            <span className="text-slate-700 font-semibold select-none group-hover:text-slate-900">
              {tHome('setup.settings.autoNext')}
            </span>
          </label>

          <div className="w-full pt-4 border-t border-slate-100 mt-2">
            <div className="text-sm font-bold text-slate-500 mb-3 text-center">出題モード</div>
            <div className="flex justify-center gap-6">
              <label className="group inline-flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={includeParent}
                  onChange={(e) => setIncludeParent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span className="text-slate-700 text-sm font-semibold select-none">
                  親
                </span>
              </label>
              <label className="group inline-flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={includeChild}
                  onChange={(e) => setIncludeChild(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span className="text-slate-700 text-sm font-semibold select-none">
                  子
                </span>
              </label>
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 mt-2">
            <div className="text-sm font-bold text-slate-500 mb-3 text-center">{tHome('setup.settings.targetScore')}</div>
            <div className="flex justify-center gap-6">
              <label className="group inline-flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={targetScoreRanges.includes('non_mangan')}
                  onChange={() => handleToggleRange('non_mangan')}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span className="text-slate-700 text-sm font-semibold select-none">
                  {tHome('setup.settings.nonMangan')}
                </span>
              </label>
              <label className="group inline-flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={targetScoreRanges.includes('mangan_plus')}
                  onChange={() => handleToggleRange('mangan_plus')}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-amber-500 focus:ring-offset-0"
                />
                <span className="text-slate-700 text-sm font-semibold select-none">
                  {tHome('setup.settings.manganPlus')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Action */}
        <button
          onClick={handleStart}
          disabled={targetScoreRanges.length === 0 || (!includeParent && !includeChild)}
          className={cn(
            "w-full py-3 px-6 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2",
            targetScoreRanges.length === 0 || (!includeParent && !includeChild)
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-amber-500 text-white hover:bg-amber-600"
          )}
        >
          <span>開始する</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Other Drills - Conditionally Hidden */}
        {!hideDrillLinks && (
          <>
            {/* ... existing drill links ... */}
            {/* Head Fu Drill Action */}
            <div className="pt-2 border-t border-slate-100 w-full">
              <button
                onClick={() => router.push('/problems/jantou-fu')}
                className="w-full py-3 px-6 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <span>符計算ドリル（雀頭）</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Mentsu Fu Drill Action */}
            <div className="pt-2 border-t border-slate-100 w-full">
              <button
                onClick={() => router.push('/problems/mentsu-fu')}
                className="w-full py-3 px-6 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600"
              >
                <span>符計算ドリル（面子）</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            </div>

            {/* Tehai Fu Drill Action */}
            <div className="pt-2 border-t border-slate-100 w-full">
              <button
                onClick={() => router.push('/problems/tehai-fu')}
                className="w-full py-3 px-6 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
              >
                <span>符計算ドリル（手牌）</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>

            {/* Machi Fu Drill Action */}
            <div className="pt-2 border-t border-slate-100 w-full">
              <button
                onClick={() => router.push('/problems/machi-fu')}
                className="w-full py-3 px-6 font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 bg-pink-500 text-white hover:bg-pink-600"
              >
                <span>符計算ドリル（待ち）</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
