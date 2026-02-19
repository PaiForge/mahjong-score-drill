import { HaiKind, type HaiKindId } from '@pai-forge/riichi-mahjong'
import type { MachiFuQuestion } from './types'
import { randomInt, randomChoice } from '@/lib/core/random'

// 1. Ryanmen (0 Fu)
// Example: 23 wait 1,4 (Agari = 1 or 4)
function createRyanmen(): MachiFuQuestion {
    const suit = randomChoice(['m', 'p', 's'])
    const start = randomInt(2, 7) // 2 means 2-3, waiting 1-4. 7 means 7-8, waiting 6-9.

    let base: HaiKindId = HaiKind.ManZu1
    if (suit === 'p') base = HaiKind.PinZu1
    if (suit === 's') base = HaiKind.SouZu1

    const t1 = (base + start - 1) as HaiKindId
    const t2 = (base + start) as HaiKindId

    const wait1 = (base + start - 2) as HaiKindId
    const wait2 = (base + start + 1) as HaiKindId

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
        t2 = (base + 1) as HaiKindId
        agari = (base + 2) as HaiKindId // 3
    } else { // 89
        t1 = (base + 7) as HaiKindId
        t2 = (base + 8) as HaiKindId
        agari = (base + 6) as HaiKindId // 7
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

    const agari = (base + center - 1) as HaiKindId
    const t1 = (base + center - 2) as HaiKindId
    const t2 = (base + center) as HaiKindId

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
    const tile = Math.floor(Math.random() * 34) as HaiKindId

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
    const t1Base = Math.floor(Math.random() * 34) as HaiKindId
    let t2Base = Math.floor(Math.random() * 34) as HaiKindId
    while (t1Base === t2Base) {
        t2Base = Math.floor(Math.random() * 34) as HaiKindId
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
