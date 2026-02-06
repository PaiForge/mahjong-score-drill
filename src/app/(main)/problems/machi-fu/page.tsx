import { PageTitle } from '@/app/_components/PageTitle'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '待ちの符計算 | Mahjong Score Drill',
    description: '待ちの形（ペンチャン・カンチャン・単騎など）による符計算ドリル。聴牌時の待ちによる加符を練習できます。',
}

export default function MachiFuSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center max-w-2xl">
            <PageTitle>待ちの符計算</PageTitle>

            <div className="bg-white rounded-xl shadow-sm p-8 w-full mb-8 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">ルール説明</h2>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            聴牌の形（待ち）から付く符を回答するドリルです。
                        </p>
                        <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-lg">
                            <li>
                                <span className="font-bold text-gray-800">嵌張（カンチャン）・辺張（ペンチャン）・単騎（タンキ）</span>：2符
                            </li>
                            <li>
                                <span className="font-bold text-gray-800">両面（リャンメン）・双碰（シャンポン）</span>：0符
                            </li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-4">
                            ※ ノベタンは単騎待ちとみなされ2符が付きます。
                        </p>
                    </div>
                </div>

                <Link
                    href="/problems/machi-fu/play"
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
                        待ちの符計算
                    </li>
                </ol>
            </nav>
        </div>
    )
}
