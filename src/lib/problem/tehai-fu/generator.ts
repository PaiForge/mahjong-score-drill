import {
    HaiKind,
    type HaiKindId,
    type Tehai14,
    type Kazehai,
    type CompletedMentsu
} from '@pai-forge/riichi-mahjong'
import type { TehaiFuQuestion, TehaiFuItem } from './types'
import { generateMentsuFuQuestion } from '@/lib/problem/mentsu-fu/generator'

const KAZEHAI = [HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei] as const

// Range helpers (reuse for head gen)
const SANGENHAI = [HaiKind.Haku, HaiKind.Hatsu, HaiKind.Chun] as const

function calculateHeadFu(
    tile: HaiKindId,
    bakaze: Kazehai,
    jikaze: Kazehai
): { fu: number; explanation: string } {
    let fu = 0
    let reasons: string[] = []

    if (tile >= HaiKind.Haku && tile <= HaiKind.Chun) {
        fu = 2
        reasons.push('役牌')
    } else {
        if (tile === bakaze) {
            fu = 2
            reasons.push('場風')
        }
        if (tile === jikaze) {
            fu = 2
            reasons.push('自風')
        }
    }

    if (fu > 0) {
        return { fu: 2, explanation: `役牌雀頭（${reasons.join('・')}）` }
    }

    return { fu: 0, explanation: '数牌またはオタ風の雀頭' }
}

export function generateTehaiFuQuestion(): TehaiFuQuestion | null {
    const tracker = new Map<number, number>()
    const canUse = (t: HaiKindId, count: number) => (tracker.get(t) || 0) + count <= 4
    const use = (t: HaiKindId, count: number) => tracker.set(t, (tracker.get(t) || 0) + count)

    const items: TehaiFuItem[] = []

    // 1. Generate 4 Mentsu
    // Try to generate 4 valid sets
    for (let i = 0; i < 4; i++) {
        let set: TehaiFuItem | null = null
        for (let retry = 0; retry < 50; retry++) {
            const q = generateMentsuFuQuestion()
            const tiles = q.mentsu.hais

            // Check availability
            const tempCount = new Map<number, number>()
            for (const t of tiles) tempCount.set(t, (tempCount.get(t) || 0) + 1)

            let possible = true
            for (const [t, c] of tempCount.entries()) {
                if (!canUse(t as HaiKindId, c)) {
                    possible = false
                    break
                }
            }

            if (possible) {
                // Commit usage
                for (const t of tiles) use(t, 1)

                set = {
                    id: crypto.randomUUID(),
                    tiles: [...tiles],
                    type: q.mentsu.type,
                    fu: q.answer,
                    explanation: q.explanation,
                    isOpen: !!q.mentsu.furo,
                    originalMentsu: q.mentsu
                }
                break
            }
        }

        if (!set) return null // Failed to generate valid hand
        items.push(set)
    }

    // 2. Generate Context
    const bakaze = KAZEHAI[Math.floor(Math.random() * 4)]
    const jikaze = KAZEHAI[Math.floor(Math.random() * 4)]
    const isTsumo = Math.random() < 0.5

    // Extra context for display
    const doraMarkers: HaiKindId[] = []
    doraMarkers.push(Math.floor(Math.random() * 34) as HaiKindId)

    const isRiichi = false

    // 3. Generate Head
    let head: TehaiFuItem | null = null
    for (let retry = 0; retry < 50; retry++) {
        const t = Math.floor(Math.random() * 34) as HaiKindId
        if (canUse(t, 2)) {
            use(t, 2)
            const res = calculateHeadFu(t, bakaze, jikaze)
            head = {
                id: crypto.randomUUID(),
                tiles: [t, t],
                type: 'Pair',
                fu: res.fu,
                explanation: res.explanation,
                isOpen: false
            }
            break
        }
    }

    if (!head) return null
    items.push(head)

    // 4. Construct Tehai14
    const closed: HaiKindId[] = []
    const exposed: CompletedMentsu[] = []

    items.forEach(item => {
        if (item.type === 'Pair') {
            closed.push(...item.tiles)
        } else {
            if (item.isOpen && item.originalMentsu) {
                exposed.push(item.originalMentsu)
            } else {
                closed.push(...item.tiles)
            }
        }
    })

    // Sort closed tiles for display logic (DrillBoard expects sorted closed tiles usually)
    closed.sort((a, b) => a - b)

    // Pick Agari Hai (Logic: pick the last added tile effectively, or random from used)
    const allTiles = items.flatMap(i => i.tiles)
    const agariHai = allTiles[Math.floor(Math.random() * allTiles.length)]

    return {
        id: crypto.randomUUID(),
        tehai: { closed, exposed },
        context: {
            bakaze,
            jikaze,
            agariHai,
            isTsumo,
            doraMarkers,
            isRiichi
        },
        items
    }
}
