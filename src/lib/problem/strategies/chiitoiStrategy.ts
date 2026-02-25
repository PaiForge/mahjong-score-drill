import { assertTehai14, type HaiKindId, type Tehai14 } from '@pai-forge/riichi-mahjong'
import { randomChoice } from '@/lib/core/random'
import { HaiUsageTracker } from '@/lib/core/haiTracker'
import { generateToitsu } from '../utils/shapeGenerator'

export interface ChiitoiTehaiResult {
    tehai: Tehai14
    agariHai: HaiKindId
}

/**
 * 七対子を生成する戦略
 */
export class ChiitoiTehaiStrategy {
    generate(): ChiitoiTehaiResult | null {
        const tracker = new HaiUsageTracker()
        const closedHais: HaiKindId[] = []

        // 7つの対子を生成
        for (let i = 0; i < 7; i++) {
            const hai = generateToitsu(tracker)
            if (!hai) return null
            closedHais.push(hai, hai)
        }

        // 理牌
        closedHais.sort((a, b) => a - b)

        // 和了牌を決定
        const agariHai = randomChoice(closedHais)

        const tehai = { closed: closedHais, exposed: [] as const }
        assertTehai14(tehai)
        return { tehai, agariHai }
    }
}
