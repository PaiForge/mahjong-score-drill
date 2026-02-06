import { ScoreTable } from '@/app/(main)/(home)/_components/ScoreTable'
import { Metadata } from 'next'
import { Header } from '@/app/_components/Header'
import { Sidebar } from '@/app/_components/Sidebar'

export const metadata: Metadata = {
    title: '点数早見表 | Mahjong Score Drill',
    description: '麻雀の点数計算早見表（符×翻）。親・子の点数を一覧で確認できます。',
}

import Link from 'next/link'

export default function CheatsheetPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8">
            <Header />
            <Sidebar />
            <div className="w-full max-w-5xl mx-auto">
                <ScoreTable />
            </div>

            <nav className="mt-8 pt-8 border-t border-slate-200 w-full max-w-5xl" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-slate-500">
                    <li>
                        <Link href="/" className="hover:text-amber-600 transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>
                        <span className="mx-2 text-slate-300">/</span>
                    </li>
                    <li className="text-slate-800 font-medium" aria-current="page">
                        点数早見表
                    </li>
                </ol>
            </nav>
        </div>
    )
}
