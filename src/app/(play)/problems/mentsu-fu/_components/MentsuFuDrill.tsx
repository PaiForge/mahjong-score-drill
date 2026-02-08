'use client'

import { useState, useEffect } from 'react'
import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import { MentsuType } from '@pai-forge/riichi-mahjong'
import { generateMentsuFuQuestion } from '@/lib/problem/mentsu-fu/generator'
import type { MentsuFuQuestion } from '@/lib/problem/mentsu-fu/types'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const FU_OPTIONS = [0, 2, 4, 8, 16, 32] as const

import { PageTitle } from '@/app/_components/PageTitle'

export function MentsuFuDrill() {
    const router = useRouter()
    const [question, setQuestion] = useState<MentsuFuQuestion | null>(null)
    const [selectedFu, setSelectedFu] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)

    // Hydration fix
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        nextQuestion()
    }, [])

    const nextQuestion = () => {
        setQuestion(generateMentsuFuQuestion())
        setSelectedFu(null)
        setIsAnswered(false)
    }

    const handleSelect = (fu: number) => {
        if (isAnswered) return
        setSelectedFu(fu)
        setIsAnswered(true)
    }

    if (!mounted || !question) return null

    // Helper to render the mentsu
    const renderMentsu = () => {
        const { mentsu } = question

        if (mentsu.furo) {
            // Open Meld
            return (
                <div className="transform scale-150">
                    <Furo mentsu={mentsu} furo={mentsu.furo} />
                </div>
            )
        } else {
            // Closed.
            if (mentsu.type === MentsuType.Kantsu) {
                return (
                    <div className="flex gap-1 transform scale-150">
                        <div className="w-8 h-12 bg-slate-800 rounded border border-slate-600" /> {/* Back */}
                        <Hai hai={mentsu.hais[1]} />
                        <Hai hai={mentsu.hais[2]} />
                        <div className="w-8 h-12 bg-slate-800 rounded border border-slate-600" /> {/* Back */}
                    </div>
                )
            }
            // Normal Closed (Shuntsu / Koutsu)
            return (
                <div className="flex gap-0.5 transform scale-150">
                    {mentsu.hais.map((h, i) => <Hai key={i} hai={h} />)}
                </div>
            )
        }
    }

    const handleEnd = () => {
        router.push('/problems/mentsu-fu')
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-lg space-y-6">

                <PageTitle>符計算ドリル（面子）</PageTitle>

                {/* Question Area */}
                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8 flex flex-col items-center gap-8 min-h-[200px] justify-center relative">
                    <div className="mt-8">
                        {renderMentsu()}
                    </div>
                    <p className="text-slate-500 font-medium">この面子の符は？</p>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-3 gap-3">
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
                                    "h-16 rounded-xl border-b-4 font-bold text-xl transition-all active:border-b-0 active:translate-y-1",
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
                            {question.explanation}
                        </div>
                        <button
                            onClick={nextQuestion}
                            className="mt-4 w-full py-3 bg-amber-500 text-white font-bold rounded-lg shadow hover:bg-amber-600 transition-colors"
                        >
                            次の問題へ
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2 pt-2">
                    {!isAnswered && (
                        <div className="text-center">
                            <button
                                onClick={nextQuestion}
                                className="text-slate-500 hover:text-slate-700 underline text-sm"
                            >
                                スキップ
                            </button>
                        </div>
                    )}
                    <div className="text-center">
                        <button
                            onClick={handleEnd}
                            className="text-slate-500 hover:text-slate-600 underline text-sm"
                        >
                            終了する
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
