import './globals.css'
import { GlobalCheatsheet } from '@/app/_components/GlobalCheatsheet'
import { Header } from '@/app/_components/Header'
import { Sidebar } from '@/app/_components/Sidebar'
import { SidebarProvider } from '@/app/_contexts/SidebarContext'
import { I18nProvider } from '@/components/I18nProvider'
import jaMessages from '@/messages/ja.json'

export const metadata = {
  title: 'Mahjong Score Drill',
  description: 'Practice your mahjong scoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <I18nProvider initialLocale="ja" initialMessages={jaMessages}>
          <SidebarProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <Sidebar />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <GlobalCheatsheet />
          </SidebarProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
