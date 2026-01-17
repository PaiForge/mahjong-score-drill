
import {
    HaiKind,
    detectYaku,
    type Tehai14
} from '@pai-forge/riichi-mahjong'

const Ton = HaiKind.Ton

// Minimal 13 tiles + Agari
const tehaiSimple: Tehai14 = {
    closed: [
        HaiKind.ManZu1, HaiKind.ManZu1, HaiKind.ManZu1,
        HaiKind.ManZu2, HaiKind.ManZu2, HaiKind.ManZu2,
        HaiKind.ManZu3, HaiKind.ManZu3, HaiKind.ManZu3,
        HaiKind.ManZu4, HaiKind.ManZu4,
        HaiKind.ManZu5, HaiKind.ManZu5
    ],
    exposed: []
}
// Agari on ManZu5
console.log('Tehai length:', tehaiSimple.closed.length)

try {
    const result = detectYaku(tehaiSimple, HaiKind.ManZu5, Ton, Ton, [], undefined, true)
    console.log('Result:', result)
} catch (e) {
    console.error('Error:', e)
}
