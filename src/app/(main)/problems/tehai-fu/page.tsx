import { PageTitle } from '@/app/_components/PageTitle'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '手牌の符計算 | Mahjong Score Drill',
    description: '手牌全体の符計算ドリル。副底（20符）に加え、面子・雀頭・待ち・ツモ/ロンによる加符を総合的に計算する練習ができます。',
}

export default function TehaiFuSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center max-w-2xl">
            <PageTitle>手牌の符計算</PageTitle>

            <div className="bg-white rounded-xl shadow-sm p-8 w-full mb-8 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">ルール説明</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            手牌全体の形（面子構成・雀頭・待ち）から、すべての符計算要素を漏れなく回答する総合ドリルです。
                        </p>
                        <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-lg">
                            <li>すべての面子の符（順子0符、明刻2符〜）</li>
                            <li>雀頭の符（役牌2符、それ以外0符）</li>
                            <li>待ちの符（嵌張・辺張・単騎2符、それ以外0符）</li>
                            <li>自摸（ツモ）符（2符 ※平和ツモを除く）</li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-4">
                            ※ 実戦形式の計算練習に最適です。
                        </p>
                    </div>
                </div>

                <Link
                    href="/problems/tehai-fu/play"
                    className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <span>開始する</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            <nav className="mt-4 pt-8 border-t border-slate-200 w-full max-w-2xl" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-slate-500">
                    <li>
                        <Link href="/" className="hover:text-amber-600 transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>
                        <span className="mx-2 text-slate-300">/</span>
                    </li>
                    <li>
                        <Link href="/problems" className="hover:text-amber-600 transition-colors">
                            ドリル
                        </Link>
                    </li>
                    <li>
                        <span className="mx-2 text-slate-300">/</span>
                    </li>
                    <li className="text-slate-800 font-medium" aria-current="page">
                        手牌の符計算
                    </li>
                </ol>
            </nav>
        </div>
    )
}
