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
import type { MentsuFuQuestion } from './types'
import { randomInt, randomChoice } from '@/lib/core/random'
import { assertHaiKindId } from '@/lib/core/type-guards'

const RAND_KAZESAN: HaiKindId[] = [HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei, HaiKind.Haku, HaiKind.Hatsu, HaiKind.Chun]
// Terminals (1,9)
const TERMINALS: HaiKindId[] = [
    HaiKind.ManZu1, HaiKind.ManZu9,
    HaiKind.PinZu1, HaiKind.PinZu9,
    HaiKind.SouZu1, HaiKind.SouZu9
]

// Generate a random simple (2-8) tile
function randomSimple(): HaiKindId {
    const suit = randomChoice(['m', 'p', 's'])
    const num = randomInt(2, 8)
    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1
    const result = base + num - 1
    assertHaiKindId(result)
    return result
}

// Generate a random Yaochu tile (1,9 or Honor)
function randomYaochu(): HaiKindId {
    const isHonor = Math.random() < 0.5
    if (isHonor) return randomChoice(RAND_KAZESAN)
    return randomChoice(TERMINALS)
}

function createShuntsu(): MentsuFuQuestion {
    // Always 0 Fu
    const startValue = randomChoice([
        randomInt(HaiKind.ManZu1, HaiKind.ManZu7),
        randomInt(HaiKind.PinZu1, HaiKind.PinZu7),
        randomInt(HaiKind.SouZu1, HaiKind.SouZu7),
    ])
    assertHaiKindId(startValue)
    const start = startValue

    const isFuro = Math.random() < 0.5

    const h2 = start + 1
    const h3 = start + 2
    assertHaiKindId(h2)
    assertHaiKindId(h3)
    const hais = [start, h2, h3] as const

    const mentsu: Shuntsu = isFuro ? {
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

    return {
        id: crypto.randomUUID(),
        mentsu,
        answer: 0,
        explanation: '順子は常に0符です'
    }
}

function createKoutsu(): MentsuFuQuestion {
    const isYaochu = Math.random() < 0.5
    const isOpen = Math.random() < 0.5

    const tile = isYaochu ? randomYaochu() : randomSimple()
    const hais = [tile, tile, tile] as const

    const mentsu: Koutsu = isOpen ? {
        type: MentsuType.Koutsu,
        hais,
        furo: {
            type: FuroType.Pon,
            from: Tacha.Toimen
        }
    } : {
        type: MentsuType.Koutsu,
        hais
    }

    // Calc Fu
    // Simple Open: 2
    // Simple Closed: 4
    // Yaochu Open: 4
    // Yaochu Closed: 8

    let fu = 2
    if (!isOpen) fu *= 2 // Closed doubles
    if (isYaochu) fu *= 2 // Yaochu doubles

    const typeStr = isYaochu ? '么九牌' : '中張牌'
    const stateStr = isOpen ? '明刻' : '暗刻'

    return {
        id: crypto.randomUUID(),
        mentsu,
        answer: fu,
        explanation: `${typeStr}の${stateStr}は${fu}符です`
    }
}

function createKantsu(): MentsuFuQuestion {
    const isYaochu = Math.random() < 0.5
    const isOpen = Math.random() < 0.5

    const tile = isYaochu ? randomYaochu() : randomSimple()
    const hais = [tile, tile, tile, tile] as const

    const mentsu: Kantsu = isOpen ? {
        type: MentsuType.Kantsu,
        hais,
        furo: {
            type: FuroType.Daiminkan, // or Kakan, same fu
            from: Tacha.Toimen
        }
    } : {
        type: MentsuType.Kantsu,
        hais
    }

    // Calc Fu (Koutsu x 4)
    // Simple Open: 8
    // Simple Closed: 16
    // Yaochu Open: 16
    // Yaochu Closed: 32

    let fu = 8
    if (!isOpen) fu *= 2
    if (isYaochu) fu *= 2

    const typeStr = isYaochu ? '么九牌' : '中張牌'
    const stateStr = isOpen ? '明槓（または加槓）' : '暗槓'

    return {
        id: crypto.randomUUID(),
        mentsu,
        answer: fu,
        explanation: `${typeStr}の${stateStr}は${fu}符です`
    }
}

export function generateMentsuFuQuestion(): MentsuFuQuestion {
    // Probabilities
    // Shuntsu: 20%
    // Koutsu: 50%
    // Kantsu: 30%

    const r = Math.random()
    if (r < 0.2) return createShuntsu()
    if (r < 0.7) return createKoutsu()
    return createKantsu()
}
