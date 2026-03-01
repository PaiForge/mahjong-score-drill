import { HaiKind, type HaiKindId } from '@pai-forge/riichi-mahjong'
import type { MachiFuQuestion } from './types'
import { randomInt, randomChoice } from '@/lib/core/random'
import { validateHaiKindId } from '@/lib/core/type-guards'
import type { ProblemGenerator } from '../interfaces'

export class MachiFuGenerator implements ProblemGenerator<MachiFuQuestion> {
    generate(): MachiFuQuestion {
        const patterns = [
            () => this.createRyanmen(),
            () => this.createPenchan(),
            () => this.createKanchan(),
            () => this.createTanki(),
            () => this.createShanpon(),
        ]
        const r = Math.random()
        const index = r < 0.2 ? 0 : r < 0.4 ? 1 : r < 0.6 ? 2 : r < 0.8 ? 3 : 4
        const result = patterns[index]()
        // 万一バリデーション失敗した場合は単騎待ちにフォールバック
        if (result) return result
        return this.createTanki() ?? this.createShanpon()!
    }

    private createRyanmen(): MachiFuQuestion | null {
        const suit = randomChoice(['m', 'p', 's'])
        const start = randomInt(2, 7) // 2 means 2-3, waiting 1-4. 7 means 7-8, waiting 6-9.

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        const t1Result = validateHaiKindId(base + start - 1)
        const t2Result = validateHaiKindId(base + start)
        const wait1Result = validateHaiKindId(base + start - 2)
        const wait2Result = validateHaiKindId(base + start + 1)

        if (t1Result.isErr() || t2Result.isErr() || wait1Result.isErr() || wait2Result.isErr()) return null

        const agari = Math.random() < 0.5 ? wait1Result.value : wait2Result.value

        return {
            id: crypto.randomUUID(),
            tiles: [t1Result.value, t2Result.value],
            agariHai: agari,
            answer: 0,
            shapeName: '両面待ち',
            explanation: '両面待ちは0符です'
        }
    }

    private createPenchan(): MachiFuQuestion | null {
        const suit = randomChoice(['m', 'p', 's'])
        const isLow = Math.random() < 0.5 // 12 wait 3

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        const t1Result = validateHaiKindId(isLow ? base : base + 7)
        const t2Result = validateHaiKindId(isLow ? base + 1 : base + 8)
        const agariResult = validateHaiKindId(isLow ? base + 2 : base + 6)

        if (t1Result.isErr() || t2Result.isErr() || agariResult.isErr()) return null

        return {
            id: crypto.randomUUID(),
            tiles: [t1Result.value, t2Result.value],
            agariHai: agariResult.value,
            answer: 2,
            shapeName: 'ペンチャン待ち',
            explanation: 'ペンチャン待ちは2符です'
        }
    }

    private createKanchan(): MachiFuQuestion | null {
        const suit = randomChoice(['m', 'p', 's'])
        const center = randomInt(2, 8)

        let base: HaiKindId = HaiKind.ManZu1
        if (suit === 'p') base = HaiKind.PinZu1
        if (suit === 's') base = HaiKind.SouZu1

        const agariResult = validateHaiKindId(base + center - 1)
        const t1Result = validateHaiKindId(base + center - 2)
        const t2Result = validateHaiKindId(base + center)

        if (agariResult.isErr() || t1Result.isErr() || t2Result.isErr()) return null

        return {
            id: crypto.randomUUID(),
            tiles: [t1Result.value, t2Result.value],
            agariHai: agariResult.value,
            answer: 2,
            shapeName: 'カンチャン待ち',
            explanation: 'カンチャン待ちは2符です'
        }
    }

    private createTanki(): MachiFuQuestion | null {
        const tileResult = validateHaiKindId(Math.floor(Math.random() * 34))
        if (tileResult.isErr()) return null

        return {
            id: crypto.randomUUID(),
            tiles: [tileResult.value],
            agariHai: tileResult.value,
            answer: 2,
            shapeName: '単騎待ち',
            explanation: '単騎待ちは2符です'
        }
    }

    private createShanpon(): MachiFuQuestion | null {
        const t1Result = validateHaiKindId(Math.floor(Math.random() * 34))
        if (t1Result.isErr()) return null

        let t2Value = Math.floor(Math.random() * 34)
        while (t1Result.value === t2Value) {
            t2Value = Math.floor(Math.random() * 34)
        }
        const t2Result = validateHaiKindId(t2Value)
        if (t2Result.isErr()) return null

        const agari = Math.random() < 0.5 ? t1Result.value : t2Result.value

        return {
            id: crypto.randomUUID(),
            tiles: [t1Result.value, t1Result.value, t2Result.value, t2Result.value],
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
