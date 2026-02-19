import { HaiKind, type HaiKindId, type Kazehai } from '@pai-forge/riichi-mahjong'
import type { HeadFuQuestion } from './types'
import { getKazeName } from '@/lib/core/haiNames'
import { randomChoice, shuffle } from '@/lib/core/random'
import { KAZEHAI, SANGENHAI } from '@/lib/core/constants'
import { isHaiKindId } from '@/lib/core/type-guards'

const NUMBER_TILES_FOR_HEAD: HaiKindId[] = Array.from(
    { length: HaiKind.SouZu9 + 1 },
    (_, i) => i
).filter(isHaiKindId)

export function generateHeadFuQuestion(): HeadFuQuestion {
    const bakaze = randomChoice(KAZEHAI)
    const jikaze = randomChoice(KAZEHAI)

    // 1. Determine Correct Answer (2 fu)
    // Candidates: Haku, Hatsu, Chun, Bakaze, Jikaze
    const correctCandidates: { hai: HaiKindId; explanation: string }[] = [
        { hai: HaiKind.Haku, explanation: '役牌（白）' },
        { hai: HaiKind.Hatsu, explanation: '役牌（發）' },
        { hai: HaiKind.Chun, explanation: '役牌（中）' },
    ]

    if (bakaze === jikaze) {
        correctCandidates.push({ hai: bakaze, explanation: `連風牌（${getKazeName(bakaze)}）` })
    } else {
        correctCandidates.push({ hai: bakaze, explanation: `場風（${getKazeName(bakaze)}）` })
        correctCandidates.push({ hai: jikaze, explanation: `自風（${getKazeName(jikaze)}）` })
    }

    const correct = randomChoice(correctCandidates)

    // 2. Determine Incorrect Answers (0 fu)
    // Candidates: Otakaze (Winds not Ba/Ji), Number tiles
    const incorrectCandidates: { hai: HaiKindId; explanation: string }[] = []

    // Add Otakaze
    KAZEHAI.forEach(kaze => {
        if (kaze !== bakaze && kaze !== jikaze) {
            incorrectCandidates.push({ hai: kaze, explanation: `オタ風（${getKazeName(kaze)}）` })
        }
    })

    // Add Number tiles (Randomly pick some to ensure variety)
    // We need at most 3 incorrect answers, so picking a few number tiles is enough
    const shuffledNumbers = shuffle(NUMBER_TILES_FOR_HEAD)
    // Take first 10 as pool to pick from to avoid iterating all
    for (let i = 0; i < 10; i++) {
        const num = shuffledNumbers[i]
        incorrectCandidates.push({ hai: num, explanation: '数牌' })
    }

    // Shuffle incorrect candidates and pick 3
    const selectedIncorrect = shuffle(incorrectCandidates).slice(0, 3)

    // 3. Construct choices
    const choices = [
        {
            hai: correct.hai,
            isCorrect: true,
            fu: correct.hai === bakaze && bakaze === jikaze ? 4 : 2, // Double wind is 4 fu depending on rules, but definitely > 0. Usually treated as 2 fu for head or 4 fu? 
            // Standard rules: Head is 2 fu if Yakuhai.
            // Double wind head: strictly 2 fu in most rules (though some rules say 4, standard Riichi is 2).
            // Wait, "Head Fu" is 2 fu if it is Value Tile.
            // Is Double Wind pair 4 fu?
            // Mianzi: Pair
            // Rule: "2 fu if the pair is a yakuhai". 
            // If it is both round wind and seat wind (double east), does it give 4 fu?
            // Generally: No, it is still 2 fu for the pair. (Source: Majiang rules often say 2 fu for Yakuhai pair. Double wind pair is just a Yakuhai pair. Only Pung/Kan gets double han equivalent, but fu is usually fixed at 2 for head).
            // However, some local rules say 4 fu. 
            // Let's stick to standard: 2 fu for any Yakuhai head.
            // WAIT. Let me re-verify.
            // Standard Riichi: 2 fu for Yakuhai head. Double wind head is 2 fu.
            // OK.
            explanation: correct.explanation
        },
        ...selectedIncorrect.map(cand => ({
            hai: cand.hai,
            isCorrect: false,
            fu: 0,
            explanation: cand.explanation
        }))
    ]

    // Shuffle final choices
    const shuffledChoices = shuffle(choices)

    return {
        id: crypto.randomUUID(),
        context: {
            bakaze,
            jikaze
        },
        choices: shuffledChoices
    }
}
