import {
    MentsuType,
    validateTehai14,
    type HaiKindId,
    type Tehai14,
    type CompletedMentsu,
} from '@pai-forge/riichi-mahjong'
import type { HandStructure, MentsuShape } from '@/lib/score/fuCalculator'
import { randomInt, randomChoice } from '@/lib/core/random'
import { HaiUsageTracker } from '@/lib/core/haiTracker'
import {
    generateShuntsu,
    generateKoutsu,
    generateKantsu,
    generateToitsu
} from '../utils/shapeGenerator'

export interface MentsuTehaiResult {
    tehai: Tehai14
    agariHai: HaiKindId
    structure: HandStructure
}

/**
 * 面子手（4面子1雀頭）を生成する戦略
 */
export class MentsuTehaiStrategy {
    generate(includeFuro: boolean): MentsuTehaiResult | null {
        const tracker = new HaiUsageTracker()
        const closedHais: HaiKindId[] = []
        const exposed: CompletedMentsu[] = []
        const structuralMentsu: MentsuShape[] = []

        // 副露の数を決定（0-2）
        const furoCount = includeFuro ? randomInt(0, 2) : 0

        // 4面子を生成
        for (let i = 0; i < 4; i++) {
            const isFuro = i < furoCount
            // 面子の種類を決定
            // 順子: 65%, 刻子: 30%, 槓子: 5%
            const rand = Math.random()
            const isShuntsu = rand < 0.65
            const isKantsu = rand >= 0.95

            let mentsu: CompletedMentsu | null = null
            if (isShuntsu) {
                mentsu = generateShuntsu(tracker, isFuro) || generateKoutsu(tracker, isFuro)
            } else if (isKantsu) {
                mentsu = generateKantsu(tracker, isFuro) || generateKoutsu(tracker, isFuro) || generateShuntsu(tracker, isFuro)
            } else {
                mentsu = generateKoutsu(tracker, isFuro) || generateShuntsu(tracker, isFuro)
            }

            if (!mentsu) return null

            structuralMentsu.push({
                type: mentsu.type,
                hais: mentsu.hais,
                isFuro: !!mentsu.furo,
            })

            if (mentsu.furo || mentsu.type === MentsuType.Kantsu) {
                exposed.push(mentsu)
            } else {
                closedHais.push(...mentsu.hais)
            }
        }

        // 雀頭を生成
        const toitsuHai = generateToitsu(tracker)
        if (!toitsuHai) return null
        closedHais.push(toitsuHai, toitsuHai)

        // 理牌
        closedHais.sort((a, b) => a - b)

        // 和了牌の候補を収集（インデックス情報を保持）
        const candidates: { hai: HaiKindId; target: { type: 'mentsu' | 'pair'; index: number } }[] = []

        // 面子からの候補
        structuralMentsu.forEach((m, idx) => {
            if (!m.isFuro && m.type !== MentsuType.Kantsu) {
                m.hais.forEach((hai) => {
                    candidates.push({ hai, target: { type: 'mentsu', index: idx } })
                })
            }
        })

        // 雀頭からの候補
        candidates.push(
            { hai: toitsuHai, target: { type: 'pair', index: 0 } },
            { hai: toitsuHai, target: { type: 'pair', index: 0 } }
        )

        // 和了牌を決定
        const selected = randomChoice(candidates)
        const agariHai = selected.hai
        const agariTarget = selected.target

        const structure: HandStructure = {
            mentsuList: structuralMentsu,
            pair: toitsuHai,
            agariTarget,
        }

        const tehai = { closed: closedHais, exposed }
        const result = validateTehai14(tehai)
        if (result.isErr()) return null
        return { tehai: result.value, agariHai, structure }
    }
}
