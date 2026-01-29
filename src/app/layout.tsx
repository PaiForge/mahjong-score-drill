import './globals.css'

import { SidebarProvider } from '@/app/_contexts/SidebarContext'
import { I18nProvider } from '@/components/I18nProvider'
import jaMessages from '@/messages/ja.json'

export const metadata = {
  metadataBase: new URL('https://score.mahjong.help/'),
  title: {
    template: '%s | Mahjong Score Drill',
    default: 'Mahjong Score Drill',
  },
  description: 'Practice your mahjong scoring',
  openGraph: {
    title: 'Mahjong Score Drill',
    description: 'Practice your mahjong scoring',
    url: 'https://score.mahjong.help/',
    siteName: 'Mahjong Score Drill',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mahjong Score Drill',
    description: 'Practice your mahjong scoring',
  },
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
