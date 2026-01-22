'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { HaiKind } from '@pai-forge/riichi-mahjong'
import { Modal } from './Modal'
import { ScoreTableControls, ScoreTableGrid } from '../(home)/_components/ScoreTable'
import { useDrillStore } from '@/lib/problem/stores/useDrillStore'
import { useScoreTableStore } from '@/lib/problem/stores/useScoreTableStore'
import { useTranslations } from 'next-intl'

export function GlobalCheatsheet() {
    const pathname = usePathname()
    const tHome = useTranslations('home')
    const [isOpen, setIsOpen] = useState(false)
    const { isAnswered, currentQuestion } = useDrillStore()
    const { setActiveTab, setWinType, setViewMode, setHighlightedCellId } = useScoreTableStore()
    const hasSynced = useRef(false)

    useEffect(() => {
        if (isOpen) {
            if (isAnswered && currentQuestion && !hasSynced.current) {
                // Sync Role (Parent/Child)
                const role = currentQuestion.jikaze === HaiKind.Ton ? 'oya' : 'ko'
                setActiveTab(role)

                // Sync Win Type (Ron/Tsumo)
                const winType = currentQuestion.isTsumo ? 'tsumo' : 'ron'
                setWinType(winType)

                // Sync View Mode and Highlight
                const { han, fu, scoreLevel } = currentQuestion.answer

                let targetMode: 'normal' | 'high_score' = 'normal'
                let targetCellId = ''

                if (han >= 5) {
                    targetMode = 'high_score'
                    // Map scoreLevel to High Score keys
                    // HIGH_SCORES keys: mangan, haneman, baiman, sanbaiman, yakuman
                    let key = (scoreLevel as string).toLowerCase()

                    // Normalize keys
                    if (key.includes('yakuman')) {
                        key = 'yakuman'
                    }

                    targetCellId = `${role}-${winType}-${key}`
                } else {
                    targetMode = 'normal'
                    // For normal grid, ID format: role-winType-han-fu
                    targetCellId = `${role}-${winType}-${han}han-${fu}fu`
                }

                setViewMode(targetMode)
                setHighlightedCellId(targetCellId)

                hasSynced.current = true
            }
        } else {
            hasSynced.current = false
        }
    }, [isOpen, isAnswered, currentQuestion, setActiveTab, setWinType, setViewMode, setHighlightedCellId])

    // 問題ページでのみ表示
    if (pathname !== '/problems/score') {
        return null
    }

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 right-4 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all group"
                aria-label={tHome('setup.links.cheatsheet')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                >
                    <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {tHome('setup.links.cheatsheet')}
                </span>
            </button>

            {/* Modal with ScoreTable */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="flex flex-col h-[80vh] md:h-auto md:max-h-[85vh]">
                    <div className="mb-4 pt-12">
                        <ScoreTableControls size="small" />
                    </div>
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        <ScoreTableGrid />
                    </div>
                </div>
            </Modal>
        </>
    )
}
