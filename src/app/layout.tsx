import './globals.css'
import { GlobalCheatsheet } from '@/app/_components/GlobalCheatsheet'
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
          {children}
          <GlobalCheatsheet />
        </I18nProvider>
      </body>
    </html>
  )
}
