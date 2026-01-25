'use client'

import { SetupScreen } from '@/app/(main)/(home)/_components/SetupScreen'
import { PageTitle } from '@/app/_components/PageTitle'

export default function ScoreSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            <PageTitle>点数計算ドリル</PageTitle>
            <SetupScreen hideDrillLinks={true} />
        </div>
    )
}
