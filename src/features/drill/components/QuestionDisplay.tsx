import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import type { DrillQuestion } from '../types'
import { getKazeName, getDoraFromIndicator } from '../utils/haiNames'
import { useResponsiveHaiSize } from '../../../hooks/useResponsiveHaiSize'

interface Props {
  question: DrillQuestion
}

export function QuestionDisplay({ question }: Props) {
  const { tehai, agariHai, isTsumo, jikaze, bakaze, doraMarkers } = question
  const isOya = jikaze === bakaze
  const haiSize = useResponsiveHaiSize()

  // 手牌から和了牌を1枚除外して13枚にする
  const closedWithoutAgari = (() => {
    const index = tehai.closed.lastIndexOf(agariHai)
    if (index === -1) return tehai.closed
    return [...tehai.closed.slice(0, index), ...tehai.closed.slice(index + 1)]
  })()

  return (
    <div className="space-y-6">
      {/* 手牌表示 */}
      <div className="bg-green-800 rounded-lg p-2">
        {/* 場風・自風 */}
        <div className="text-white text-sm mb-4">
          {getKazeName(bakaze)}場 {getKazeName(jikaze)}家
          {isOya && <span className="text-yellow-300">(親)</span>}
        </div>
        <div className="flex items-end justify-center w-full">
          {/* 門前手牌（13枚） */}
          <div className="flex shrink-0">
            {closedWithoutAgari.map((kindId, index) => (
              <Hai key={index} hai={kindId} size={haiSize} />
            ))}
          </div>

          {/* 副露 */}
          {tehai.exposed.length > 0 && (
            <div className={`flex shrink-0 ${haiSize === 'xs' ? 'ml-1' : 'ml-2'}`}>
              {tehai.exposed.map((mentsu, index) => (
                <Furo key={index} mentsu={mentsu} furo={mentsu.furo} size={haiSize} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 状況表示 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* ツモ/ロン + 和了牌 */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">和了</div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{isTsumo ? 'ツモ' : 'ロン'}</span>
            <Hai hai={agariHai} size={haiSize} highlighted />
          </div>
        </div>

        {/* ドラ */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">ドラ</div>
          <div className="flex gap-1">
            {doraMarkers.map((marker, index) => (
              <Hai key={index} hai={getDoraFromIndicator(marker)} size={haiSize} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
