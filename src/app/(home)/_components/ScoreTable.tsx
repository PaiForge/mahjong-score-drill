'use client'

import React, { useState } from 'react'
import { useScoreTableStore } from '@/lib/drill/stores/useScoreTableStore'
import { useTranslations } from 'next-intl'

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
    if (isMangan) return { isMangan: true, ron: 12000, tsumo: '4000オール' }

    const ron = Math.ceil((base * 6) / 100) * 100
    const tsumo = Math.ceil((base * 2) / 100) * 100

    return { isMangan: false, ron, tsumo: `${tsumo}オール` }
}

const HIGH_SCORES = [
    { nameKey: 'mangan', han: '5', ronKo: 8000, tsumoKo: '2000/4000', ronOya: 12000, tsumoOya: '4000' },
    { nameKey: 'haneman', han: '6-7', ronKo: 12000, tsumoKo: '3000/6000', ronOya: 18000, tsumoOya: '6000' },
    { nameKey: 'baiman', han: '8-10', ronKo: 16000, tsumoKo: '4000/8000', ronOya: 24000, tsumoOya: '8000' },
    { nameKey: 'sanbaiman', han: '11-12', ronKo: 24000, tsumoKo: '6000/12000', ronOya: 36000, tsumoOya: '12000' },
    { nameKey: 'yakuman', han: '13~', ronKo: 32000, tsumoKo: '8000/16000', ronOya: 48000, tsumoOya: '16000' },
]

export function ScoreTable() {
    const tProblems = useTranslations('problems') // Use problems dict or common? maybe problems.form.options
    // Actually create a new namespace for ScoreTable if needed, or reuse. 
    // problems.form.options has mangan, haneman etc.
    const { activeTab, setActiveTab, viewMode, setViewMode, winType, setWinType, hiddenCells, toggleCellVisibility } = useScoreTableStore()

    const isKo = activeTab === 'ko'

    const getCellClass = (isHidden: boolean) => {
        const base = "border border-gray-300 p-2 relative h-16 align-middle cursor-pointer transition-all duration-200 select-none"
        if (isHidden) {
            return `${base} bg-gray-200 hover:bg-gray-200`
        }
        return `${base} hover:bg-gray-50`
    }

    const getContentClass = (isHidden: boolean) => {
        return `transition-all duration-300 ${isHidden ? '!filter !blur-md !opacity-100' : ''}`
    }

    const renderTsumoScore = (score: string | number) => {
        if (typeof score !== 'string') return score
        const text = score.replace('オール', '')
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
                <span>{text} {tProblems('form.options.all')}</span>
            </div>
        )
    }

    return (
        <div className="w-full relative pb-20">
            {/* Header Area */}
            <div className="flex items-center justify-end mb-4">
                {/* Win Type Switcher */}
                <div className="bg-blue-50 p-1 rounded-lg flex shadow-inner border border-blue-100">
                    <button
                        onClick={() => setWinType('ron')}
                        className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all min-w-[80px] ${winType === 'ron'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        {tProblems('question.ron')}
                    </button>
                    <button
                        onClick={() => setWinType('tsumo')}
                        className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all min-w-[80px] ${winType === 'tsumo'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        {tProblems('question.tsumo')}
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setActiveTab('ko')}
                    className={`w-28 py-3 font-bold text-lg rounded-l-lg shadow-md transition-all border-y border-l ${activeTab === 'ko'
                        ? '!bg-blue-600 !text-white !border-blue-600'
                        : '!bg-blue-100 !text-gray-700 !border-blue-600 hover:!bg-blue-200'
                        }`}
                >
                    {tProblems('question.nonDealer')}
                </button>
                <button
                    onClick={() => setActiveTab('oya')}
                    className={`w-28 py-3 font-bold text-lg rounded-r-lg shadow-md transition-all border-y border-r ${activeTab === 'oya'
                        ? '!bg-blue-600 !text-white !border-blue-600'
                        : '!bg-blue-100 !text-gray-700 !border-blue-600 hover:!bg-blue-200'
                        }`}
                >
                    {tProblems('question.dealer')}
                </button>
            </div>

            {/* View Mode Switcher (Segmented Control) */}
            <div className="flex justify-end mb-6">
                <div className="bg-blue-50 p-1 rounded-lg flex shadow-inner border border-blue-100">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all min-w-[120px] ${viewMode === 'normal'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        {tProblems('result.fuHan')}
                    </button>
                    <button
                        onClick={() => setViewMode('high_score')}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all min-w-[120px] ${viewMode === 'high_score'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        {tProblems('form.options.mangan')} +
                    </button>
                </div>
            </div>


            {/* Table Content */}
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

                                        if (score.isMangan) {
                                            return (
                                                <td
                                                    key={han}
                                                    className={`border border-gray-300 p-1 cursor-pointer transition-all duration-300 select-none ${isHidden ? 'bg-gray-200' : 'bg-blue-50/30 hover:bg-blue-100/50'}`}
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
                                                className={getCellClass(isHidden)}
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
                                            className={getCellClass(isHidden)}
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
