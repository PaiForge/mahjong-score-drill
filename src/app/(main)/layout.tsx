
import { Header } from '@/app/_components/Header'
import { Sidebar } from '@/app/_components/Sidebar'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header />
                <Sidebar />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </>
    )
}
