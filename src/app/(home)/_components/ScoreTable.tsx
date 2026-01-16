'use client'

import React, { useState } from 'react'


const HAN_COLS = [1, 2, 3, 4]
const FU_ROWS = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110]

type Role = 'ko' | 'oya'
type ViewMode = 'normal' | 'high_score'

// Calculate score for Ko (Child)
const calculateKoScore = (han: number, fu: number) => {
    // Special handling for 4 han 30 fu -> Mangan in many rules (Kiriage)
    // Standard: 30fu 4han = 7700 or 7900 -> often treated as 8000 Mangan
    // The user image shows 30fu 4han as 7700 with a note icon. 
    // Let's stick to standard calculation but cap at mangan for display check.

    let base = fu * Math.pow(2, 2 + han)

    // Strict check for Mangan
    // Mangan is defined as 2000 points base (or limiting base to 2000)
    // Usually anything >= 2000 base is mangan.
    // 3han 70fu = 70 * 32 = 2240 -> Mangan
    // 4han 40fu = 40 * 64 = 2560 -> Mangan
    // 4han 30fu = 30 * 64 = 1920 -> Not Mangan strictly (7700), but often Kiriage.

    const isMangan = base >= 2000
    if (isMangan) return { isMangan: true, ron: 8000, tsumo: '2000/4000' } // Placeholder for "Satisfies Mangan Logic"

    // If not mangan, calculate normally
    const ron = Math.ceil((base * 4) / 100) * 100
    const tsumoKo = Math.ceil((base * 1) / 100) * 100
    const tsumoOya = Math.ceil((base * 2) / 100) * 100

    return { isMangan: false, ron, tsumo: `${tsumoKo}-${tsumoOya}` }
}

// Calculate score for Oya (Parent)
const calculateOyaScore = (han: number, fu: number) => {
    let base = fu * Math.pow(2, 2 + han)

    // 3han 70fu = 2240 -> Mangan
    const isMangan = base >= 2000
    if (isMangan) return { isMangan: true, ron: 12000, tsumo: '4000オール' }

    const ron = Math.ceil((base * 6) / 100) * 100
    const tsumo = Math.ceil((base * 2) / 100) * 100

    return { isMangan: false, ron, tsumo: `${tsumo}オール` } // "オール" will be handled in render
}

const HIGH_SCORES = [
    { name: '満貫', han: '5翻', ronKo: 8000, tsumoKo: '2000-4000', ronOya: 12000, tsumoOya: '4000オール' },
    { name: '跳満', han: '6-7翻', ronKo: 12000, tsumoKo: '3000-6000', ronOya: 18000, tsumoOya: '6000オール' },
    { name: '倍満', han: '8-10翻', ronKo: 16000, tsumoKo: '4000-8000', ronOya: 24000, tsumoOya: '8000オール' },
    { name: '三倍満', han: '11-12翻', ronKo: 24000, tsumoKo: '6000-12000', ronOya: 36000, tsumoOya: '12000オール' },
    { name: '役満', han: '13翻~', ronKo: 32000, tsumoKo: '8000-16000', ronOya: 48000, tsumoOya: '16000オール' },
]

type WinType = 'ron' | 'tsumo'

