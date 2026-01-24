import type { HaiKindId } from '@pai-forge/riichi-mahjong'

export interface MachiFuQuestion {
    id: string
    tiles: readonly HaiKindId[]
    agariHai: HaiKindId
    answer: number // 0 or 2
    explanation: string
    shapeName: string
}
