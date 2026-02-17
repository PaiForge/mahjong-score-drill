import { SetupScreen } from '@/app/(main)/(home)/_components/SetupScreen'
import { PageTitle } from '@/app/_components/PageTitle'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '点数計算ドリル',
    description: '麻雀の点数計算（符数×翻数）をマスターするための実践ドリル。実戦形式で素早く正確に計算する力を養います。',
}

export default function ScoreSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center max-w-4xl">
            <PageTitle>点数計算ドリル</PageTitle>
            <SetupScreen
                hideDrillLinks={true}
                hideTitle={true}
                className="max-w-full"
            />

            <nav className="mt-8 pt-8 border-t border-slate-200 w-full max-w-2xl" aria-label="Breadcrumb">
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
                        点数計算ドリル
                    </li>
                </ol>
            </nav>
        </div>
    )
}
