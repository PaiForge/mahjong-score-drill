import type { Kazehai, HaiKindId } from '@pai-forge/riichi-mahjong'

export interface HeadFuQuestion {
    id: string
    context: {
        bakaze: Kazehai
        jikaze: Kazehai
    }
    choices: {
        hai: HaiKindId
        isCorrect: boolean
        fu: number
        explanation: string
    }[]
}
