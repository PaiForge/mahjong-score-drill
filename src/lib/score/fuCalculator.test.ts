import { describe, it, expect } from 'vitest'
import { convertScoreDetailToFuDetails } from './fuCalculator'
import {
    HaiKind,
    MentsuType,
    type HaiKindId,
    type Kazehai,
    type ScoreDetail,
    type MentsuHouraStructure,
    type ChiitoitsuHouraStructure,
    type KokushiHouraStructure,
    type FuResult,
    type Shuntsu,
    type Koutsu,
    type Kantsu,
    type MachiType,
} from '@pai-forge/riichi-mahjong'

// Toitsu は公開APIからエクスポートされていないため、テスト用に型を定義
type Toitsu = {
    readonly type: typeof MentsuType.Toitsu
    readonly hais: readonly [HaiKindId, HaiKindId]
}

// ヘルパー: 順子を作成
function shuntsu(h1: HaiKindId, h2: HaiKindId, h3: HaiKindId, furo?: { type: 'Chi'; from: 1 | 2 | 3 }): Shuntsu {
    return { type: 'Shuntsu', hais: [h1, h2, h3], ...(furo ? { furo } : {}) } as Shuntsu
}

// ヘルパー: 刻子を作成
function koutsu(hai: HaiKindId, furo?: { type: 'Pon'; from: 1 | 2 | 3 }): Koutsu {
    return { type: 'Koutsu', hais: [hai, hai, hai], ...(furo ? { furo } : {}) } as Koutsu
}

// ヘルパー: 槓子を作成
function kantsu(hai: HaiKindId, furo?: { type: 'DaiMinkan' | 'Kakan'; from: 1 | 2 | 3 }): Kantsu {
    return { type: 'Kantsu', hais: [hai, hai, hai, hai], ...(furo ? { furo } : {}) } as Kantsu
}

// ヘルパー: 対子を作成
function toitsu(hai: HaiKindId): Toitsu {
    return { type: 'Toitsu', hais: [hai, hai] } as Toitsu
}

// ヘルパー: 面子手の構造を作成
function mentsuStructure(
    fourMentsu: [Shuntsu | Koutsu | Kantsu, Shuntsu | Koutsu | Kantsu, Shuntsu | Koutsu | Kantsu, Shuntsu | Koutsu | Kantsu],
    jantou: Toitsu,
): MentsuHouraStructure {
    return { type: 'Mentsu', fourMentsu, jantou } as MentsuHouraStructure
}

// ヘルパー: ScoreDetail を作成
function makeScoreDetail(
    structure: MentsuHouraStructure | ChiitoitsuHouraStructure | KokushiHouraStructure,
    machiType: MachiType | undefined,
    fuResult: FuResult,
): ScoreDetail {
    return {
        structure,
        machiType,
        fuResult,
        yakuResult: [],
    }
}

// ヘルパー: 基本コンフィグ
function baseConfig(overrides: {
    agariHai?: HaiKindId
    isTsumo?: boolean
    bakaze?: Kazehai
    jikaze?: Kazehai
} = {}) {
    return {
        agariHai: overrides.agariHai ?? HaiKind.ManZu5 as HaiKindId,
        isTsumo: overrides.isTsumo ?? false,
        bakaze: overrides.bakaze ?? HaiKind.Ton as Kazehai,
        jikaze: overrides.jikaze ?? HaiKind.Nan as Kazehai,
    }
}

