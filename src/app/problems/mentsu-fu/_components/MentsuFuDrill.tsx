'use client'

import { useState, useEffect } from 'react'
import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import { MentsuType } from '@pai-forge/riichi-mahjong'
import { generateMentsuFuQuestion } from '@/lib/problem/mentsu-fu/generator'
import type { MentsuFuQuestion } from '@/lib/problem/mentsu-fu/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const FU_OPTIONS = [0, 2, 4, 8, 16, 32] as const

export function MentsuFuDrill() {
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

        // If it's a closed Shuntsu/Koutsu/Kantsu (no furo), render as independent tiles or Furo component?
        // Furo component is good for open melds. For closed melds, standard tile layout is better, but Furo component can handle closed Kakan? No.
        // Let's use standard tile layout for closed (no furo), and Furo component for open (with furo).
        // WAIT. Generator returns CompletedMentsu which has 'furo' property if open.
        // If furo exists, use Furo.
        // If no furo (closed), just map tiles. 
        // EXCEPT: Closed Quad (Ankan) is technically a "Furo" type in Riichi logic usually, but here our generator returns Kantsu without Furo property for Ankan?
        // Let's check generator. Ah, createKantsu returns no furo for Ankan?
        // "return kantsu" line 125.
        // Check types.ts... "furo?: Furo".
        // So if furo is undefined, it is closed. 
        // BUT Ankan needs to be displayed as closed quad. 
        // Usually standard `Hai` list for Ankan is confusing (4 tiles). Ankan should probably use `Furo` component logic or specific display (Back-Face-Face-Back).
        // Let's look at generator again.
        // createKantsu: if (!isOpen) returns without furo.
        // In `QuestionDisplay.tsx`, we saw Kantsu handling.
        // `kantsuList = tehai.exposed.filter...`
        // Ankan IS exposed in the `tehai.exposed` array in standard `riichi-mahjong` usually? 
        // Let's check `tehai` type in `riichi-mahjong`. `exposed` is `CompletedMentsu[]`.
        // Ankan is stored in `exposed` with `type: Kantsu`, but the `furo` field might be missing or specific.
        // Actually, `Furo` component from `mahjong-react-ui` handles Ankan if we pass it correctly?
        // Let's assume for Mentsu Drill, we just render what we have.

        if (mentsu.furo) {
            // Open Meld
            return (
                <div className="transform scale-150">
                    <Furo mentsu={mentsu} furo={mentsu.furo} />
                </div>
            )
        } else {
            // Closed.
            // If Kantsu (Ankan), we should render it like Ankan (Back, Tile, Tile, Back).
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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
            <div className="w-full max-w-lg space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-slate-500 hover:text-slate-700 font-bold transition-colors">
                        ← Home
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">符計算ドリル（面子）</h1>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Question Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center gap-8 min-h-[200px] justify-center">
                    {renderMentsu()}
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
