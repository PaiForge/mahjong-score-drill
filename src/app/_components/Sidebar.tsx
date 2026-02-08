'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/app/_contexts/SidebarContext'

interface NavigationItem {
    readonly id: string
    readonly href: string
    readonly label: string
}

interface NavigationSection {
    readonly title?: string
    readonly href?: string
    readonly items: NavigationItem[]
    readonly withSeparator?: boolean
}

const navigationSections: NavigationSection[] = [
    {
        items: [
            { id: 'home', href: '/', label: 'Home' },
        ]
    },
    {
        title: 'ドリル',
        href: '/problems',
        withSeparator: true,
        items: [
            { id: 'jantou-fu', href: '/problems/jantou-fu', label: '雀頭の符計算' },
            { id: 'machi-fu', href: '/problems/machi-fu', label: '待ちの符計算' },
            { id: 'mentsu-fu', href: '/problems/mentsu-fu', label: '面子の符計算' },
            { id: 'tehai-fu', href: '/problems/tehai-fu', label: '手牌の符計算' },
            { id: 'score', href: '/problems/score', label: '点数計算ドリル' },
        ]
    },
    {
        title: '記事',
        href: '/articles',
        items: [
            { id: 'introduction', href: '/articles/introduction', label: 'はじめに' },
        ]
    },
    {
        withSeparator: true,
        items: [
            { id: 'cheatsheet', href: '/cheatsheet', label: '点数早見表' },
        ]
    }
]

/**
 * トグル式サイドバーコンポーネント
 *
 * ヘッダーのボタンでトグルし、左からスライドインするサイドバー。
 * PC/スマホ共通のレイアウト。
 */
export function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar()
    const pathname = usePathname()

    return (
        <>
            {/* オーバーレイ（ヘッダー下から表示） */}
            {isOpen && (
                <div
                    className="fixed top-0 inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* サイドバーパネル */}
            <div
                className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* ナビゲーションリンク */}
                <nav className="py-4 pt-20 overflow-y-auto max-h-full">
                    <div className="space-y-6">


                        {navigationSections.map((section, idx) => (
                            <div key={idx} className={section.withSeparator ? "border-t border-slate-100 pt-4 mt-4 px-3" : "px-3"}>
                                {section.title && (
                                    section.href ? (
                                        <Link
                                            href={section.href}
                                            onClick={closeSidebar}
                                            className="block px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-blue-600 transition-colors"
                                        >
                                            {section.title}
                                        </Link>
                                    ) : (
                                        <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {section.title}
                                        </h3>
                                    )
                                )}
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.href}
                                                    onClick={closeSidebar}
                                                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </nav>
            </div>
        </>
    )
}
