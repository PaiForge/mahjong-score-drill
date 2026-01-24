import './globals.css'

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
            {children}
          </SidebarProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
