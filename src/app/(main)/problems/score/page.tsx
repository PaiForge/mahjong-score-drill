'use client'

import { SetupScreen } from '@/app/(main)/(home)/_components/SetupScreen'

export default function ScoreSetupPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <SetupScreen hideDrillLinks={true} />
        </div>
    )
}
