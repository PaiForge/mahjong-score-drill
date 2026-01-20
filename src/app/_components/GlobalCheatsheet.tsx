'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { ScoreTable } from '../(home)/_components/ScoreTable'
import { useTranslations } from 'next-intl'

export function GlobalCheatsheet() {
    const tHome = useTranslations('home')
    const [isOpen, setIsOpen] = useState(false)

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
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{tHome('setup.links.cheatsheet')}</h2>
                </div>
                <ScoreTable />
            </Modal>
        </>
    )
}
