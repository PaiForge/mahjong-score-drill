import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'ドリル一覧 | Mahjong Score Drill',
    description: '麻雀の点数計算練習ドリル一覧。符計算（雀頭・待ち・面子・手牌）と点数計算の総合問題を練習できます。',
}

// Drill data sorted by difficulty/requested order
const DRILLS = [
    {
        id: 'jantou-fu',
        title: '符計算ドリル（雀頭）',
        description: '役牌や連風牌の雀頭につく符を答えよう',
        href: '/problems/jantou-fu',
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        icon: '🀅'
    },
    {
        id: 'machi-fu',
        title: '符計算ドリル（待ち）',
        description: 'ペンチャン・カンチャン・単騎などの待ちの符を答えよう',
        href: '/problems/machi-fu',
        color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
        icon: '🀈'
    },
    {
        id: 'mentsu-fu',
        title: '符計算ドリル（面子）',
        description: '明刻・暗刻・明槓・暗槓の符を答えよう',
        href: '/problems/mentsu-fu',
        color: 'bg-green-50 hover:bg-green-100 border-green-200',
        icon: '🀙'
    },
    {
        id: 'tehai-fu',
        title: '符計算ドリル（手牌）',
        description: '手牌全体の構成要素から符を計算しよう',
        href: '/problems/tehai-fu',
        color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
        icon: '🀐'
    },
    {
        id: 'score',
        title: '点数計算ドリル',
        description: '翻数と符から点数を計算する総合ドリル',
        href: '/problems/score',
        color: 'bg-red-50 hover:bg-red-100 border-red-200',
        icon: '🀀'
    }
]

import { PageTitle } from '@/app/_components/PageTitle'

export default function ProblemsPage() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <PageTitle>ドリル一覧</PageTitle>
            <p className="text-slate-500 mb-8">
                基礎から応用まで、段階的に符計算・点数計算をマスターしましょう。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DRILLS.map((drill) => (
                    <Link key={drill.id} href={drill.href} className="block group">
                        <div className={cn(
                            "h-full rounded-xl border-2 p-6 transition-all duration-200",
                            drill.color,
                            "group-hover:shadow-md group-hover:-translate-y-1"
                        )}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-4xl bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                    {drill.icon}
                                </div>
                                <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-100/50">
                                    Drill
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                                {drill.title}
                            </h2>
                            <p className="text-slate-600 font-medium">
                                {drill.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <nav className="mt-8 pt-8 border-t border-slate-200 w-full" aria-label="Breadcrumb">
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
                        ドリル一覧
                    </li>
                </ol>
            </nav>
        </div>
    )
}
