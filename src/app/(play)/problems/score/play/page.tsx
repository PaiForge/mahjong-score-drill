'use client'

import { Suspense } from 'react'
import { DrillBoard } from '@/app/(main)/problems/score/_components/DrillBoard'

export default function DrillPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DrillBoard />
    </Suspense>
  )
}
