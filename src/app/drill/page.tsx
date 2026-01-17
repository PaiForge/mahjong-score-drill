import { DrillBoard } from './_components/DrillBoard'

interface DrillPageProps {
  searchParams: Promise<{
    tehai?: string
    agari?: string
    tsumo?: string
    dora?: string
    ura?: string
    riichi?: string
    ba?: string
    ji?: string
    mode?: string
  }>
}

export default async function DrillPage({ searchParams }: DrillPageProps) {
  const params = await searchParams

  // パラメータがあればパーマリンクモード or 設定あり
  const hasQueryParams = !!(params.tehai || params.agari || params.dora || params.mode)

  return (
    <DrillBoard
      initialParams={hasQueryParams ? params : undefined}
    />
  )
}
