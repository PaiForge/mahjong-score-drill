import { useState } from 'react'
import { DrillBoard } from './features/drill/components/DrillBoard'
import { SetupScreen } from './features/drill/components/SetupScreen'

function App() {
  // クエリパラメータがある場合は直接ドリルを開始する（パーマリンク対応）
  const [isDrillStarted, setIsDrillStarted] = useState(() => {
    return window.location.search.length > 0
  })

  if (!isDrillStarted) {
    return <SetupScreen onStart={() => setIsDrillStarted(true)} />
  }

  return <DrillBoard onBackToSetup={() => setIsDrillStarted(false)} />
}

export default App
