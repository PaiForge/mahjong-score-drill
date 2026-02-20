import {
    MentsuType,
    FuroType,
    Tacha,
    type Koutsu,
    type Kantsu
} from '@pai-forge/riichi-mahjong'
import type { MentsuFuQuestion } from './types'
import type { ProblemGenerator } from '../interfaces'
import { randomChoice } from '@/lib/core/random'
import { randomSimple, randomYaochu, generateShuntsu } from '../utils/shapeGenerator'
import { HaiUsageTracker } from '@/lib/core/haiTracker'

export class MentsuFuGenerator implements ProblemGenerator<MentsuFuQuestion> {
    generate(): MentsuFuQuestion {
        const r = Math.random()
        if (r < 0.2) return this.createShuntsu()
        if (r < 0.7) return this.createKoutsu()
        return this.createKantsu()
    }

    private createShuntsu(): MentsuFuQuestion {
        const tracker = new HaiUsageTracker()
        const isFuro = Math.random() < 0.5

        // Use shared utility
        const mentsu = generateShuntsu(tracker, isFuro)

        // Fallback safety (should not happen with empty tracker)
        if (!mentsu) throw new Error('Failed to generate Shuntsu')

        return {
            id: crypto.randomUUID(),
            mentsu,
            answer: 0,
            explanation: '順子は常に0符です'
        }
    }

    private createKoutsu(): MentsuFuQuestion {
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

    private createKantsu(): MentsuFuQuestion {
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
}

export function generateMentsuFuQuestion(): MentsuFuQuestion {
    return new MentsuFuGenerator().generate()
}