export function ScoreTable() {
    const [activeTab, setActiveTab] = useState<Role>('ko')
    const [viewMode, setViewMode] = useState<ViewMode>('normal')
    const [winType, setWinType] = useState<WinType>('ron')

    const toggleRole = () => setActiveTab(prev => prev === 'ko' ? 'oya' : 'ko')
    const toggleViewMode = () => setViewMode(prev => prev === 'normal' ? 'high_score' : 'normal')

    const isKo = activeTab === 'ko'

    return (
        <div className="w-full relative pb-20">
            {/* Header Area */}
            <div className="flex items-center justify-end mb-4">
                {/* Win Type Switcher */}
                <div className="bg-gray-100 p-0.5 rounded-lg flex shadow-sm border border-gray-200">
                    <button
                        onClick={() => setWinType('ron')}
                        className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all min-w-[80px] ${winType === 'ron'
                            ? '!bg-red-500 !text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        ロン
                    </button>
                    <button
                        onClick={() => setWinType('tsumo')}
                        className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all min-w-[80px] ${winType === 'tsumo'
                            ? '!bg-gray-800 !text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        ツモ
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setActiveTab('ko')}
                    className={`w-40 py-3 font-bold text-lg rounded-l-lg shadow-md transition-all border-y border-l ${activeTab === 'ko'
                        ? '!bg-blue-600 !text-white !border-blue-600'
                        : '!bg-blue-100 !text-blue-600 !border-blue-600 hover:!bg-blue-200'
                        }`}
                >
                    子の点数表
                </button>
                <button
                    onClick={() => setActiveTab('oya')}
                    className={`w-40 py-3 font-bold text-lg rounded-r-lg shadow-md transition-all border-y border-r ${activeTab === 'oya'
                        ? '!bg-blue-600 !text-white !border-blue-600'
                        : '!bg-blue-100 !text-blue-600 !border-blue-600 hover:!bg-blue-200'
                        }`}
                >
                    親の点数表
                </button>
            </div>

            {/* View Mode Switcher (Segmented Control) */}
            <div className="flex justify-center mb-6">
                <div className="bg-blue-50 p-1 rounded-lg flex shadow-inner border border-blue-100">
                    <button
                        onClick={() => setViewMode('normal')}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all min-w-[120px] ${viewMode === 'normal'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-blue-600 hover:bg-blue-100'
                            }`}
                    >
                        通常 (符計算)
                    </button>
                    <button
                        onClick={() => setViewMode('high_score')}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all min-w-[120px] ${viewMode === 'high_score'
                            ? '!bg-blue-600 !text-white shadow-sm'
                            : 'text-blue-600 hover:bg-blue-100'
                            }`}
                    >
                        満貫以上
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
                                    <th key={han} className="bg-gray-200 border border-gray-300 py-3 font-bold text-lg text-gray-700">
                                        {han}翻
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FU_ROWS.map((fu, idx) => (
                                <tr key={fu} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="bg-gray-200 border border-gray-300 font-bold text-lg text-gray-700 py-1">
                                        {fu}符
                                    </td>
                                    {HAN_COLS.map(han => {
                                        if ((han === 1 && fu === 20) || (han === 1 && fu === 25) || (han === 2 && fu === 25)) {
                                            return (
                                                <td key={han} className="border border-gray-300 text-gray-300 bg-gray-50/50">
                                                    <div className="text-gray-300 text-lg">-</div>
                                                </td>
                                            )
                                        }

                                        const score = isKo
                                            ? calculateKoScore(han, fu)
                                            : calculateOyaScore(han, fu)

                                        if (score.isMangan) {
                                            return (
                                                <td key={han} className="border border-gray-300 p-1 bg-blue-50/30">
                                                    <div className="flex items-center justify-center h-full text-lg text-gray-600 py-2">
                                                        満貫
                                                    </div>
                                                </td>
                                            )
                                        }

                                        // Special case marker logic removed as requested

                                        return (
                                            <td key={han} className="border border-gray-300 p-2 relative h-12 align-middle">
                                                {winType === 'ron' && (
                                                    <div className="text-gray-800 text-lg">
                                                        {score.ron}
                                                    </div>
                                                )}
                                                {winType === 'tsumo' && (
                                                    <div className="text-gray-800 text-lg">
                                                        {typeof score.tsumo === 'string'
                                                            ? score.tsumo.replace('オール', '')
                                                            : score.tsumo
                                                        }
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
                                <th className="bg-gray-200 border border-gray-300 py-3 font-bold text-gray-700">役</th>
                                <th className="bg-gray-200 border border-gray-300 py-3 font-bold text-gray-700">翻数</th>
                                <th className="bg-gray-200 border border-gray-300 py-3 font-bold text-gray-700">
                                    点数
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {HIGH_SCORES.map((item, idx) => (
                                <tr key={item.name} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="bg-gray-200 border border-gray-300 font-bold text-lg text-gray-700 py-4">
                                        {item.name}
                                    </td>
                                    <td className="border border-gray-300 font-medium text-gray-600">
                                        {item.han}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {winType === 'ron' && (
                                            <div className="text-gray-800 text-lg">
                                                {isKo ? item.ronKo : item.ronOya}
                                            </div>
                                        )}
                                        {winType === 'tsumo' && (
                                            <div className="text-gray-800 text-lg">
                                                {isKo ? item.tsumoKo.replace('オール', '') : typeof item.tsumoOya === 'string' ? item.tsumoOya.replace('オール', '') : item.tsumoOya}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
