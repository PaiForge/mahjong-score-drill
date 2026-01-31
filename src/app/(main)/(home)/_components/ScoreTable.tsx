'use client'

import React, { useState } from 'react'
import { useScoreTableStore } from '@/lib/problem/stores/useScoreTableStore'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

const HAN_COLS = [1, 2, 3, 4]
const FU_ROWS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]

type Role = 'ko' | 'oya'
type ViewMode = 'normal' | 'high_score'

// Calculate score for Ko (Child)
const calculateKoScore = (han: number, fu: number) => {
    let base = fu * Math.pow(2, 2 + han)
    const isMangan = base >= 2000
    if (isMangan) return { isMangan: true, ron: 8000, tsumo: '2000/4000' } // Placeholder

    const ron = Math.ceil((base * 4) / 100) * 100
    const tsumoKo = Math.ceil((base * 1) / 100) * 100
    const tsumoOya = Math.ceil((base * 2) / 100) * 100

    return { isMangan: false, ron, tsumo: `${tsumoKo}/${tsumoOya}` }
}

// Calculate score for Oya (Parent)
const calculateOyaScore = (han: number, fu: number) => {
    let base = fu * Math.pow(2, 2 + han)
    const isMangan = base >= 2000
    if (isMangan) return { isMangan: true, ron: 12000, tsumo: '4000∀' }

    const ron = Math.ceil((base * 6) / 100) * 100
    const tsumo = Math.ceil((base * 2) / 100) * 100

    return { isMangan: false, ron, tsumo: `${tsumo}∀` }
}

const HIGH_SCORES = [
    { nameKey: 'mangan', han: '5', ronKo: 8000, tsumoKo: '2000/4000', ronOya: 12000, tsumoOya: '4000' },
    { nameKey: 'haneman', han: '6-7', ronKo: 12000, tsumoKo: '3000/6000', ronOya: 18000, tsumoOya: '6000' },
    { nameKey: 'baiman', han: '8-10', ronKo: 16000, tsumoKo: '4000/8000', ronOya: 24000, tsumoOya: '8000' },
    { nameKey: 'sanbaiman', han: '11-12', ronKo: 24000, tsumoKo: '6000/12000', ronOya: 36000, tsumoOya: '12000' },
    { nameKey: 'yakuman', han: '13~', ronKo: 32000, tsumoKo: '8000/16000', ronOya: 48000, tsumoOya: '16000' },
]

