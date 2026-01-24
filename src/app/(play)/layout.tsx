import { GlobalCheatsheet } from '@/app/_components/GlobalCheatsheet'

export default function PlayLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <main className="flex-1 min-h-screen bg-slate-50">
                {children}
            </main>
            <GlobalCheatsheet />
        </>
    )
}
