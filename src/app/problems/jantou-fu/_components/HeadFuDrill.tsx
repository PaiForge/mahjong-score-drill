'use client'

import { useState, useEffect } from 'react'
import { Hai } from '@pai-forge/mahjong-react-ui'
import { getKazeName } from '@/lib/core/haiNames'
import { generateHeadFuQuestion } from '@/lib/problem/jantou-fu/generator'
import type { HeadFuQuestion } from '@/lib/problem/jantou-fu/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function HeadFuDrill() {
    const [question, setQuestion] = useState<HeadFuQuestion | null>(null)
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)

    // Hydration fix
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        nextQuestion()
    }, [])

    const nextQuestion = () => {
        setQuestion(generateHeadFuQuestion())
        setSelectedChoiceIndex(null)
        setIsAnswered(false)
    }

    const handleSelect = (index: number) => {
        if (isAnswered) return
        setSelectedChoiceIndex(index)
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
                    <h1 className="text-xl font-bold text-slate-800">符計算ドリル（雀頭）</h1>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Context Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center space-y-6">
                    <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">場風</span>
                            <span className="text-3xl font-bold text-slate-800">{getKazeName(question.context.bakaze)}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">自風</span>
                            <span className="text-3xl font-bold text-slate-800">{getKazeName(question.context.jikaze)}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <p className="text-slate-600 font-medium">
                            以下の牌を<span className="font-bold text-slate-900">雀頭</span>にしたとき、符がつくのはどれ？
                        </p>
                    </div>
                </div>

                {/* Choices Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {question.choices.map((choice, idx) => {
                        const isSelected = selectedChoiceIndex === idx
                        const showResult = isAnswered

                        let borderClass = "border-slate-200 hover:border-blue-400 bg-white"

                        if (showResult) {
                            if (choice.isCorrect) borderClass = "border-green-500 bg-green-50 ring-2 ring-green-200 ring-offset-2"
                            else if (isSelected) borderClass = "border-red-500 bg-red-50"
                            else borderClass = "border-slate-100 bg-slate-50 opacity-40 grayscale"
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={isAnswered}
                                className={cn(
                                    "relative h-40 rounded-xl border-2 flex flex-col items-center justify-center transition-all p-4 gap-3",
                                    borderClass,
                                    !isAnswered && "hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:scale-95 cursor-pointer"
                                )}
                            >
                                <div className="transform scale-125">
                                    <Hai hai={choice.hai} />
                                </div>

                                {showResult && (
                                    <div className={cn(
                                        "absolute bottom-3 left-3 right-3 text-xs font-bold px-2 py-1.5 rounded-lg text-center animate-in fade-in zoom-in duration-300",
                                        choice.isCorrect ? "text-green-800 bg-green-200" : "text-red-800 bg-red-200"
                                    )}>
                                        {choice.fu}符 ({choice.explanation})
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Next Button */}
                {isAnswered && (
                    <button
                        onClick={nextQuestion}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all active:translate-y-0.5 animate-in slide-in-from-bottom-4 duration-300"
                    >
                        次の問題へ
                    </button>
                )}
            </div>
        </div>
    )
}
