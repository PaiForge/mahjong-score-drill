import { describe, it, expect } from 'vitest'
import { HaiKind, type HaiKindId, type Kazehai, type Tehai14, type ScoreResult } from '@pai-forge/riichi-mahjong'
import { ScoreReconciler } from './reconciler'
import type { YakuDetail } from '../types'

/**
 * テスト用の手牌を作成するヘルパー
 * closed に指定した牌を並べ、exposed は空配列にする
 */
function createTehai(closed: HaiKindId[], exposed: Tehai14['exposed'] = []): Tehai14 {
    return { closed, exposed }
}

/**
 * テスト用の ScoreResult を作成するヘルパー
 */
function createScoreResult(han: number, fu: 30 | 40 = 30): ScoreResult {
    return {
        han,
        fu,
        scoreLevel: 'Normal' as const,
        payment: { type: 'ron' as const, amount: 1000 },
    }
}

describe('ScoreReconciler.reconcileYakuhai', () => {
    describe('三元牌の検出', () => {
        it('發のみ（1翻）の手牌が正しく1翻と判定されること', () => {
            // 發が3枚ある手牌（刻子）
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu1, HaiKind.PinZu2, HaiKind.PinZu3,
                HaiKind.SouZu1, HaiKind.SouZu2, HaiKind.SouZu3,
                HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
                HaiKind.Hatsu, HaiKind.Hatsu,
            ] as HaiKindId[], [
                {
                    type: 'Koutsu' as const,
                    hais: [HaiKind.Hatsu, HaiKind.Hatsu, HaiKind.Hatsu] as unknown as readonly [HaiKindId, HaiKindId, HaiKindId],
                },
            ])

            // ライブラリが發を検出していない場合
            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2) // 元の1翻 + 發の1翻
            expect(yakuDetails).toContainEqual({ name: '役牌 發', han: 1 })
        })

        it('白のみの手牌が正しく判定されること', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
                HaiKind.Haku, HaiKind.Haku, HaiKind.Haku,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2) // 元の1翻 + 白の1翻
            expect(yakuDetails).toContainEqual({ name: '役牌 白', han: 1 })
        })

        it('中のみの手牌が正しく判定されること', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
                HaiKind.Chun, HaiKind.Chun, HaiKind.Chun,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2) // 元の1翻 + 中の1翻
            expect(yakuDetails).toContainEqual({ name: '役牌 中', han: 1 })
        })
    })

    describe('二重カウント防止', () => {
        it('ライブラリが白を既に検出済みの場合、二重カウントされないこと', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
                HaiKind.Haku, HaiKind.Haku, HaiKind.Haku,
            ] as HaiKindId[])

            // ライブラリが既に 'Haku' を検出している
            const yakuResult: readonly (readonly [string, number])[] = [['Haku', 1]]
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(2)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 翻数は変わらない（二重カウントされない）
            expect(result.han).toBe(2)
            expect(yakuDetails).not.toContainEqual(expect.objectContaining({ name: '役牌 白' }))
        })

        it('ライブラリが發を既に検出済みの場合、二重カウントされないこと', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
                HaiKind.Hatsu, HaiKind.Hatsu, HaiKind.Hatsu,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = [['Hatsu', 1]]
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(2)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2)
            expect(yakuDetails).not.toContainEqual(expect.objectContaining({ name: '役牌 發' }))
        })

        it('ライブラリが中を既に検出済みの場合、二重カウントされないこと', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
                HaiKind.Chun, HaiKind.Chun, HaiKind.Chun,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = [['Chun', 1]]
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(2)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2)
            expect(yakuDetails).not.toContainEqual(expect.objectContaining({ name: '役牌 中' }))
        })
    })

    describe('三元牌が手牌に含まれない場合', () => {
        it('三元牌の刻子がない場合、役牌は追加されないこと', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(1)
            expect(yakuDetails).toHaveLength(0)
        })

        it('三元牌が2枚以下（対子）の場合、役牌は追加されないこと', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
                HaiKind.Haku, HaiKind.Haku,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(1)
            expect(yakuDetails).not.toContainEqual(expect.objectContaining({ name: '役牌 白' }))
        })
    })

    describe('風牌との共存', () => {
        it('三元牌と場風牌が同時にある場合、両方が正しくカウントされること', () => {
            // 場風: 東、自風: 南。東の刻子 + 白の刻子がある
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.Ton, HaiKind.Ton, HaiKind.Ton,
                HaiKind.Haku, HaiKind.Haku, HaiKind.Haku,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 元の1翻 + 場風牌1翻 + 白1翻 = 3翻
            expect(result.han).toBe(3)
            expect(yakuDetails).toContainEqual({ name: '場風牌', han: 1 })
            expect(yakuDetails).toContainEqual({ name: '役牌 白', han: 1 })
        })

        it('三元牌と自風牌が同時にある場合、両方が正しくカウントされること', () => {
            // 場風: 東、自風: 南。南の刻子 + 中の刻子がある
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.Nan, HaiKind.Nan, HaiKind.Nan,
                HaiKind.Chun, HaiKind.Chun, HaiKind.Chun,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 元の1翻 + 自風牌1翻 + 中1翻 = 3翻
            expect(result.han).toBe(3)
            expect(yakuDetails).toContainEqual({ name: '自風牌', han: 1 })
            expect(yakuDetails).toContainEqual({ name: '役牌 中', han: 1 })
        })

        it('連風牌（場風=自風）と三元牌が同時にある場合、両方が正しくカウントされること', () => {
            // 場風=自風=東。東の刻子 + 發の刻子がある
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.Ton, HaiKind.Ton, HaiKind.Ton,
                HaiKind.Hatsu, HaiKind.Hatsu, HaiKind.Hatsu,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Ton as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 元の1翻 + 連風牌2翻 + 發1翻 = 4翻
            expect(result.han).toBe(4)
            expect(yakuDetails).toContainEqual({ name: '連風牌', han: 2 })
            expect(yakuDetails).toContainEqual({ name: '役牌 發', han: 1 })
        })
    })

    describe('副露手牌での三元牌検出', () => {
        it('副露面子に含まれる三元牌の刻子も正しく検出されること', () => {
            // 白が副露（ポン）で3枚ある
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[], [
                {
                    type: 'Koutsu' as const,
                    hais: [HaiKind.Haku, HaiKind.Haku, HaiKind.Haku] as unknown as readonly [HaiKindId, HaiKindId, HaiKindId],
                    furo: { type: 'Pon' as const, from: 2 as const },
                },
            ])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            expect(result.han).toBe(2) // 元の1翻 + 白の1翻
            expect(yakuDetails).toContainEqual({ name: '役牌 白', han: 1 })
        })
    })

    describe('複数の三元牌が同時にある場合', () => {
        it('白と發の両方の刻子がある場合、両方が追加されること', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.Haku, HaiKind.Haku, HaiKind.Haku,
                HaiKind.Hatsu, HaiKind.Hatsu, HaiKind.Hatsu,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 元の1翻 + 白1翻 + 發1翻 = 3翻
            expect(result.han).toBe(3)
            expect(yakuDetails).toContainEqual({ name: '役牌 白', han: 1 })
            expect(yakuDetails).toContainEqual({ name: '役牌 發', han: 1 })
        })

        it('ライブラリが白のみ検出済みで發が未検出の場合、發のみ追加されること', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.Haku, HaiKind.Haku, HaiKind.Haku,
                HaiKind.Hatsu, HaiKind.Hatsu, HaiKind.Hatsu,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            // ライブラリが白のみ検出済み
            const yakuResult: readonly (readonly [string, number])[] = [['Haku', 1]]
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(2)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 元の2翻 + 發1翻 = 3翻（白は二重カウントされない）
            expect(result.han).toBe(3)
            expect(yakuDetails).not.toContainEqual(expect.objectContaining({ name: '役牌 白' }))
            expect(yakuDetails).toContainEqual({ name: '役牌 發', han: 1 })
        })
    })

    describe('翻数追加がない場合', () => {
        it('追加すべき役牌がない場合、元の ScoreResult がそのまま返されること', () => {
            const tehai = createTehai([
                HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
                HaiKind.PinZu4, HaiKind.PinZu5, HaiKind.PinZu6,
                HaiKind.SouZu7, HaiKind.SouZu8, HaiKind.SouZu9,
                HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
                HaiKind.ManZu7, HaiKind.ManZu7,
            ] as HaiKindId[])

            const yakuResult: readonly (readonly [string, number])[] = []
            const yakuDetails: YakuDetail[] = []
            const answer = createScoreResult(1)
            const bakaze = HaiKind.Ton as Kazehai
            const jikaze = HaiKind.Nan as Kazehai

            const result = ScoreReconciler.reconcileYakuhai(
                tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, false
            )

            // 同一オブジェクトが返される
            expect(result).toBe(answer)
        })
    })
})
