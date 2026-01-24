'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/app/_contexts/SidebarContext'

/**
 * ヘッダーコンポーネント
 *
 * ロゴとサイドバー開閉ボタンを含むヘッダー。
 * 問題ページでは非表示。
 */
export function Header() {
    const pathname = usePathname()
    const { isOpen, toggleSidebar } = useSidebar()

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center h-14 px-4">
                {/* ハンバーガーボタン */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors mr-3"
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

                {/* ロゴ + タイトル */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="麻雀点数ドリル"
                        width={40}
                        height={40}
                        className="rounded"
                    />
                    <span className="text-lg font-bold text-gray-800">
                        麻雀点数ドリル
                    </span>
                </Link>
            </div>
        </header>
    )
}