export function ScoreTableControls({ size = 'normal' }: { size?: 'normal' | 'small' }) {
    const tProblems = useTranslations('problems')
    const { activeTab, setActiveTab, viewMode, setViewMode, winType, setWinType, setHighlightedCellId } = useScoreTableStore()

    const btnBaseClass = "rounded-md font-medium transition-all"
    const containerClass = "bg-blue-50 p-0.5 rounded-md flex border border-blue-100"

    const btnPadding = 'px-2 py-1 text-xs'

    return (
        <div className="flex flex-nowrap gap-2 items-center justify-end">
            {/* Role (子/親) - 最も基本的な条件なので先頭 */}
            <div className={containerClass}>
                <button
                    onClick={() => { setActiveTab('ko'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        activeTab === 'ko'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('question.nonDealer')}
                </button>
                <button
                    onClick={() => { setActiveTab('oya'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        activeTab === 'oya'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('question.dealer')}
                </button>
            </div>

            {/* Win Type (ロン/ツモ) */}
            <div className={containerClass}>
                <button
                    onClick={() => { setWinType('ron'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        winType === 'ron'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('question.ron')}
                </button>
                <button
                    onClick={() => { setWinType('tsumo'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        winType === 'tsumo'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('question.tsumo')}
                </button>
            </div>

            {/* View Mode (符翻/満貫+) */}
            <div className={containerClass}>
                <button
                    onClick={() => { setViewMode('normal'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        viewMode === 'normal'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('result.fuHan')}
                </button>
                <button
                    onClick={() => { setViewMode('high_score'); setHighlightedCellId(null); }}
                    className={cn(btnBaseClass, btnPadding,
                        viewMode === 'high_score'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    )}
                >
                    {tProblems('form.options.mangan')}+
                </button>
            </div>
        </div>
    )
}

export function ScoreTableGrid() {
    const tProblems = useTranslations('problems')
    const { activeTab, viewMode, winType, hiddenCells, toggleCellVisibility, highlightedCellId } = useScoreTableStore()

    const isKo = activeTab === 'ko'

    const getCellClass = (isHidden: boolean, isHighlighted: boolean) => {
        const base = "border border-gray-300 p-2 relative h-16 align-middle cursor-pointer select-none"
        if (isHighlighted) {
            return `${base} bg-yellow-100 ring-2 ring-yellow-400 ring-inset z-10`
        }
        if (isHidden) {
            return `${base} bg-gray-200 hover:bg-gray-200`
        }
        return `${base} bg-transparent hover:bg-gray-50`
    }

    const getContentClass = (isHidden: boolean) => {
        return cn("transition-all duration-300", isHidden ? "filter blur-md opacity-100" : "")
    }

    const renderTsumoScore = (score: string | number) => {
        if (typeof score !== 'string') return score
        const text = score.replace('∀', '')
        if (text.includes('/')) {
            const [ko, oya] = text.split('/')
            return (
                <div className="flex flex-col items-center leading-tight">
                    <span>{ko} /</span>
                    <span>{oya}</span>
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center leading-tight">
                <span>{text}∀</span>
            </div>
        )
    }

    return (
        <div className="w-full relative">
            <div className="overflow-x-auto w-full">
                {viewMode === 'normal' ? (
                    <table className="w-full text-center border-collapse border border-gray-300 bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr>
                                <th className="bg-gray-100 border border-gray-300 w-14"></th>
                                {HAN_COLS.map(han => (
                                    <th key={han} className="bg-gray-200 border border-gray-300 py-3 text-base text-gray-700 font-normal">
                                        {han}{tProblems('form.options.han_suffix')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FU_ROWS.map((fu, idx) => (
                                <tr key={fu} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="bg-gray-200 border border-gray-300 text-sm text-gray-700 py-1 font-normal">
                                        {fu}{tProblems('form.options.fu_suffix')}
                                    </td>
                                    {HAN_COLS.map(han => {
                                        if (
                                            (han === 1 && fu === 20) ||
                                            (winType === 'ron' && fu === 20) ||
                                            (han === 1 && fu === 25) ||
                                            (winType === 'tsumo' && han === 2 && fu === 25)
                                        ) {
                                            return (
                                                <td key={han} className="border border-gray-300 text-gray-300 bg-gray-50/50 h-16">
                                                    <div className="text-gray-300 text-sm">-</div>
                                                </td>
                                            )
                                        }

                                        const score = isKo
                                            ? calculateKoScore(han, fu)
                                            : calculateOyaScore(han, fu)

                                        const cellId = `${activeTab}-${winType}-${han}han-${fu}fu`
                                        const isHidden = !!hiddenCells[cellId]
                                        const isHighlighted = highlightedCellId === cellId

                                        if (score.isMangan) {
                                            return (
                                                <td
                                                    key={han}
                                                    className={`border border-gray-300 p-1 cursor-pointer transition-all duration-300 select-none relative ${isHighlighted ? 'bg-yellow-100 ring-2 ring-yellow-400 ring-inset z-10' : (isHidden ? 'bg-gray-200' : 'bg-blue-50/30 hover:bg-blue-100/50')}`}
                                                    onClick={() => toggleCellVisibility(cellId)}
                                                >
                                                    <div className={`flex items-center justify-center h-full text-sm text-gray-600 py-2 ${getContentClass(isHidden)}`}>
                                                        {tProblems('form.options.mangan')}
                                                    </div>
                                                </td>
                                            )
                                        }

                                        return (
                                            <td
                                                key={han}
                                                className={getCellClass(isHidden, isHighlighted)}
                                                onClick={() => toggleCellVisibility(cellId)}
                                            >
                                                {winType === 'ron' && (
                                                    <div className={`text-gray-800 text-sm ${getContentClass(isHidden)}`}>
                                                        {score.ron}
                                                    </div>
                                                )}
                                                {winType === 'tsumo' && (
                                                    <div className={`text-gray-800 text-sm flex items-center justify-center h-full ${getContentClass(isHidden)}`}>
                                                        {renderTsumoScore(score.tsumo)}
                                                    </div>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // High Score Table
                    <table className="w-full text-center border-collapse border border-gray-300 bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr>
                                <th className="bg-gray-200 border border-gray-300 py-3 text-gray-700 font-normal">{tProblems('form.labels.yaku')}</th>
                                <th className="bg-gray-200 border border-gray-300 py-3 text-gray-700 font-normal">{tProblems('form.labels.han')}</th>
                                <th className="bg-gray-200 border border-gray-300 py-3 text-gray-700 font-normal">
                                    {tProblems('result.score')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {HIGH_SCORES.map((item, idx) => {
                                const cellId = `${activeTab}-${winType}-${item.nameKey}`
                                const isHidden = !!hiddenCells[cellId]
                                const isHighlighted = highlightedCellId === cellId

                                return (
                                    <tr key={item.nameKey} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="bg-gray-200 border border-gray-300 text-sm text-gray-700 py-4 font-normal">
                                            {/* @ts-ignore dynamic key */}
                                            {tProblems(`form.options.${item.nameKey}`)}
                                        </td>
                                        <td className="border border-gray-300 font-medium text-gray-600">
                                            {item.han}{tProblems('form.options.han_suffix')}
                                        </td>
                                        <td
                                            className={getCellClass(isHidden, isHighlighted)}
                                            onClick={() => toggleCellVisibility(cellId)}
                                        >
                                            {winType === 'ron' && (
                                                <div className={`text-gray-800 text-sm ${getContentClass(isHidden)}`}>
                                                    {isKo ? item.ronKo : item.ronOya}
                                                </div>
                                            )}
                                            {winType === 'tsumo' && (
                                                <div className={`text-gray-800 text-sm flex items-center justify-center h-full ${getContentClass(isHidden)}`}>
                                                    {renderTsumoScore(isKo ? item.tsumoKo : item.tsumoOya)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export function ScoreTable() {
    return (
        <div className="w-full relative pb-20">
            <div className="sticky top-14 z-20 bg-white pb-3 mb-1">
                <ScoreTableControls />
            </div>
            <ScoreTableGrid />
        </div>
    )
}
