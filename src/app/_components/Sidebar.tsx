'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/app/_contexts/SidebarContext'

interface NavigationItem {
    readonly id: string
    readonly href: string
    readonly label: string
}

const navigationItems: NavigationItem[] = [
    { id: 'home', href: '/', label: 'ホーム' },
    { id: 'introduction', href: '/articles/introduction', label: '点数計算とは' },
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
                    className="fixed top-14 inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* サイドバーパネル */}
            <div
                className={`fixed top-14 left-0 bottom-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* ナビゲーションリンク */}
                <nav className="py-4">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.id}>
                                    <Link
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`block px-4 py-3 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        </>
    )
}
