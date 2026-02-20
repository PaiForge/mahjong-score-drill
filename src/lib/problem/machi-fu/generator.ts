import { HaiKind, type HaiKindId } from '@pai-forge/riichi-mahjong'
import type { MachiFuQuestion } from './types'
import { randomInt, randomChoice } from '@/lib/core/random'
import { assertHaiKindId } from '@/lib/core/type-guards'
import type { ProblemGenerator } from '../interfaces'

export class MachiFuGenerator implements ProblemGenerator<MachiFuQuestion> {
    generate(): MachiFuQuestion {
        const r = Math.random()
        if (r < 0.2) return this.createRyanmen()
        if (r < 0.4) return this.createPenchan()
        if (r < 0.6) return this.createKanchan()
        if (r < 0.8) return this.createTanki()
        return this.createShanpon()
    }

    private createRyanmen(): MachiFuQuestion {
        const suit = randomChoice(['m', 'p', 's'])
        const start = randomInt(2, 7) // 2 means 2-3, waiting 1-4. 7 means 7-8, waiting 6-9.

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        const t1 = (base + start - 1) as HaiKindId
        const t2 = (base + start) as HaiKindId
        const wait1 = (base + start - 2) as HaiKindId
        const wait2 = (base + start + 1) as HaiKindId

        assertHaiKindId(t1)
        assertHaiKindId(t2)
        assertHaiKindId(wait1)
        assertHaiKindId(wait2)

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

    private createPenchan(): MachiFuQuestion {
        const suit = randomChoice(['m', 'p', 's'])
        const isLow = Math.random() < 0.5 // 12 wait 3

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        let t1: HaiKindId, t2: HaiKindId, agari: HaiKindId

        if (isLow) {
            t1 = base
            t2 = (base + 1) as HaiKindId
            agari = (base + 2) as HaiKindId
        } else {
            t1 = (base + 7) as HaiKindId
            t2 = (base + 8) as HaiKindId
            agari = (base + 6) as HaiKindId
        }
        assertHaiKindId(t1)
        assertHaiKindId(t2)
        assertHaiKindId(agari)

        return {
            id: crypto.randomUUID(),
            tiles: [t1, t2],
            agariHai: agari,
            answer: 2,
            shapeName: 'ペンチャン待ち',
            explanation: 'ペンチャン待ちは2符です'
        }
    }

    private createKanchan(): MachiFuQuestion {
        const suit = randomChoice(['m', 'p', 's'])
        const center = randomInt(2, 8)

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        const agari = (base + center - 1) as HaiKindId
        const t1 = (base + center - 2) as HaiKindId
        const t2 = (base + center) as HaiKindId

        assertHaiKindId(agari)
        assertHaiKindId(t1)
        assertHaiKindId(t2)

        return {
            id: crypto.randomUUID(),
            tiles: [t1, t2],
            agariHai: agari,
            answer: 2,
            shapeName: 'カンチャン待ち',
            explanation: 'カンチャン待ちは2符です'
        }
    }

    private createTanki(): MachiFuQuestion {
        const tile = Math.floor(Math.random() * 34) as HaiKindId
        assertHaiKindId(tile)

        return {
            id: crypto.randomUUID(),
            tiles: [tile],
            agariHai: tile,
            answer: 2,
            shapeName: '単騎待ち',
            explanation: '単騎待ちは2符です'
        }
    }

    private createShanpon(): MachiFuQuestion {
        const t1Base = Math.floor(Math.random() * 34) as HaiKindId
        assertHaiKindId(t1Base)

        let t2Base = Math.floor(Math.random() * 34) as HaiKindId
        while (t1Base === t2Base) {
            t2Base = Math.floor(Math.random() * 34) as HaiKindId
        }
        assertHaiKindId(t2Base)

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
}

export function generateMachiFuQuestion(): MachiFuQuestion {
    return new MachiFuGenerator().generate()
}