describe('convertScoreDetailToFuDetails', () => {
    describe('ツモの場合のツモ符', () => {
        it('門前ツモで和了符2符がツモとして表示されること', () => {
            // 123m 456p 789s 555z 33s, ツモ
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.SouZu3 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 8, jantou: 0, machi: 0, agari: 2 },
            }
            const detail = makeScoreDetail(structure, 'Shanpon', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.Haku as HaiKindId,
                isTsumo: true,
            }))

            expect(result).toContainEqual({ reason: 'ツモ', fu: 2 })
            expect(result).not.toContainEqual(expect.objectContaining({ reason: '門前加符' }))
        })
    })

    describe('門前ロンの場合の門前加符', () => {
        it('門前ロンで和了符10符が門前加符として表示されること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.SouZu3 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Shanpon', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.Haku as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '門前加符', fu: 10 })
            expect(result).not.toContainEqual(expect.objectContaining({ reason: 'ツモ' }))
        })
    })

    describe('面子符の計算', () => {
        it('中張牌の明刻は2符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu5 as HaiKindId, { type: 'Pon', from: 2 }),
                ],
                toitsu(HaiKind.Haku as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 2, jantou: 2, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '中張牌明刻子', fu: 2 })
        })

        it('中張牌の暗刻は4符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu5 as HaiKindId),
                ],
                toitsu(HaiKind.ManZu2 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '中張牌暗刻子', fu: 4 })
        })

        it('么九牌の明刻は4符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu9 as HaiKindId, { type: 'Pon', from: 2 }),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '么九牌明刻子', fu: 4 })
        })

        it('么九牌の暗刻は8符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu9 as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 8, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '么九牌暗刻子', fu: 8 })
        })

        it('中張牌の明槓は8符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    kantsu(HaiKind.ManZu5 as HaiKindId, { type: 'DaiMinkan', from: 2 }),
                ],
                toitsu(HaiKind.ManZu2 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 8, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '中張牌明槓子', fu: 8 })
        })

        it('中張牌の暗槓は16符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    kantsu(HaiKind.ManZu5 as HaiKindId),
                ],
                toitsu(HaiKind.ManZu2 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 50,
                details: { base: 20, mentsu: 16, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '中張牌暗槓子', fu: 16 })
        })

        it('么九牌の明槓は16符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    kantsu(HaiKind.Ton as HaiKindId, { type: 'DaiMinkan', from: 2 }),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 16, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '么九牌明槓子', fu: 16 })
        })

        it('么九牌の暗槓は32符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    kantsu(HaiKind.Ton as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 60,
                details: { base: 20, mentsu: 32, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '么九牌暗槓子', fu: 32 })
        })
    })

    describe('待ち形の符', () => {
        it('嵌張待ちは2符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 2, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Kanchan', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu2 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '嵌張待ち', fu: 2 })
        })

        it('辺張待ちは2符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu7 as HaiKindId, HaiKind.ManZu8 as HaiKindId, HaiKind.ManZu9 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 2, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Penchan', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu7 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '辺張待ち', fu: 2 })
        })

        it('単騎待ちは2符であること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 2, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Tanki', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu5 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '単騎待ち', fu: 2 })
        })
    })

    describe('喰い平和の特例（20符→30符）', () => {
        it('副露手でロン和了、符合計が20符の場合に特例等の加符10符が追加されること', () => {
            // 全て順子で副露、ロン和了 → 副底20のみ → 特例で+10 = 30
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId, { type: 'Chi', from: 1 }),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    shuntsu(HaiKind.ManZu4 as HaiKindId, HaiKind.ManZu5 as HaiKindId, HaiKind.ManZu6 as HaiKindId),
                ],
                toitsu(HaiKind.ManZu2 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 0, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu6 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '特例等の加符', fu: 10 })
            const totalFu = result.reduce((acc, d) => acc + d.fu, 0)
            expect(totalFu).toBe(30)
        })
    })

    describe('七対子25符', () => {
        it('七対子の場合、七対子25符のみが返されること', () => {
            const structure: ChiitoitsuHouraStructure = {
                type: 'Chiitoitsu',
                pairs: [
                    toitsu(HaiKind.ManZu1 as HaiKindId),
                    toitsu(HaiKind.ManZu3 as HaiKindId),
                    toitsu(HaiKind.PinZu5 as HaiKindId),
                    toitsu(HaiKind.PinZu7 as HaiKindId),
                    toitsu(HaiKind.SouZu9 as HaiKindId),
                    toitsu(HaiKind.Nan as HaiKindId),
                    toitsu(HaiKind.Pei as HaiKindId),
                ],
            }
            const fuResult: FuResult = {
                total: 25,
                details: { base: 25, mentsu: 0, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, undefined, fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig())

            expect(result).toEqual([{ reason: '七対子', fu: 25 }])
        })
    })

    describe('平和ツモ20符', () => {
        it('平和ツモの場合、平和ツモ20符のみが返されること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    shuntsu(HaiKind.ManZu4 as HaiKindId, HaiKind.ManZu5 as HaiKindId, HaiKind.ManZu6 as HaiKindId),
                ],
                toitsu(HaiKind.SouZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 20,
                details: { base: 20, mentsu: 0, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu6 as HaiKindId,
                isTsumo: true,
            }))

            expect(result).toEqual([{ reason: '平和ツモ', fu: 20 }])
        })
    })

    describe('雀頭符', () => {
        it('場風牌の雀頭で2符加算されること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.Ton as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 2, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
                bakaze: HaiKind.Ton as Kazehai,
            }))

            expect(result).toContainEqual({ reason: '雀頭(場風)', fu: 2 })
        })

        it('三元牌の雀頭で2符加算されること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu9 as HaiKindId),
                ],
                toitsu(HaiKind.Hatsu as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 50,
                details: { base: 20, mentsu: 8, jantou: 2, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result).toContainEqual({ reason: '雀頭(三元牌)', fu: 2 })
        })
    })

    describe('国士無双', () => {
        it('国士無双の場合、副底20符のみが返されること', () => {
            const structure: KokushiHouraStructure = {
                type: 'Kokushi',
                yaochu: [
                    HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu9 as HaiKindId,
                    HaiKind.PinZu1 as HaiKindId, HaiKind.PinZu9 as HaiKindId,
                    HaiKind.SouZu1 as HaiKindId, HaiKind.SouZu9 as HaiKindId,
                    HaiKind.Ton as HaiKindId, HaiKind.Nan as HaiKindId, HaiKind.Sha as HaiKindId, HaiKind.Pei as HaiKindId,
                    HaiKind.Haku as HaiKindId, HaiKind.Hatsu as HaiKindId, HaiKind.Chun as HaiKindId,
                ],
                jantou: HaiKind.Chun as HaiKindId,
            }
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 0, jantou: 0, machi: 0, agari: 0 },
            }
            const detail = makeScoreDetail(structure, undefined, fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig())

            expect(result).toEqual([{ reason: '副底', fu: 20 }])
        })
    })

    describe('バグケース: 同じアガリ牌が両面待ち/単騎待ちの両方の解釈を持つ場合', () => {
        it('ライブラリが選択した構造に基づく fuDetails が answer.fu と一致すること', () => {
            // 例: 123m 456p 789s 234m 55s, アガリ牌=4m
            // 解釈A: 234mの両面待ち (4m) → 待ち符なし
            // 解釈B: 仮に他の分解があれば異なる符になりうる
            // いずれにしても、ライブラリが最適解釈を選び、その fuResult を使う
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    shuntsu(HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId, HaiKind.ManZu4 as HaiKindId),
                ],
                toitsu(HaiKind.SouZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 0, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu4 as HaiKindId,
                isTsumo: false,
            }))

            // fuDetails の合計が fuResult.total (= answer.fu) と一致すること
            const totalFu = result.reduce((acc, d) => acc + d.fu, 0)
            expect(totalFu).toBe(fuResult.total)
        })
    })

    describe('ロン和了で和了牌を含む刻子が明刻扱いになること', () => {
        it('ロン和了のシャンポン待ちで、和了牌の刻子が明刻扱いになること', () => {
            // 123m 456p 789s 555m 33s, ロン和了でアガリ牌=5m → シャンポン待ち
            // 5mの刻子は副露なしだが、ロン和了で和了牌を含むので明刻扱い
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.ManZu5 as HaiKindId),
                ],
                toitsu(HaiKind.SouZu3 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 30,
                details: { base: 20, mentsu: 2, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Shanpon', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu5 as HaiKindId,
                isTsumo: false,
            }))

            // 中張牌の明刻扱い = 2符
            expect(result).toContainEqual({ reason: '中張牌明刻子', fu: 2 })
        })
    })

    describe('副底は常に20符であること', () => {
        it('副底が20符として表示されること', () => {
            const structure = mentsuStructure(
                [
                    shuntsu(HaiKind.ManZu1 as HaiKindId, HaiKind.ManZu2 as HaiKindId, HaiKind.ManZu3 as HaiKindId),
                    shuntsu(HaiKind.PinZu4 as HaiKindId, HaiKind.PinZu5 as HaiKindId, HaiKind.PinZu6 as HaiKindId),
                    shuntsu(HaiKind.SouZu7 as HaiKindId, HaiKind.SouZu8 as HaiKindId, HaiKind.SouZu9 as HaiKindId),
                    koutsu(HaiKind.Haku as HaiKindId),
                ],
                toitsu(HaiKind.ManZu5 as HaiKindId),
            )
            const fuResult: FuResult = {
                total: 40,
                details: { base: 20, mentsu: 4, jantou: 0, machi: 0, agari: 10 },
            }
            const detail = makeScoreDetail(structure, 'Ryanmen', fuResult)

            const result = convertScoreDetailToFuDetails(detail, baseConfig({
                agariHai: HaiKind.ManZu3 as HaiKindId,
                isTsumo: false,
            }))

            expect(result[0]).toEqual({ reason: '副底', fu: 20 })
        })
    })
})
