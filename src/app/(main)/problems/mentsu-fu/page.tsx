import { PageTitle } from '@/app/_components/PageTitle'
import { SectionHeader } from '@/app/_components/SectionHeader'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '面子の符計算 | Mahjong Score Drill',
    description: '面子の構成（明刻・暗刻・明槓・暗槓）による符計算ドリル。順子と刻子・槓子の違いによる符を練習できます。',
}

export default function MentsuFuSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center max-w-4xl">
            <PageTitle>面子の符計算</PageTitle>

            {/* ... */}

            <div className="w-full mb-8 space-y-8">
                <div>
                    <SectionHeader>ルール説明</SectionHeader>
                    <div className="space-y-4 text-gray-600">
                        <p>
                            表示された面子の構成（明刻・暗刻など）から付く符を回答するドリルです。
                        </p>
                        <ul className="list-disc list-inside space-y-2 bg-gray-50 p-4 rounded-lg">
                            <li><span className="font-bold text-gray-800">順子</span>：0符</li>
                            <li><span className="font-bold text-gray-800">中張牌の明刻</span>：2符</li>
                            <li><span className="font-bold text-gray-800">幺九牌の明刻・中張牌の暗刻</span>：4符</li>
                            <li><span className="font-bold text-gray-800">幺九牌の暗刻・中張牌の明槓</span>：8符</li>
                            <li><span className="font-bold text-gray-800">幺九牌の明槓・中張牌の暗槓</span>：16符</li>
                            <li><span className="font-bold text-gray-800">幺九牌の暗槓</span>：32符</li>
                        </ul>
                    </div>
                </div>

                <Link
                    href="/problems/mentsu-fu/play"
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
                        面子の符計算
                    </li>
                </ol>
            </nav>
        </div>
    )
}
