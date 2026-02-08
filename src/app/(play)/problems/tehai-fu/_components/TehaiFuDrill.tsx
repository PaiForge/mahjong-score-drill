'use client'

import { PageTitle } from '@/app/_components/PageTitle'

import { useState, useEffect } from 'react'
import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import { MentsuType } from '@pai-forge/riichi-mahjong'
import { generateTehaiFuQuestion } from '@/lib/problem/tehai-fu/generator'
import type { TehaiFuQuestion, TehaiFuItem } from '@/lib/problem/tehai-fu/types'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { QuestionDisplay } from '@/app/(main)/problems/score/_components/QuestionDisplay'
import type { DrillQuestion } from '@/lib/problem/types'

import { useResponsiveHaiSize } from '@/app/(main)/problems/score/_hooks/useResponsiveHaiSize'

const FU_OPTIONS = [0, 2, 4, 8, 16, 32] as const

export function TehaiFuDrill() {
    const router = useRouter()
    const [question, setQuestion] = useState<TehaiFuQuestion | null>(null)
    const [answers, setAnswers] = useState<(string | null)[]>([])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const haiSize = useResponsiveHaiSize()

    // Hydration fix
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
        nextQuestion()
    }, [])

    const nextQuestion = () => {
        const q = generateTehaiFuQuestion()
        setQuestion(q)
        if (q) {
            setAnswers(new Array(q.items.length).fill(""))
        }
        setIsSubmitted(false)
    }

    const handleSelect = (idx: number, value: string) => {
        if (isSubmitted) return
        const newAnswers = [...answers]
        newAnswers[idx] = value
        setAnswers(newAnswers)
    }

    const checkAnswers = () => {
        setIsSubmitted(true)
    }

    // Check if all answered
    const allAnswered = answers.length > 0 && answers.every(a => a !== "" && a !== null)

    if (!mounted || !question) return null

    // Transform to DrillQuestion for QuestionDisplay
    const drillQuestion: DrillQuestion = {
        tehai: question.tehai,
        agariHai: question.context.agariHai,
        isTsumo: question.context.isTsumo,
        jikaze: question.context.jikaze,
        bakaze: question.context.bakaze,
        doraMarkers: question.context.doraMarkers,
        isRiichi: question.context.isRiichi,
        uraDoraMarkers: question.context.uraDoraMarkers,
        answer: {} as any, // Unused by display
        yakuDetails: [], // Unused by display
        fuDetails: [] // Unused by display
    }

    const renderItemTiles = (item: TehaiFuItem) => {
        if (item.type === MentsuType.Kantsu) {
            if (item.isOpen) {
                // Open Kan
                return item.originalMentsu ? (
                    <div>
                        <Furo mentsu={item.originalMentsu} furo={item.originalMentsu.furo} size={haiSize} />
                    </div>
                ) : null
            } else {
                // Ankan rendering
                return item.originalMentsu ? (
                    <div>
                        <Furo
                            mentsu={item.originalMentsu}
                            furo={item.originalMentsu.furo}
                            size={haiSize}
                            className="ankan-furo"
                        />
                    </div>
                ) : null
            }
        }

        if (item.isOpen && item.originalMentsu) {
            return (
                <div>
                    <Furo mentsu={item.originalMentsu} furo={item.originalMentsu.furo} size={haiSize} />
                </div>
            )
        }

        // Closed Hand / Pair
        return (
            <div className="flex gap-0.5">
                {item.tiles.map((t, i) => <Hai key={i} hai={t} size={haiSize} />)}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pb-20">
            <div className="w-full max-w-3xl space-y-6">
                {/* Title */}
                <PageTitle className="mb-0">符計算ドリル（手牌）</PageTitle>

                {/* Hand Display (Reusing Score Drill Display) */}
                <QuestionDisplay question={drillQuestion} />

                {/* List */}
                <div className="space-y-4">
                    {question.items.map((item, idx) => {
                        const answerStr = answers[idx]
                        const answerNum = answerStr ? parseInt(answerStr) : null
                        const isCorrect = isSubmitted && answerNum === item.fu

                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div className="p-2">
                                        {renderItemTiles(item)}
                                    </div>

                                    <div className="flex items-center gap-4 min-w-[150px] justify-end flex-1">
                                        {isSubmitted && (
                                            <div className={cn(
                                                "px-3 py-1.5 rounded text-sm font-bold whitespace-nowrap",
                                                isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {isCorrect ? "正解" : "不正解"}
                                            </div>
                                        )}

                                        <select
                                            className={cn(
                                                "form-select block w-24 rounded-md border-slate-300 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50 font-bold text-lg h-10 py-1",
                                                isSubmitted
                                                    ? isCorrect ? "border-green-500 bg-green-50 text-green-900"
                                                        : "border-red-500 bg-red-50 text-red-900"
                                                    : "border-slate-300"
                                            )}
                                            value={answerStr || ""}
                                            onChange={(e) => handleSelect(idx, e.target.value)}
                                            disabled={isSubmitted}
                                        >
                                            <option value="" disabled>選択</option>
                                            {FU_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}符</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Explanation */}
                                {isSubmitted && !isCorrect && (
                                    <div className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded">
                                        {item.fu}符 ({item.explanation})
                                    </div>
                                )}
                                {isSubmitted && isCorrect && (
                                    <div className="text-sm text-green-600 font-medium bg-green-50 p-2 rounded">
                                        {item.explanation}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Actions */}
                <div className="sticky bottom-4 z-10 w-full max-w-3xl mx-auto space-y-4 p-4 rounded-xl bg-white/90 backdrop-blur-sm shadow-2xl border border-slate-100">
                    {!isSubmitted ? (
                        <div className="space-y-4">
                            <button
                                onClick={checkAnswers}
                                disabled={!allAnswered}
                                className={cn(
                                    "w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all text-lg",
                                    allAnswered ? "bg-amber-500 hover:bg-amber-600 hover:shadow-xl hover:-translate-y-0.5" : "bg-slate-300 cursor-not-allowed"
                                )}
                            >
                                答え合わせ
                            </button>
                            {/* Navigation Links (Pre-submit) */}
                            <div className="text-center">
                                <button
                                    onClick={nextQuestion}
                                    className="text-slate-500 hover:text-slate-700 underline text-sm"
                                >
                                    スキップ
                                </button>
                            </div>
                        </div>

                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={nextQuestion}
                                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg animate-in slide-in-from-bottom-2"
                            >
                                次の問題へ
                            </button>
                        </div>
                    )}
                    <div className="text-center">
                        <button
                            onClick={() => router.push('/problems/tehai-fu')}
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
