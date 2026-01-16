import Link from 'next/link'
import { ScoreTable } from '../(home)/_components/ScoreTable'

export default function CheatsheetPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
            <div className="w-full max-w-5xl mx-auto space-y-6">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">麻雀点数早見表</h1>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                    >
                        ← Back to Home
                    </Link>
                </header>

                <main className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
                    <ScoreTable />
                </main>
            </div>
        </div>
    )
}
