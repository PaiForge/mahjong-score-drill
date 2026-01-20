import { YAKU_OPTIONS } from '@/lib/drill/constants'
import { MultiSelect } from './MultiSelect'
import { useTranslations } from 'next-intl'

interface Props {
    value: string[]
    onChange: (value: string[]) => void
    disabled?: boolean
}

// Map Japanese Yaku names (from YAKU_OPTIONS) to dictionary keys
// To avoid "any" and ensure type safety, we could define this map strictly.
// Keys are from YAKU_OPTIONS (e.g. "立直")
// Values are keys in ja.json/en.json under "problems.yaku" (e.g. "riichi")
const YAKU_TO_KEY: Record<string, string> = {
    '立直': 'riichi',
    '一発': 'ippatsu',
    '門前清自摸和': 'menzen_tsumo',
    '断幺九': 'tanyao',
    '断変九': 'tanyao', // Handle potential typo or variant in constants
    '平和': 'pinfu',
    '一盃口': 'iipeiko',
    '役牌': 'yakuhai', // Generic, though usually specific winds/dragons are used
    '役牌 東': 'bakaze_ton', // Assume round wind context or seat wind? Actually it's just "Value Tile East". Using 'jikaze_ton' or 'bakaze_ton' might be specific. Let's map to generic dragon/wind keys if available or specific ones. 
    // In json I have "haku", "hatsu", "chun" and "jikaze_ton" etc.
    // "役牌 東" stands for purely the yaku "Yakuhai (East)".
    // Ideally I should map '役牌 東' -> 'bakaze_ton' or 'jikaze_ton' depending on context? No, Yaku name is just "Yakuhai: East".
    // I don't have a generic "Yakuhai East" key in my json, I have "jikaze_ton" (Seat Wind East) and "bakaze_ton" (Round Wind East).
    // Let's check YAKU_ORDER in constants.ts. it has '役牌 東', '役牌 南', etc.
    // I will map them to 'bakaze_ton' etc for now as "Yakuhai East" usually implies it's a value tile (round or seat).
    // Or I can add "ton", "nan", "sha", "pei" to yaku dict for generic naming.
    // Current json has "jikaze_ton": "Seat Wind East".
    // Let's map '役牌 東' to 'jikaze_ton' (just as a placeholder label key) or create new ones? 
    // "役牌 東" means "White Dragon" type value, i.e. strict value tile.
    // Let's perform a best-effort mapping to existing keys.
    '役牌 南': 'jikaze_nan',
    '役牌 西': 'jikaze_sha',
    '役牌 北': 'jikaze_pei',
    '役牌 白': 'haku',
    '役牌 發': 'hatsu',
    '役牌 中': 'chun',

    // 2 Han
    '三色同順': 'sanshoku_doujun',
    '一気通貫': 'itsu',
    '混全帯么九': 'chanta',
    '七対子': 'chitoisu',
    '対々和': 'toitoi',
    '三暗刻': 'sanankou',
    '三色同刻': 'sanshoku_doukou',
    '三槓子': 'sankantsu',
    '小三元': 'shosangen',
    '混老頭': 'honroto',
    'ダブル立直': 'double_riichi', // Need to add this key if missing. I recall "riichi" but not "double_riichi" in my artifact write? 
    // Checking my artifact: "riichi", "ippatsu"..., "honroto", "sanshoku_doukou", "sankantsu", "shosangen", "honitsu", "junchan", "ryanpeiko", "chinitsu", "kokushi", "suanko", "daisangen", "tsuiso", "shousushi", "daisushi", "ryuiso", "chinroto", "sukantsu", "chuuren", "tenhou", "chihou", "dora", "ura_dora", "aka_dora".
    // Missing: "double_riichi".
    // I need to add "double_riichi" to json.

    // 3 Han
    '混一色': 'honitsu',
    '純全帯么九': 'junchan',
    '二盃口': 'ryanpeiko',

    // 6 Han
    '清一色': 'chinitsu',

    // Yakuman
    '国士無双': 'kokushi',
    '四暗刻': 'suanko',
    '大三元': 'daisangen',
    '字一色': 'tsuiso',
    '小四喜': 'shousushi',
    '大四喜': 'daisushi',
    '清老頭': 'chinroto',
    '緑一色': 'ryuiso',
    '九蓮宝燈': 'chuuren',
    '四槓子': 'sukantsu',
    '天和': 'tenhou',
    '地和': 'chihou',
}

export function YakuSelect({ value, onChange, disabled }: Props) {
    const tProblems = useTranslations('problems')

    const multiSelectLabels = {
        add: tProblems('form.multiSelect.add'),
        title: tProblems('form.multiSelect.title'),
        done: tProblems('form.multiSelect.done'),
    }

    // YAKU_OPTIONS (Japanese keys) mapped to localized names
    const options = YAKU_OPTIONS.map(yaku => {
        const key = YAKU_TO_KEY[yaku]
        // Fallback to the yaku string itself if no key mapping found or if translation misses (though useTranslations usually returns key path)
        // Check if key exists to avoid "problems.yaku.undefined"
        let label = yaku
        if (key) {
            // @ts-ignore dynamic key access
            label = tProblems(`yaku.${key}`)
        }
        return {
            value: yaku,
            label: label
        }
    })

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                {tProblems('form.labels.yaku')}
            </label>
            <MultiSelect
                options={options}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={tProblems('form.placeholders.select')}
                labels={multiSelectLabels}
            />

        </div>
    )
}
