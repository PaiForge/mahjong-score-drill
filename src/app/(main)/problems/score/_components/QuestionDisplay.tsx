'use client'

import { Hai, Furo } from '@pai-forge/mahjong-react-ui'
import { HaiKind, MentsuType, FuroType } from '@pai-forge/riichi-mahjong'
import { RiichiStick } from '@/app/_components/RiichiStick'
import type { DrillQuestion } from '@/lib/problem/types'
import { getKazeName, getDoraFromIndicator } from '@/lib/core/haiNames'
import { useResponsiveHaiSize } from '../_hooks/useResponsiveHaiSize'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  question: DrillQuestion
}

export function QuestionDisplay({ question }: Props) {
  const tProblems = useTranslations('problems')
  const { tehai, agariHai, isTsumo, jikaze, bakaze, doraMarkers } = question
  const isOya = jikaze === HaiKind.Ton
  const haiSize = useResponsiveHaiSize()

  // 手牌から和了牌を1枚除外して13枚にする
  const closedWithoutAgari = (() => {
    const index = tehai.closed.lastIndexOf(agariHai)
    if (index === -1) return tehai.closed
    return [...tehai.closed.slice(0, index), ...tehai.closed.slice(index + 1)]
  })()

  // 槓子とそれ以外の副露を分離
  const kantsuList = tehai.exposed.filter(m => m.type === MentsuType.Kantsu)
  const otherFuroList = tehai.exposed.filter(m => m.type !== MentsuType.Kantsu)

  return (
    <div className="space-y-6">
      {/* 手牌表示 */}
      <div className="bg-green-800 rounded-lg p-2">
        {/* 場風・自風 */}
        <div className="text-white text-sm mb-4 flex items-center justify-center gap-4">
          <div>
            {getKazeName(bakaze)}{tProblems('question.round')} {getKazeName(jikaze)}{tProblems('question.wind')}
            {isOya ? <span className="text-yellow-300 ml-2">{tProblems('question.dealer')}</span> : <span className="text-white ml-2">{tProblems('question.nonDealer')}</span>}
          </div>
          {question.isRiichi && (
            <div className="flex items-center gap-2">
              <RiichiStick width={80} className="scale-75 origin-left" />
              <span className="text-red-400 font-bold text-xs">{tProblems('question.riichi')}</span>
            </div>
          )}
        </div>

        {/* 副露 (槓子のみ右上) */}
        {kantsuList.length > 0 && (
          <div className="flex justify-end w-full mb-2 px-4">
            <div className="flex gap-2">
              {kantsuList.map((mentsu, index) => (
                <Furo
                  key={`kan-${index}`}
                  mentsu={mentsu}
                  furo={mentsu.furo}
                  size={haiSize}
                  className={
                    !mentsu.furo || mentsu.furo.type !== FuroType.Daiminkan
                      ? 'ankan-furo'
                      : ''
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end justify-center w-full">
          {/* 門前手牌（13枚） */}
          <div className="flex shrink-0">
            {closedWithoutAgari.map((kindId, index) => (
              <Hai key={index} hai={kindId} size={haiSize} />
            ))}
          </div>

          {/* その他の副露 (右下) */}
          {otherFuroList.length > 0 && (
            <div className={cn("flex shrink-0", haiSize === 'xs' ? 'ml-1' : 'ml-2')}>
              {otherFuroList.map((mentsu, index) => (
                <Furo key={`other-${index}`} mentsu={mentsu} furo={mentsu.furo} size={haiSize} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 状況表示 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* ツモ/ロン + 和了牌 */}
        <div className="bg-slate-100 rounded-lg p-3">
          <div className="text-slate-500 text-xs mb-1">{tProblems('question.win')}</div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs">{isTsumo ? tProblems('question.tsumo') : tProblems('question.ron')}</span>
            <Hai hai={agariHai} size={haiSize} highlighted />
          </div>
        </div>

        {/* ドラ */}
        {/* ドラ & 裏ドラ */}
        <div className="bg-slate-100 rounded-lg p-3 flex gap-4">
          <div>
            <div className="text-slate-500 text-xs mb-1">{tProblems('question.dora')}</div>
            <div className="flex gap-1">
              {doraMarkers.map((marker, index) => (
                <Hai key={index} hai={getDoraFromIndicator(marker)} size={haiSize} />
              ))}
            </div>
          </div>
          {question.isRiichi && question.uraDoraMarkers && (
            <div className="border-l border-slate-300 pl-4">
              <div className="text-slate-500 text-xs mb-1">{tProblems('question.uraDora')}</div>
              <div className="flex gap-1">
                {question.uraDoraMarkers.map((marker, index) => (
                  <Hai key={`ura-${index}`} hai={getDoraFromIndicator(marker)} size={haiSize} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
