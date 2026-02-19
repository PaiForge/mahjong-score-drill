import { HaiKind, type HaiKindId } from '@pai-forge/riichi-mahjong'
import type { MachiFuQuestion } from './types'
import { randomInt, randomChoice } from '@/lib/core/random'
import { assertHaiKindId } from '@/lib/core/type-guards'

// 1. Ryanmen (0 Fu)
// Example: 23 wait 1,4 (Agari = 1 or 4)
function createRyanmen(): MachiFuQuestion {
    const suit = randomChoice(['m', 'p', 's'])
    const start = randomInt(2, 7) // 2 means 2-3, waiting 1-4. 7 means 7-8, waiting 6-9.

    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1

    const t1v = base + start - 1
    const t2v = base + start
    const w1v = base + start - 2
    const w2v = base + start + 1
    assertHaiKindId(t1v)
    assertHaiKindId(t2v)
    assertHaiKindId(w1v)
    assertHaiKindId(w2v)
    const t1 = t1v
    const t2 = t2v

    const wait1 = w1v
    const wait2 = w2v

    const agari = Math.random() < 0.5 ? wait1 : wait2

    return {
        id: crypto.randomUUID(),
        tiles: [t1, t2],
        agariHai: agari,
        answer: 0,
        shapeName: '両面待ち',
        explanation: '両面待ちは0符です'
    }
}

// 2. Penchan (2 Fu)
// Example: 12 wait 3, or 89 wait 7
function createPenchan(): MachiFuQuestion {
    const suit = randomChoice(['m', 'p', 's'])
    const isLow = Math.random() < 0.5 // 12 wait 3

    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1

    let t1: HaiKindId, t2: HaiKindId, agari: HaiKindId

    if (isLow) { // 12
        t1 = base
        const t2v = base + 1
        const av = base + 2
        assertHaiKindId(t2v)
        assertHaiKindId(av)
        t2 = t2v
        agari = av
    } else { // 89
        const t1v = base + 7
        const t2v = base + 8
        const av = base + 6
        assertHaiKindId(t1v)
        assertHaiKindId(t2v)
        assertHaiKindId(av)
        t1 = t1v
        t2 = t2v
        agari = av
    }

    return {
        id: crypto.randomUUID(),
        tiles: [t1, t2],
        agariHai: agari,
        answer: 2,
        shapeName: 'ペンチャン待ち',
        explanation: 'ペンチャン待ちは2符です'
    }
}

// 3. Kanchan (2 Fu)
// Example: 24 wait 3
function createKanchan(): MachiFuQuestion {
    const suit = randomChoice(['m', 'p', 's'])
    const center = randomInt(2, 8)

    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1

    const av = base + center - 1
    const t1v = base + center - 2
    const t2v = base + center
    assertHaiKindId(av)
    assertHaiKindId(t1v)
    assertHaiKindId(t2v)
    const agari = av
    const t1 = t1v
    const t2 = t2v

    return {
        id: crypto.randomUUID(),
        tiles: [t1, t2],
        agariHai: agari,
        answer: 2,
        shapeName: 'カンチャン待ち',
        explanation: 'カンチャン待ちは2符です'
    }
}

// 4. Tanki (2 Fu)
// Example: 1 wait 1
function createTanki(): MachiFuQuestion {
    const tileValue = Math.floor(Math.random() * 34)
    assertHaiKindId(tileValue)
    const tile = tileValue

    return {
        id: crypto.randomUUID(),
        tiles: [tile],
        agariHai: tile,
        answer: 2,
        shapeName: '単騎待ち',
        explanation: '単騎待ちは2符です'
    }
}

// 5. Shanpon (0 Fu)
// Example: 11, 22 wait 1 or 2. 
// Display: 11 (Agari 2) or 11 (Agari 1)?
// Shanpon is "Double Pair" wait. The hand has 2 pairs, and you wait for either to become triplet.
// In this drill, we show "The part related to the wait".
// So we should show TWO pairs? e.g. [1,1] [2,2]?
// But drill format is probably "Tiles + Agari".
// If we show [1,1] and Agari is 1 => We completed the triplet.
// WAIT. Shanpon wait means you have two pairs, e.g. 11 and 22. If you draw 1, you make 111.
// The Fu for "Waiting" (Machi Fu) is 0 for Shanpon.
// (You get Fu for the Triplet/Koutsu itself, but 0 extra for the wait).
// How to display?
// Option A: Show [1,1] + [2,2] -> Agari 1.
// Option B: Show just [1,1] and say "Agari 1" -> That looks like Tanki [1] + 1?? No, Tanki is having 1 tile waiting for another.
// If you have [1,1] and Agari is 1... you made a triplet. That's not a wait shape by itself unless context is provided.
// Actually, Shanpon is effectively standard wait (0 Fu).
// If we just show [1,1] [2,2], it's clear.
// Let's generate two random pairs.
function createShanpon(): MachiFuQuestion {
    // Pick two distinct tiles
    const t1v = Math.floor(Math.random() * 34)
    assertHaiKindId(t1v)
    const t1Base = t1v
    let t2v = Math.floor(Math.random() * 34)
    assertHaiKindId(t2v)
    let t2Base: HaiKindId = t2v
    while (t1Base === t2Base) {
        const next = Math.floor(Math.random() * 34)
        assertHaiKindId(next)
        t2Base = next
    }

    // Agari is one of them
    const agari = Math.random() < 0.5 ? t1Base : t2Base

    return {
        id: crypto.randomUUID(),
        tiles: [t1Base, t1Base, t2Base, t2Base],
        agariHai: agari,
        answer: 0,
        shapeName: 'シャンポン待ち',
        explanation: 'シャンポン待ちは0符です'
    }
}

export function generateMachiFuQuestion(): MachiFuQuestion {
    const r = Math.random()
    // 5 types
    // Ryanmen 20%
    // Penchan 20%
    // Kanchan 20%
    // Tanki 20%
    // Shanpon 20%

    if (r < 0.2) return createRyanmen()
    if (r < 0.4) return createPenchan()
    if (r < 0.6) return createKanchan()
    if (r < 0.8) return createTanki()
    return createShanpon()
}
