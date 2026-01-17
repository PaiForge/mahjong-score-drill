import { Suspense } from 'react'
import { DrillBoard } from './_components/DrillBoard'

export default function DrillPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">読み込み中...</div>}>
      <DrillBoard />
    </Suspense>
  )
}
