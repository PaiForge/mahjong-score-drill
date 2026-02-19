import {
    HaiKind,
    MentsuType,
    type HaiKindId,
    type Tehai14,
    type Kazehai,
    type CompletedMentsu
} from '@pai-forge/riichi-mahjong'
import type { TehaiFuQuestion, TehaiFuItem } from './types'
import { generateMentsuFuQuestion } from '@/lib/problem/mentsu-fu/generator'
import { KAZEHAI, SANGENHAI } from '@/lib/core/constants'
import { assertHaiKindId, isHaiKindId } from '@/lib/core/type-guards'

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
            const tempCount = new Map<HaiKindId, number>()
            for (const t of tiles) tempCount.set(t, (tempCount.get(t) || 0) + 1)

            let possible = true
            for (const [t, c] of tempCount.entries()) {
                if (!canUse(t, c)) {
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
    const doraValue = Math.floor(Math.random() * 34)
    assertHaiKindId(doraValue)
    doraMarkers.push(doraValue)

    const isRiichi = false

    // 3. Generate Head
    let head: TehaiFuItem | null = null
    for (let retry = 0; retry < 50; retry++) {
        const tv = Math.floor(Math.random() * 34)
        assertHaiKindId(tv)
        const t = tv
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
            // Fix: Ankan (Closed Kantsu) should be treated as exposed for checking/rendering consistency
            // (It is technically "closed" but often handled in exposed list for format reasons in some contexts,
            // OR we just need to ensure it's distinct. Explicitly putting it in exposed with type Kantsu usually triggers Ankan rendering)
            if ((item.isOpen || item.type === MentsuType.Kantsu) && item.originalMentsu) {
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
