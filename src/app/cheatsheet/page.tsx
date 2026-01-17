import Link from 'next/link'
import { ScoreTable } from '../(home)/_components/ScoreTable'

export default function CheatsheetPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
            <div className="w-full max-w-5xl mx-auto space-y-6">
                <header className="space-y-4">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            ホームに戻る
                        </Link>
                    </div>
                    <h1 className="!text-3xl !font-extrabold text-slate-800 tracking-tight">麻雀点数早見表</h1>
                </header>

                <main className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
                    <ScoreTable />
                </main>
            </div>
        </div>
    )
}
