
import {
    HaiKind,
    MentsuType,
    detectYaku,
    type Tehai14,
    type Kantsu
} from '@pai-forge/riichi-mahjong'

const Ton = HaiKind.Ton
const Nan = HaiKind.Nan
const Sha = HaiKind.Sha
const Pei = HaiKind.Pei

// Setup:
// Bakaze: Ton (East Round)
// Jikaze: Sha (West Player)
// Hand has Ton Kantsu (Ankan? Or Daiminkan?) User said "Ton Ankou" roughly but strictly "Ton Kantsu" in code?
// User said "have Ton Ankou but..." then "Ton is not detected".
// Ah, user said "Ton Ankou exists but Ton yaku is not detected".
// Wait, if it's Ankou (Triplets), not Kantsu (Quad).
// If `generateMentsuTehai` makes Kantsu occasionally (5%).
// User might have meant "Ankou" literally.
// Let's test both Ankou and Kantsu.

// Case 1: Ton Ankou (Closed Triplet)
// 13 tiles in closed.
const tehaiAnkou: Tehai14 = {
    closed: [
        Ton, Ton, Ton, // 3
        HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3, // 3
        HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6, // 3
        HaiKind.PinZu1, HaiKind.PinZu1, // 2
        HaiKind.SouZu1, HaiKind.SouZu2 // 2
    ],
    // Total 13. + Agari (S3) = 14.
    exposed: []
}
// Agari on SouZu3
const agariHai = HaiKind.SouZu3

const bakaze = Ton
const jikaze = Sha

const resultAnkou = detectYaku(tehaiAnkou, agariHai, bakaze, jikaze, [], undefined, true) // Tsumo
console.log('Result Ankou:', resultAnkou)


// Case 2: Ton Ankan (Closed Quad)
// Ankan counts as 3 tiles for hand size check.
// We need 13 tiles total.
// Ankan (3) + Closed (?) = 13.
// Closed = 10.
// Currently: M1..M6 (6) + P1,P1 (2) + S1 (1) = 9.
// Add S2 to closed.

const ankanTon: Kantsu = {
    type: MentsuType.Kantsu,
    hais: [Ton, Ton, Ton, Ton]
}

const tehaiAnkan: Tehai14 = {
    closed: [
        HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
        HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
        HaiKind.PinZu1, HaiKind.PinZu1, // Pair
        HaiKind.SouZu1, HaiKind.SouZu2 // Wait (Ryanmen S3/S0?)
    ],
    exposed: [ankanTon]
}

const resultAnkan = detectYaku(tehaiAnkan, HaiKind.SouZu3, bakaze, jikaze, [], undefined, true)
console.log('Result Ankan:', resultAnkan)

// Case 3: Ton Daiminkan (Open Quad)
const daiminkanTon: Kantsu = {
    type: MentsuType.Kantsu,
    hais: [Ton, Ton, Ton, Ton],
    furo: { type: 3, from: 1 } as any // FuroType.Daiminkan
}
const tehaiDaiminkan: Tehai14 = {
    closed: [
        HaiKind.ManZu1, HaiKind.ManZu2, HaiKind.ManZu3,
        HaiKind.ManZu4, HaiKind.ManZu5, HaiKind.ManZu6,
        HaiKind.PinZu1, HaiKind.PinZu1,
        HaiKind.SouZu1, HaiKind.SouZu2
    ],
    exposed: [daiminkanTon]
}
const resultDaiminkan = detectYaku(tehaiDaiminkan, HaiKind.SouZu3, bakaze, jikaze, [], undefined, true)
console.log('Result Daiminkan:', resultDaiminkan)
