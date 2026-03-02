import {
    HaiKind,
    MentsuType,
    FuroType,
    Tacha,
    type HaiKindId,
    type Shuntsu,
    type Koutsu,
    type Kantsu
} from '@pai-forge/riichi-mahjong'
import { randomInt, randomChoice } from '@/lib/core/random'
import { validateHaiKindId } from '@/lib/core/type-guards'
import type { HaiUsageTracker } from '@/lib/core/haiTracker'

/** 風牌の配列 */
export const RAND_KAZESAN: HaiKindId[] = [HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei, HaiKind.Haku, HaiKind.Hatsu, HaiKind.Chun]
/** 么九牌（数牌）の配列 */
export const TERMINALS: HaiKindId[] = [
    HaiKind.ManZu1, HaiKind.ManZu9,
    HaiKind.PinZu1, HaiKind.PinZu9,
    HaiKind.SouZu1, HaiKind.SouZu9
]

// --- 基本的な牌生成 ---

/**
 * ランダムな中張牌（2〜8）を生成
 */
export function randomSimple(): HaiKindId {
    const suit = randomChoice(['m', 'p', 's'])
    const num = randomInt(2, 8)
    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1
    // 中張牌の範囲計算は常に有効な値を返すが、型安全のため検証する
    return validateHaiKindId(base + num - 1).unwrapOr(HaiKind.ManZu5)
}

/**
 * ランダムな么九牌（1,9,字牌）を生成
 */
export function randomYaochu(): HaiKindId {
    const isHonor = Math.random() < 0.5
    if (isHonor) return randomChoice(RAND_KAZESAN)
    return randomChoice(TERMINALS)
}

// --- 手牌構築用ジェネレータ（HaiUsageTracker依存） ---

/**
 * 順子を生成（数牌のみ）
 */
export function generateShuntsu(
    tracker: HaiUsageTracker,
    furo: boolean = false
): Shuntsu | null {
    const suits = [HaiKind.ManZu1, HaiKind.PinZu1, HaiKind.SouZu1]
    const bases = []

    // 全ての使用可能な順子の起点をリストアップ
    for (const suitBase of suits) {
        for (let num = 0; num < 7; num++) { // 1-7
            const start = suitBase + num
            const h2 = start + 1
            const h3 = start + 2

            if (
                tracker.canUse(start as HaiKindId) &&
                tracker.canUse(h2 as HaiKindId) &&
                tracker.canUse(h3 as HaiKindId)
            ) {
                bases.push(start)
            }
        }
    }

    if (bases.length === 0) return null

    const startValue = randomChoice(bases)
    const startResult = validateHaiKindId(startValue)
    const h2Result = validateHaiKindId(startValue + 1)
    const h3Result = validateHaiKindId(startValue + 2)

    if (startResult.isErr() || h2Result.isErr() || h3Result.isErr()) return null

    const start = startResult.value
    const h2 = h2Result.value
    const h3 = h3Result.value

    tracker.use(start)
    tracker.use(h2)
    tracker.use(h3)

    const hais = [start, h2, h3] as const
    return furo ? {
        type: MentsuType.Shuntsu,
        hais,
        furo: {
            type: FuroType.Chi,
            from: Tacha.Kamicha
        }
    } : {
        type: MentsuType.Shuntsu,
        hais
    }
}

/**
 * 刻子を生成
 */
export function generateKoutsu(
    tracker: HaiUsageTracker,
    furo: boolean = false
): Koutsu | null {
    const validHais: HaiKindId[] = []
    for (let i = 0; i < 34; i++) {
        if (tracker.canUse(i as HaiKindId, 3)) {
            validHais.push(i as HaiKindId)
        }
    }

    if (validHais.length === 0) return null

    const hai = randomChoice(validHais)
    tracker.use(hai, 3)

    const hais = [hai, hai, hai] as const
    return furo ? {
        type: MentsuType.Koutsu,
        hais,
        furo: {
            type: FuroType.Pon,
            from: randomChoice([Tacha.Kamicha, Tacha.Toimen, Tacha.Shimocha])
        }
    } : {
        type: MentsuType.Koutsu,
        hais
    }
}

/**
 * 槓子を生成
 */
export function generateKantsu(
    tracker: HaiUsageTracker,
    furo: boolean = false
): Kantsu | null {
    const validHais: HaiKindId[] = []
    for (let i = 0; i < 34; i++) {
        if (tracker.canUse(i as HaiKindId, 4)) {
            validHais.push(i as HaiKindId)
        }
    }

    if (validHais.length === 0) return null

    const hai = randomChoice(validHais)
    tracker.use(hai, 4)

    const hais = [hai, hai, hai, hai] as const
    return furo ? {
        type: MentsuType.Kantsu,
        hais,
        furo: {
            type: Math.random() < 0.5 ? FuroType.Daiminkan : FuroType.Kakan,
            from: randomChoice([Tacha.Kamicha, Tacha.Toimen, Tacha.Shimocha])
        }
    } : {
        type: MentsuType.Kantsu,
        hais
    }
}

/**
 * 対子（雀頭）を生成
 */
export function generateToitsu(tracker: HaiUsageTracker): HaiKindId | null {
    const validHais: HaiKindId[] = []
    for (let i = 0; i < 34; i++) {
        if (tracker.canUse(i as HaiKindId, 2)) {
            validHais.push(i as HaiKindId)
        }
    }

    if (validHais.length === 0) return null

    const hai = randomChoice(validHais)
    tracker.use(hai, 2)
    return hai
}
