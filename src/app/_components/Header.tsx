'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSidebar } from '@/app/_contexts/SidebarContext'

/**
 * ヘッダーコンポーネント
 *
 * ロゴとサイドバー開閉ボタンを含むヘッダー。
 * 初期状態は背景透明、スクロール時に背景がかかる。
 */
export function Header() {
    const pathname = usePathname()
    const { isOpen, toggleSidebar } = useSidebar()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-transparent'
                    : 'bg-white/80 backdrop-blur-md shadow-sm'
            }`}
        >
            <div className="flex items-center h-20 px-4">
                {/* ハンバーガーボタン */}
                <button
                    onClick={toggleSidebar}
                    className={`p-2.5 transition-all duration-300 mr-3 ${
                        isScrolled
                            ? 'bg-white rounded-full shadow-md hover:bg-gray-100'
                            : 'rounded-md hover:bg-gray-500/10'
                    }`}
                    aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
                    aria-expanded={isOpen}
                >
                    {isOpen ? (
                        // 閉じるアイコン (X)
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
                            className="text-gray-700"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        // ハンバーガーアイコン
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
                            className="text-gray-700"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>

                {/* ロゴ */}
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="麻雀点数ドリル"
                        width={48}
                        height={48}
                        className="rounded"
                    />
                </Link>
            </div>
        </header>
    )
}
