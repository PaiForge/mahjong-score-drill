import './globals.css'

import { SidebarProvider } from '@/app/_contexts/SidebarContext'
import { I18nProvider } from '@/components/I18nProvider'
import jaMessages from '@/messages/ja.json'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Metadata } from 'next'

const siteName = '麻雀点数計算ドリル'
const description = '麻雀の点数計算をドリル形式で練習できる無料Webアプリ。符計算・翻数計算・点数申告を繰り返し解いて、実戦で即答できる力を身につけましょう。初心者から上級者まで対応。'
const siteUrl = 'https://score.mahjong.help'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: siteName,
  },
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteName,
    description,
    url: siteUrl,
    siteName,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  description,
  url: siteUrl,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  inLanguage: 'ja',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <I18nProvider initialLocale="ja" initialMessages={jaMessages}>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </I18nProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}
