import type {
    Tehai14,
    HaiKindId,
    Kazehai,
    MentsuType,
    CompletedMentsu
} from '@pai-forge/riichi-mahjong'

export interface TehaiFuItem {
    id: string
    tiles: readonly HaiKindId[]
    type: MentsuType | 'Pair' | 'Unknown'
    fu: number
    explanation: string
    // Original mentsu for more complex rendering if needed
    originalMentsu?: CompletedMentsu
    // Is this item open? (To display as Open/Closed)
    isOpen: boolean
}

export interface TehaiFuQuestion {
    id: string
    tehai: Tehai14
    context: {
        bakaze: Kazehai
        jikaze: Kazehai
        agariHai: HaiKindId
        isTsumo: boolean
        doraMarkers: readonly HaiKindId[]
        uraDoraMarkers?: readonly HaiKindId[]
        isRiichi?: boolean
    }
    items: TehaiFuItem[]
}
