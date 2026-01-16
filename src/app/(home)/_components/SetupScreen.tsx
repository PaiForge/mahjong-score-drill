'use client'

import { useRouter } from 'next/navigation'

export function SetupScreen() {
  const router = useRouter()

  const handleStart = () => {
    router.push('/drill')
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
