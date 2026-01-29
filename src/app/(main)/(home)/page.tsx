import { LandingPage } from './_components/LandingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return <LandingPage />
}
