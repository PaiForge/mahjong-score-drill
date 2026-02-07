// 優先度順（頻出度≒翻数の低い順）
// ここに定義されている順序で表示される
const YAKU_ORDER = [
    // 1 Han
    '立直', '門前清自摸和', '断変九', '平和', '一盃口',
    '役牌 東', '役牌 南', '役牌 西', '役牌 北',
    '役牌 白', '役牌 發', '役牌 中',

    // 2 Han
    '三色同順', '一気通貫', '混全帯么九', '七対子', '対々和',
    '三暗刻', '三色同刻', '三槓子', '小三元', '混老頭',

    // 3 Han
    '混一色', '純全帯么九', '二盃口',

    // 6 Han
    '清一色',

    // Yakuman
    '国士無双', '四暗刻', '大三元', '字一色', '小四喜', '大四喜',
    '清老頭', '緑一色', '九蓮宝燈', '四槓子',
]

// Yaku Name Mapping (English -> Japanese)
// Note: riichi-mahjong library returns 'Yakuhai' for winds usually, need to check if we can distinguish
export const YAKU_NAME_MAP: Record<string, string> = {
    // 1 Han
    'Tanyao': '断変九',
    'Pinfu': '平和',
    'Iipeikou': '一盃口',
    'MenzenTsumo': '門前清自摸和',
    'Riichi': '立直',
    'Ippatsu': '一発',
    'Haitei': '海底摸月',
    'Houtei': '河底撈魚',
    'Rinshan': '嶺上開花',
    'Chankan': '槍槓',
    'Yakuhai': '役牌', // default for winds often
    'Ton': '役牌 東',
    'Nan': '役牌 南',
    'Sha': '役牌 西',
    'Pei': '役牌 北',
    'Haku': '役牌 白',
    'Hatsu': '役牌 發',
    'Chun': '役牌 中',

    // 2 Han
    'SanshokuDoujun': '三色同順',
    'Ikkitsuukan': '一気通貫',
    'Honchan': '混全帯么九',
    'Chiitoitsu': '七対子',
    'Toitoi': '対々和',
    'Sanankou': '三暗刻',
    'Sankantsu': '三槓子',
    'SanshokuDoukou': '三色同刻',
    'Honroutou': '混老頭',
    'Shousangen': '小三元',
    'DoubleRiichi': 'ダブル立直',

    // 3 Han
    'Honitsu': '混一色',
    'Junchan': '純全帯么九',
    'Ryanpeikou': '二盃口',

    // 6 Han
    'Chinitsu': '清一色',

    // Yakuman
    'KokushiMusou': '国士無双',
    'Suuankou': '四暗刻',
    'Daisangen': '大三元',
    'Shousuushii': '小四喜',
    'Daisuushii': '大四喜',
    'Tsuuiisou': '字一色',
    'Chinroutou': '清老頭',
    'Ryuuiisou': '緑一色',
    'ChuurenPoutou': '九蓮宝燈',
    'Suukantsu': '四槓子',
    'Tenhou': '天和',
    'Chiihou': '地和',
}

// 判定時に無視する役（ドラなど）
export const IGNORE_YAKU_FOR_JUDGEMENT = ['ドラ', '裏ドラ']

// ドロップダウンリスト用の選択肢
// YAKU_ORDER に定義されたものがそのまま選択肢となる
export const YAKU_OPTIONS = YAKU_ORDER
