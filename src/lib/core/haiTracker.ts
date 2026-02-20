import type { HaiKindId } from '@pai-forge/riichi-mahjong'

/**
 * 牌使用状況を管理するクラス
 */
export class HaiUsageTracker {
    private usage: number[] = Array(34).fill(0)

    canUse(kindId: HaiKindId, count: number = 1): boolean {
        return this.usage[kindId] + count <= 4
    }

    use(kindId: HaiKindId, count: number = 1): boolean {
        if (!this.canUse(kindId, count)) return false
        this.usage[kindId] += count
        return true
    }
}
