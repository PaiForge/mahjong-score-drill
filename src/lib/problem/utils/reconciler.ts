import {
    type HaiKindId,
    type Tehai14,
    type Kazehai,
    type ScoreResult,
} from '@pai-forge/riichi-mahjong'
import type { YakuDetail } from '../types'
import { recalculateScore } from '@/lib/score/calculator'
import { getKeyForKazehai } from '@/lib/core/haiNames'

/** ブースト処理のコンテキスト */
export interface ReconcilerContext {
    readonly tehai: Tehai14
    readonly agariHai: HaiKindId
    readonly isTsumo: boolean
    readonly jikaze: Kazehai
    readonly bakaze: Kazehai
    readonly isRiichi: boolean
    readonly doraMarkers: HaiKindId[]
    readonly uraDoraMarkers: HaiKindId[] | undefined
    readonly yakuDetails: YakuDetail[]
    readonly currentAnswer: ScoreResult
}

export class ScoreReconciler {
    /**
     * 役牌照合ロジック
     * ライブラリの判定結果と手牌の実態を比較し、不足分があれば修正する
     */
    static reconcileYakuhai(
        tehai: Tehai14,
        yakuResult: readonly (readonly [string, number])[],
        yakuDetails: YakuDetail[],
        answer: ScoreResult,
        bakaze: Kazehai,
        jikaze: Kazehai,
        isTsumo: boolean
    ): ScoreResult {
        const countHai = (id: HaiKindId) => {
            let c = tehai.closed.filter((h: any) => h === id || (h && h.id === id)).length
            tehai.exposed.forEach(m => c += m.hais.filter((h: any) => h === id || (h && h.id === id)).length)
            return c
        }

        let extraYakuhaiHan = 0

        // ... (Original logic from reconcileYakuhai inside generator.ts)
        const hasDoubleWind = yakuResult.some(y => y[0] === 'ダブ東' || y[0] === 'ダブ南')
        const hasBakaze = yakuResult.some(y => y[0] === '場風牌' || y[0] === getKeyForKazehai(bakaze))
        const hasJikaze = yakuResult.some(y => y[0] === '自風牌' || y[0] === getKeyForKazehai(jikaze))

        if (bakaze === jikaze) {
            if (!hasDoubleWind && countHai(bakaze) >= 3) {
                extraYakuhaiHan += 2
                yakuDetails.push({ name: '連風牌', han: 2 })
            }
        } else {
            if (!hasBakaze && countHai(bakaze) >= 3) {
                extraYakuhaiHan += 1
                yakuDetails.push({ name: '場風牌', han: 1 })
            }
            if (!hasJikaze && countHai(jikaze) >= 3) {
                extraYakuhaiHan += 1
                yakuDetails.push({ name: '自風牌', han: 1 })
            }
        }

        // Check dragons
        const dragons = [
            { id: 31, name: '役牌 白' },
            { id: 32, name: '役牌 發' },
            { id: 33, name: '役牌 中' },
        ] as const

        for (const { id, name } of dragons) {
            const hasDragon = yakuResult.some(y => y[0] === name || y[0] === name.replace('役牌 ', ''))
            if (!hasDragon && countHai(id as HaiKindId) >= 3) {
                extraYakuhaiHan += 1
                yakuDetails.push({ name, han: 1 })
            }
        }

        if (extraYakuhaiHan > 0) {
            const newHan = answer.han + extraYakuhaiHan
            return recalculateScore(answer, newHan, {
                isTsumo,
                isOya: jikaze === 27 // HaiKind.Ton
            })
        }

        return answer
    }

    /**
     * リーチ・裏ドラの適用
     */
    static applyRiichiAndUraDora(
        tehai: Tehai14,
        currentAnswer: ScoreResult,
        yakuDetails: YakuDetail[],
        kantsuCount: number,
        isTsumo: boolean,
        jikaze: Kazehai
    ): { answer: ScoreResult; uraDoraMarkers: HaiKindId[] | undefined } {
        const isMenzen = tehai.exposed.length === 0
        if (!isMenzen || Math.random() < 0.3) {
            // Not Menzen OR purely by chance didn't Riichi
            return { answer: currentAnswer, uraDoraMarkers: undefined }
        }

        const isDoubleRiichi = Math.random() < 0.1
        let riichiHan = 1
        let riichiName = '立直'

        if (isDoubleRiichi) {
            riichiHan = 2
            riichiName = 'ダブル立直'
        }

        yakuDetails.push({ name: riichiName, han: riichiHan })

        const uraDoraMarkers: HaiKindId[] = []
        let extraHan = riichiHan

        for (let i = 0; i < kantsuCount + 1; i++) {
            const marker = Math.floor(Math.random() * 34) as HaiKindId
            uraDoraMarkers.push(marker)
        }

        const hasUraDora = Math.random() < 0.4
        if (hasUraDora) {
            const uraHan = Math.floor(Math.random() * 2) + 1
            yakuDetails.push({ name: '裏ドラ', han: uraHan })
            extraHan += uraHan
        }

        const newHan = currentAnswer.han + extraHan
        const answer = recalculateScore(currentAnswer, newHan, {
            isTsumo,
            isOya: jikaze === 27
        })

        return { answer, uraDoraMarkers }
    }
}
