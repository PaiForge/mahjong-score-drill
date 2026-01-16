import type { Metadata } from 'next'
import '@pai-forge/mahjong-react-ui/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: '麻雀点数計算ドリル',
  description: 'ランダムに出題される点数計算問題を解いて、計算力を鍛えましょう。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
