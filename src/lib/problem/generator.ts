import {
  HaiKind,
  calculateScoreForTehai,
  detectYaku,
  isMenzen,
  type HaiKindId,
  type Kazehai,
  type ScoreResult,
} from '@pai-forge/riichi-mahjong'
import {
  convertScoreDetailToFuDetails,
} from '@/lib/score/fuCalculator'
import { ScoreLevel, getYakuNameJa, KAZEHAI } from '@/lib/core/constants'
import { randomChoice } from '@/lib/core/random'
import { countDoraInTehai } from '@/lib/core/haiNames'

import type { DrillQuestion, QuestionGeneratorOptions, YakuDetail } from './types'
import { ProblemGenerator } from './interfaces'
import { ScoreReconciler, type ReconcilerContext } from './utils/reconciler'
import { MentsuTehaiStrategy } from './strategies/mentsuStrategy'
import { ChiitoiTehaiStrategy } from './strategies/chiitoiStrategy'

// =========================================================================
// Helper Functions (kept in file or could be moved)
// =========================================================================

function generateDoraMarkers(kantsuCount: number): HaiKindId[] {
  const count = 1 + kantsuCount
  const markers: HaiKindId[] = []
  for (let i = 0; i < count; i++) {
    const kindId = Math.floor(Math.random() * 34) as HaiKindId
    markers.push(kindId)
  }
  return markers
}

function countKantsu(tehai: any): number {
  if (!tehai.exposed) return 0
  return tehai.exposed.filter((mentsu: any) => mentsu.type === 'Kantsu').length
}

function validateScoreRange(scoreLevel: string, allowedRanges: readonly ('non_mangan' | 'mangan_plus')[]): boolean {
  if (allowedRanges.length === 1 && allowedRanges[0] === 'non_mangan' && scoreLevel !== ScoreLevel.Normal) return false
  if (allowedRanges.length === 1 && allowedRanges[0] === 'mangan_plus' && scoreLevel === ScoreLevel.Normal) return false
  return true
}

// =========================================================================
// Main Generator
// =========================================================================

export class ScoreDrillGenerator implements ProblemGenerator<DrillQuestion | null, QuestionGeneratorOptions> {
  generate(options: QuestionGeneratorOptions = {}): DrillQuestion | null {
    const { includeFuro = true, includeChiitoi = false, includeParent = true, includeChild = true } = options

    const isChiitoi = includeChiitoi && Math.random() < 0.1

    let tehaiResult
    if (isChiitoi) {
      tehaiResult = new ChiitoiTehaiStrategy().generate()
    } else {
      tehaiResult = new MentsuTehaiStrategy().generate(includeFuro)
    }

    if (!tehaiResult) return null

    const { tehai, agariHai } = tehaiResult

    const isTsumo = Math.random() < 0.5

    let validKazehai: Kazehai[] = [...KAZEHAI]
    if (!includeParent) validKazehai = validKazehai.filter(k => k !== HaiKind.Ton)
    if (!includeChild) validKazehai = validKazehai.filter(k => k === HaiKind.Ton)
    if (validKazehai.length === 0) validKazehai = [...KAZEHAI]

    const jikaze = randomChoice(validKazehai)
    const bakaze = randomChoice([HaiKind.Ton, HaiKind.Nan] as Kazehai[])

    const kantsuCount = countKantsu(tehai)
    const doraMarkers = generateDoraMarkers(kantsuCount)

    // ライブラリ境界の防御: calculateScoreForTehai / detectYaku は例外を投げうるため try/catch で保護
    try {
      let answer = calculateScoreForTehai(tehai, { agariHai, isTsumo, jikaze, bakaze, doraMarkers })
      const yakuResult = detectYaku(tehai, { agariHai, bakaze, jikaze, doraMarkers, isTsumo })
      const yakuDetails: YakuDetail[] = []

      yakuResult.forEach(([name, han]) => {
        yakuDetails.push({ name: getYakuNameJa(name as string), han })
      })

      let finalAnswer = ScoreReconciler.reconcileYakuhai(tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, isTsumo)
      if (finalAnswer.han === 0) return null

      const isRiichi = isMenzen(tehai) && Math.random() < 0.2
      let uraDoraMarkers: HaiKindId[] | undefined

      if (isRiichi) {
        const riichiRes = ScoreReconciler.applyRiichiAndUraDora(tehai, finalAnswer, yakuDetails, kantsuCount, isTsumo, jikaze)
        finalAnswer = riichiRes.answer
        uraDoraMarkers = riichiRes.uraDoraMarkers
      }

      const doraHan = countDoraInTehai(tehai, doraMarkers)
      if (doraHan > 0 && !yakuDetails.find(d => d.name === 'ドラ')) {
        yakuDetails.push({ name: 'ドラ', han: doraHan })
      }

      const fuDetails = answer.detail
        ? convertScoreDetailToFuDetails(answer.detail, { agariHai, isTsumo, bakaze, jikaze })
        : undefined

      const { allowedRanges = ['non_mangan', 'mangan_plus'] } = options

      if (!validateScoreRange(finalAnswer.scoreLevel, allowedRanges)) return null

      // Skipping the massive boostToMangan here for brevity and complexity reduction, 
      // as it was mostly a hack for generating specific scores.
      // If strictly needed later, it can go back to Reconciler.

      return {
        tehai,
        agariHai,
        isTsumo,
        jikaze,
        bakaze,
        doraMarkers,
        isRiichi,
        uraDoraMarkers,
        answer: finalAnswer,
        fuDetails,
        yakuDetails,
      }
    } catch {
      return null
    }
  }
}

/**
 * 有効な問題が生成されるまでリトライするヘルパー（後方互換性用）
 */
export function generateValidQuestion(
  options: QuestionGeneratorOptions = {},
  maxRetries: number = 100
): DrillQuestion | null {
  const generator = new ScoreDrillGenerator()
  for (let i = 0; i < maxRetries; i++) {
    const question = generator.generate(options)
    if (question) return question
  }
  return null
}
