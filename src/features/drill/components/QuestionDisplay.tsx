import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import type { DrillQuestion } from '../types'
import { getKazeName, getDoraFromIndicator } from '../utils/haiNames'

interface Props {
  question: DrillQuestion
}

export function QuestionDisplay({ question }: Props) {
  const { tehai, agariHai, isTsumo, jikaze, bakaze, doraMarkers } = question
  const isOya = jikaze === bakaze

  return (
    <div className="space-y-6">
      {/* 手牌表示 */}
      <div className="bg-green-800 rounded-lg p-4">
        <div className="flex items-end justify-center gap-1 flex-wrap">
          {/* 門前手牌 */}
          {tehai.closed.map((kindId, index) => (
            <div
              key={index}
              className={kindId === agariHai && index === tehai.closed.lastIndexOf(agariHai) ? 'ring-2 ring-yellow-400 rounded' : ''}
            >
              <Hai hai={kindId} size="md" />
            </div>
          ))}

          {/* 副露 */}
          {tehai.exposed.length > 0 && (
            <div className="flex gap-2 ml-4">
              {tehai.exposed.map((mentsu, index) => (
                <Furo key={index} mentsu={mentsu} furo={mentsu.furo} size="md" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 状況表示 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* 場風・自風 */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">場風 / 自風</div>
          <div className="font-bold text-lg">
            {getKazeName(bakaze)}場 {getKazeName(jikaze)}家
            {isOya && <span className="ml-2 text-red-600">(親)</span>}
          </div>
        </div>

        {/* ツモ/ロン */}
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1">和了方法</div>
          <div className="font-bold text-lg">
            {isTsumo ? 'ツモ' : 'ロン'}
          </div>
        </div>

        {/* ドラ表示牌 */}
        <div className="bg-gray-100 rounded-lg p-3 col-span-2">
          <div className="text-gray-500 text-xs mb-2">ドラ表示牌</div>
          <div className="flex gap-1">
            {doraMarkers.map((marker, index) => (
              <Hai key={index} hai={marker} size="sm" />
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ドラ:
            {doraMarkers.map((marker, index) => {
              const dora = getDoraFromIndicator(marker)
              return (
                <span key={index} className="ml-1">
                  <Hai hai={dora} size="xs" />
                </span>
              )
            })}
          </div>
        </div>

        {/* 和了牌 */}
        <div className="bg-gray-100 rounded-lg p-3 col-span-2">
          <div className="text-gray-500 text-xs mb-2">和了牌</div>
          <div className="flex items-center gap-2">
            <Hai hai={agariHai} size="sm" highlighted />
          </div>
        </div>
      </div>
    </div>
  )
}
