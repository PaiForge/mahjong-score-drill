import { ScoreTable } from '../(home)/_components/ScoreTable'

export default function CheatsheetPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <main className="bg-white rounded-xl shadow-md p-6 overflow-hidden">
                    <ScoreTable />
                </main>
            </div>
        </div>
    )
}
