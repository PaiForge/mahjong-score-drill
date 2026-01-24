import type { CompletedMentsu } from '@pai-forge/riichi-mahjong'

export interface MentsuFuQuestion {
    id: string
    mentsu: CompletedMentsu
    answer: number // Correct Fu value
    explanation: string
}
