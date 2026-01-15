import {
    MentsuType,
    HaiKind,
    isYaochu,
    type HaiKindId,
    type Kazehai,
} from '@pai-forge/riichi-mahjong'
import type { FuDetail } from '../types'

export type MentsuShape = {
    type: typeof MentsuType.Shuntsu | typeof MentsuType.Koutsu | typeof MentsuType.Kantsu
    hais: readonly HaiKindId[]
    isFuro: boolean
}

export type HandStructure = {
    mentsuList: MentsuShape[]
    pair: HaiKindId
    agariTarget: {
        type: 'mentsu' | 'pair'
        index: number
    }
}

export function calculateFuDetails(
    structure: HandStructure,
    config: {
        agariHai: HaiKindId
        isTsumo: boolean
        bakaze: Kazehai
        jikaze: Kazehai
    }
): FuDetail[] {
    const { mentsuList, pair, agariTarget } = structure
    const { agariHai, isTsumo, bakaze, jikaze } = config
    const details: FuDetail[] = []

    // Check Menzen (All mentsu are closed)
    const isMenzen = mentsuList.every((m) => !m.isFuro)

    // Base Fu
    details.push({ reason: '副底', fu: 20 })

    // 1. Menzen Ron
    if (isMenzen && !isTsumo) {
        details.push({ reason: '門前加符', fu: 10 })
    }

    // 2. Tsumo
    if (isTsumo) {
        details.push({ reason: 'ツモ', fu: 2 })
    }

    // 3. Mentsu Fu
    mentsuList.forEach((m, idx) => {
        if (m.type === MentsuType.Shuntsu) return

        let fu = 2 // Simple Koutsu
        const isYao = isYaochu(m.hais[0])
        if (isYao) fu *= 2 // Yaochu = x2

        if (m.type === MentsuType.Kantsu) fu *= 4 // Kantsu = x4

        // Open or Closed?
        // If it is Furo -> Open (Min).
        // If it is Closed:
        //   If Agari is on this mentsu (Shanpon) AND Ron -> Treated as Open (Min).
        //   Else -> Closed (An).
        const isAgariTarget = agariTarget.type === 'mentsu' && agariTarget.index === idx
        const treatAsOpen = m.isFuro || (isAgariTarget && !isTsumo)

        if (!treatAsOpen) fu *= 2 // An = x2

        const typeLabel = m.type === MentsuType.Kantsu ? '槓子' : '刻子'
        const yaoLabel = isYao ? '么九牌' : '中張牌'
        const openLabel = treatAsOpen ? '明' : '暗'

        details.push({ reason: `${yaoLabel}${openLabel}${typeLabel}`, fu })
    })

    // 4. Pair Fu
    let pairFu = 0
    const pairNamePart: string[] = []

    if (pair === bakaze) {
        pairFu += 2
        pairNamePart.push('場風')
    }
    if (pair === jikaze) {
        pairFu += 2
        pairNamePart.push('自風')
    }
    if (pair === HaiKind.Haku || pair === HaiKind.Hatsu || pair === HaiKind.Chun) {
        pairFu += 2
        pairNamePart.push('三元牌')
    }

    // Notice: Double Wind is +4 (accumulated above).
    if (pairFu > 0) {
        details.push({ reason: `雀頭(${pairNamePart.join('・')})`, fu: pairFu })
    }

    // 5. Wait Fu
    if (agariTarget.type === 'pair') {
        details.push({ reason: '単騎待ち', fu: 2 })
    } else {
        const m = mentsuList[agariTarget.index]
        if (m.type === MentsuType.Shuntsu) {
            const sorted = [...m.hais].sort((a, b) => a - b)

            // Kanchan: Agari is middle e.g. 1 2 3, agari 2
            if (sorted[1] === agariHai) {
                details.push({ reason: '嵌張待ち', fu: 2 })
            }
            // Penchan: 123 agari 3, or 789 agari 7
            else if (sorted[0] % 9 === 0 && agariHai % 9 === 2) { // 1-2-3 (starts at 0/9/18), Agari 3
                details.push({ reason: '辺張待ち', fu: 2 })
            } else if (sorted[2] % 9 === 8 && agariHai % 9 === 6) { // 7-8-9 (ends at 8/17/26), Agari 7
                details.push({ reason: '辺張待ち', fu: 2 })
            }
        }
    }

    // Check sum for exceptions
    const currentSum = details.reduce((acc, d) => acc + d.fu, 0)

    // Pinfu Tsumo Exception (20 Fu)
    // Logic: Menzen Tsumo, no other fu points. 
    // Current sum would be 22 (Base 20 + Tsumo 2).
    // If it's effectively Pinfu Tsumo, we should return exactly 20.
    // Pinfu conditions:
    // - Menzen
    // - No fu-giving Mentus (all Shuntsu)
    // - No fu-giving Pair (not Yakuhai)
    // - No fu-giving Wait (Ryanmen) -> (No Tanki/Kanchan/Penchan)
    const hasFuMentsu = mentsuList.some(m => m.type !== MentsuType.Shuntsu)
    const hasPairFu = pairFu > 0
    const hasWaitFu = details.some(d => d.reason.includes('待ち'))

    if (isMenzen && isTsumo && !hasFuMentsu && !hasPairFu && !hasWaitFu) {
        return [{ reason: '平和ツモ', fu: 20 }]
    }

    // Open Pinfu Ron Exception (Should be 30 Fu, but calculates to 20)
    // If sum is 20 and not Pinfu Tsumo (which is handled above):
    // It must be Open Pinfu Ron.
    if (currentSum === 20) {
        // Add padding to make it 30 conformant (though strict calculation usually rounds 22->30, 20->30?)
        // Rules usually say "No 20 Fu open". Treat as 30.
        details.push({ reason: '特例等の加符', fu: 10 })
    }

    return details
}

export function calculateChiitoiFuDetails(): FuDetail[] {
    return [{ reason: '七対子', fu: 25 }]
}
