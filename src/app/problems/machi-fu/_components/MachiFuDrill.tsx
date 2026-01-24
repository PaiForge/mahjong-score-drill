'use client'

import { useState, useEffect } from 'react'
import { Hai } from '@pai-forge/mahjong-react-ui'
import { generateMachiFuQuestion } from '@/lib/problem/machi-fu/generator'
import type { MachiFuQuestion } from '@/lib/problem/machi-fu/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const FU_OPTIONS = [0, 2] as const

export function MachiFuDrill() {
    const [question, setQuestion] = useState<MachiFuQuestion | null>(null)
    const [selectedFu, setSelectedFu] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)

    // Hydration fix
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        nextQuestion()
    }, [])

    const nextQuestion = () => {
        setQuestion(generateMachiFuQuestion())
        setSelectedFu(null)
        setIsAnswered(false)
    }

    const handleSelect = (fu: number) => {
        if (isAnswered) return
        setSelectedFu(fu)
        setIsAnswered(true)
    }

    if (!mounted || !question) return null

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-slate-500 hover:text-slate-700 font-bold transition-colors">
                        ← Home
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">符計算ドリル（待ち）</h1>
                    <div className="w-16" />
                </div>

                {/* Question Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center gap-8 min-h-[200px] justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col gap-2 items-center">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">待ち形</span>
                            <div className="flex gap-0.5 transform scale-125 origin-center">
                                {question.tiles.map((t, i) => <Hai key={i} hai={t} />)}
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-100 my-2" />

                        <div className="flex flex-col gap-2 items-center">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">和了牌</span>
                            <div className="transform scale-125 origin-center">
                                <Hai hai={question.agariHai} />
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-500 font-medium">この待ちの符は？</p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {FU_OPTIONS.map((fu) => {
                        const isSelected = selectedFu === fu
                        const isCorrect = question.answer === fu

                        let btnClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"

                        if (isAnswered) {
                            if (isCorrect) btnClass = "bg-green-500 border-green-600 text-white ring-2 ring-green-200 ring-offset-1"
                            else if (isSelected) btnClass = "bg-red-500 border-red-600 text-white"
                            else btnClass = "opacity-40 grayscale bg-slate-100"
                        }

                        return (
                            <button
                                key={fu}
                                onClick={() => handleSelect(fu)}
                                disabled={isAnswered}
                                className={cn(
                                    "h-20 rounded-xl border-b-4 font-bold text-2xl transition-all active:border-b-0 active:translate-y-1",
                                    btnClass
                                )}
                            >
                                {fu}符
                            </button>
                        )
                    })}
                </div>

                {/* Result & Explanation */}
                {isAnswered && (
                    <div className={cn(
                        "p-6 rounded-xl text-center space-y-4 animate-in fade-in slide-in-from-bottom-2",
                        selectedFu === question.answer ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"
                    )}>
                        <div className="text-lg font-bold">
                            {selectedFu === question.answer ? "正解！" : "不正解..."}
                        </div>
                        <div className="text-lg">
                            {question.shapeName}なので、{question.explanation}
                        </div>
                        <button
                            onClick={nextQuestion}
                            className="mt-4 w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            次の問題へ
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
