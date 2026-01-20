import {
    HaiKind,
    parseExtendedMspz,
    parseMspz,
    calculateScoreForTehai,
    detectYaku,
    type HaiKindId,
    type Kazehai,
    type Tehai14,
} from '@pai-forge/riichi-mahjong'
import type { DrillQuestion, YakuDetail } from '@/lib/drill/types'
import { recalculateScore } from './scoreCalculator'
import { getDoraFromIndicator } from './haiNames'

// 役名マッピング (questionGenerator.ts からの複製 - リファクタすべきだが一旦このままで)
const YAKU_NAME_MAP: Record<string, string> = {
    'Tanyao': '断変九', 'Pinfu': '平和', 'Iipeikou': '一盃口', 'MenzenTsumo': '門前清自摸和', 'Riichi': '立直',
    'Yakuhai': '役牌', 'Haku': '役牌 白', 'Hatsu': '役牌 發', 'Chun': '役牌 中',
    'SanshokuDoujun': '三色同順', 'Ikkitsuukan': '一気通貫', 'Honchan': '混全帯么九', 'Chiitoitsu': '七対子',
    'Toitoi': '対々和', 'Sanankou': '三暗刻', 'Sankantsu': '三槓子', 'SanshokuDoukou': '三色同刻',
    'Honroutou': '混老頭', 'Shousangen': '小三元', 'DoubleRiichi': 'ダブル立直',
    'Honitsu': '混一色', 'Junchan': '純全帯么九', 'Ryanpeikou': '二盃口',
    'Chinitsu': '清一色',
    'KokushiMusou': '国士無双', 'Suuankou': '四暗刻', 'Daisangen': '大三元', 'Shousuushii': '小四喜',
    'Daisuushii': '大四喜', 'Tsuuiisou': '字一色', 'Chinroutou': '清老頭', 'Ryuuiisou': '緑一色',
    'ChuurenPoutou': '九蓮宝燈', 'Suukantsu': '四槓子',
}
function getYakuNameJa(name: string): string { return YAKU_NAME_MAP[name] || name }


export type QueryResult =
    | { type: 'success', question: DrillQuestion }
    | { type: 'error', message: string }

/**
 * URLクエリパラメータから問題を生成
 */
export function generateQuestionFromQuery(params: URLSearchParams): QueryResult | null {
    try {
        const tehaiStr = params.get('tehai')?.replace(/\s/g, '') || null
        const agariStr = params.get('agari')?.replace(/\s/g, '') || null
        const isTsumoStr = params.get('tsumo')?.trim() || null
        const doraStr = params.get('dora')?.replace(/\s/g, '') || null
        const uraDoraStr = params.get('ura')?.replace(/\s/g, '') || null
        const riichiStr = params.get('riichi')?.trim() || null
        const baStr = params.get('ba')?.replace(/\s/g, '') || null
        const jiStr = params.get('ji')?.replace(/\s/g, '') || null

        if (!tehaiStr && !agariStr && !doraStr) return null // 何も指定がない場合はnull (ランダム生成へ)
        if (!tehaiStr || !agariStr) return { type: 'error', message: 'tehai, agari parameters are required.' }

        // 手牌のパース (Extended MSPZ, fallback to Standard MSPZ)
        let tehai: Tehai14
        try {
            tehai = parseExtendedMspz(tehaiStr) as Tehai14
        } catch {
            try {
                // 標準MSPZとして再試行 (Extended parserが標準記法に厳密で失敗する場合の救済)
                tehai = parseMspz(tehaiStr) as Tehai14
            } catch {
                return { type: 'error', message: `Invalid Extended MSPZ string: ${tehaiStr}` }
            }
        }

        // バリデーション: 牌の枚数チェックなどは parseExtendedMspz 呼び出し元で catch していないため、
        // ここでエラーなら catch ブロックに行く。

        // ドラ表示牌リスト
        const doraMarkers = parseHais(doraStr)
        const kantsuCount = tehai.exposed.filter(m => m.type === 'Kantsu').length
        const requiredMarkerCount = 1 + kantsuCount

        if (doraMarkers.length !== requiredMarkerCount) {
            return {
                type: 'error',
                message: `Invalid dora count. Expected ${requiredMarkerCount} tiles for ${kantsuCount} kantsu.`
            }
        }

        // バリデーション: カンがある場合の裏ドラ指定チェック
        const isRiichi = riichiStr === 'true'
        const isTsumo = isTsumoStr === 'true'

        if (isRiichi) {
            const uraDoraMarkers = uraDoraStr ? parseHais(uraDoraStr) : []

            if (uraDoraMarkers.length !== requiredMarkerCount) {
                return {
                    type: 'error',
                    message: `Invalid ura dora count. Expected ${requiredMarkerCount} tiles for ${kantsuCount} kantsu with Riichi.`
                }
            }
        }

        // パラメータの変換
        // パラメータの変換
        // TODO: parseExtendedMspzの結果からIDを取り出すより、マッピングを持ったほうが安全だが、
        // riichi-mahjongに単一牌パースAPIがないため、一旦parseExtendedMspzを通す。
        // しかし parseExtendedMspz が返すのはKindIDの配列。
        // parseExtendedMspzは単純なMSPZ文字列("8s"など)でエラーになる場合があるため、
        // まずparseMspzを試み、ダメならExtendedを試す、あるいはagariは通常simpleなのでparseMspzを使う。
        let agariHai: HaiKindId | undefined
        try {
            const agariTehai = parseMspz(agariStr)
            agariHai = agariTehai.closed[0] as HaiKindId
        } catch {
            // 拡張構文だった場合のフォールバック（単一牌ではあまりないが）
            try {
                const agariTehai = parseExtendedMspz(agariStr)
                agariHai = agariTehai.closed[0] as HaiKindId
            } catch {
                return null
            }
        }

        if (agariHai === undefined) return null

        const bakaze = parseKazehai(baStr) ?? HaiKind.Ton
        const jikaze = parseKazehai(jiStr) ?? HaiKind.Ton

        // 裏ドラ表示牌リスト（再パースは効率悪いがバリデーション済み）
        const uraDoraMarkers = uraDoraStr ? parseHais(uraDoraStr) : undefined

        const isOya = jikaze === HaiKind.Ton

        // 構造解析と符計算のためにMentsuTehaiを生成しなおす...のは難しいので、
        // 既存の calculateFuDetails を使うために構造が必要。
        // しかし、parseExtendedMspzは構造(MentsuList)を返さない。Tehai (closed/exposed) だけ。
        // fuCalculator.ts は Structure が必要。
        // Structureを復元するのは大変（理牌や多面待ち判定など）。
        //
        // 妥協策として、Queryからの生成時はFuDetailsを省略するか、
        // もしくはライブラリの機能でStructureを取得できればよいが...
        // ライブラリには `detectYaku` などはあるが、Structureを直接返すAPIは公開されていないかも？
        //
        // Types.ts を確認すると `fuDetails` は optional (`?`)。
        // Query生成時は省略しても良いかもしれない。今回は省略する。

        // 点数計算
        const answer = calculateScoreForTehai(tehai, {
            agariHai,
            isTsumo,
            jikaze,
            bakaze,
            doraMarkers,
        })

        if (answer.han === 0) return { type: 'error', message: 'No yaku (Yaku Nashi).' }

        const yakuResult = detectYaku(tehai, agariHai, bakaze, jikaze, doraMarkers, uraDoraMarkers, isTsumo)
        const yakuDetails: YakuDetail[] = yakuResult.map(([name, han]) => ({
            name: getYakuNameJa(name),
            han: han
        }))

        // リーチ・裏ドラの加算
        let finalAnswer = answer;
        if (isRiichi) {
            const addedHan = 1 // リーチ
            let uraDoraHan = 0

            if (uraDoraMarkers) {
                uraDoraMarkers.forEach((marker) => {
                    const doraHai = getDoraFromIndicator(marker)
                    uraDoraHan += tehai.closed.filter((h) => h === doraHai).length
                    tehai.exposed.forEach((mentsu) => {
                        uraDoraHan += mentsu.hais.filter((h) => h === doraHai).length
                    })
                })
            }

            finalAnswer = recalculateScore(answer, addedHan + uraDoraHan, { isTsumo, isOya })

            yakuDetails.unshift({ name: '立直', han: 1 })
            if (uraDoraHan > 0) {
                yakuDetails.push({ name: '裏ドラ', han: uraDoraHan })
            }
        }

        // ドラ (表ドラ) の加算
        let doraHan = 0
        doraMarkers.forEach(marker => {
            const doraHai = getDoraFromIndicator(marker)
            doraHan += tehai.closed.filter(h => h === doraHai).length
            tehai.exposed.forEach(m => doraHan += m.hais.filter(h => h === doraHai).length)
        })

        if (doraHan > 0) {
            yakuDetails.push({ name: 'ドラ', han: doraHan })
        }

        return {
            type: 'success',
            question: {
                tehai,
                agariHai,
                isTsumo,
                jikaze,
                bakaze,
                doraMarkers,
                isRiichi,
                uraDoraMarkers,
                answer: finalAnswer,
                fuDetails: undefined,
                yakuDetails,
            }
        }

    } catch (e) {
        console.error('Failed to parse query params:', e)
        return { type: 'error', message: e instanceof Error ? e.message : 'Unknown error occurred during parsing.' }
    }
}

/**
 * DrillQuestion から URL (Path + Query) を生成
 */
export function generatePathAndQueryFromQuestion(question: DrillQuestion): string {
    const params = new URLSearchParams()

    // tehai
    const tehaiStr = tehaiToMspz(question.tehai)
    params.set('tehai', tehaiStr)

    // agari
    if (question.agariHai) {
        // IDから文字列へ復元 (簡易的)
        // MSPZライブラリにID->String変換があると良いが、ここでは簡易実装
        // parseMspzの逆を行う必要がある。
        // riichi-mahjong の HaiKindId は 0-33 などの数値、もしくはEnum。
        // ここでは単純化して、別途マッピングが必要だが...
        // 既存の queryQuestionGenerator には逆変換ロジックがない。
        // HaiKindId -> String (MSPZ) の変換が必要。
        // いったん、DrillQuestion生成時に文字列表現を持っていないため、復元は困難。
        // つまり、DrillQuestion に originalParams を持たせるか、
        // あるいはリバース変換を実装するか。
        //
        // 幸い、DrillQuestionを作っている場所（generateValidQuestion）では
        // 牌のIDを使っており、MSPZ文字列は持っていない。
        // 
        // ここで HaiStrength などを文字に直す必要がある。
        // さしあたり、hais.ts 等にあるマップを使うか、自前で書くか。

        // agariHai は単一牌なので、数値から "1m", "2p" 等へ変換
        params.set('agari', haiIdToMspz(question.agariHai))
    }

    // dora
    if (question.doraMarkers.length > 0) {
        const doraStr = question.doraMarkers.map(id => haiIdToMspz(id)).join('')
        params.set('dora', doraStr)
    }

    // ura
    if (question.uraDoraMarkers && question.uraDoraMarkers.length > 0) {
        const uraStr = question.uraDoraMarkers.map(id => haiIdToMspz(id)).join('')
        params.set('ura', uraStr)
    }

    // tsumo
    if (question.isTsumo) params.set('tsumo', 'true')

    // riichi
    if (question.isRiichi) params.set('riichi', 'true')

    // ba
    params.set('ba', kazeIdToMspz(question.bakaze))

    // ji
    params.set('ji', kazeIdToMspz(question.jikaze))


    // Tehai (Path)の生成
    // 手牌の配列をMSPZ文字列に変換
    // これが一番大変。副露を含めた文字列生成が必要。
    return `/problems/score?${params.toString()}`
}


// --- Helpers for Reverse Conversion (ID -> MSPZ) ---

function haiIdToMspz(id: HaiKindId): string {
    // 0-8: 1-9m, 9-17: 1-9p, 18-26: 1-9s, 27-33: z
    // HaiKind enumを確認すると:
    // Man1=0 ... Man9=8
    // Pin1=9 ... Pin9=17
    // Sou1=18 ... Sou9=26
    // Ton=27, Nan=28, Sha=29, Pei=30, Haku=31, Hatsu=32, Chun=33

    if (id >= 0 && id <= 8) return `${id + 1}m`
    if (id >= 9 && id <= 17) return `${id - 9 + 1}p`
    if (id >= 18 && id <= 26) return `${id - 18 + 1}s`
    if (id >= 27 && id <= 33) return `${id - 27 + 1}z`
    return '1m' // fallback
}

function kazeIdToMspz(id: Kazehai): string {
    if (id === HaiKind.Ton) return '1z'
    if (id === HaiKind.Nan) return '2z'
    if (id === HaiKind.Sha) return '3z'
    if (id === HaiKind.Pei) return '4z'
    return '1z'
}

function tehaiToMspz(tehai: Tehai14): string {
    // 純手牌
    // ソートして種類ごとにまとめる
    // 例: 123m456p
    // しかし、parseExtendedMspzを使うなら "123m456p" 形式でOK。
    // 副露は [123m] とか (555z) とか。

    let result = ''

    // Closed tiles
    // まず種類ごとに分類
    const mans: number[] = []
    const pins: number[] = []
    const sous: number[] = []
    const zis: number[] = []

    const sortAndPush = (id: HaiKindId) => {
        if (id >= 0 && id <= 8) mans.push(id + 1)
        else if (id >= 9 && id <= 17) pins.push(id - 9 + 1)
        else if (id >= 18 && id <= 26) sous.push(id - 18 + 1)
        else if (id >= 27 && id <= 33) zis.push(id - 27 + 1)
    }

    tehai.closed.forEach(sortAndPush)

    // Sort
    mans.sort((a, b) => a - b); pins.sort((a, b) => a - b); sous.sort((a, b) => a - b); zis.sort((a, b) => a - b);

    if (mans.length) result += mans.join('') + 'm'
    if (pins.length) result += pins.join('') + 'p'
    if (sous.length) result += sous.join('') + 's'
    if (zis.length) result += zis.join('') + 'z'

    // Exposed (Meld)
    tehai.exposed.forEach(meld => {
        // meld.hais は ID配列
        // meld.type は 'Shuntsu' | 'Koutsu' | 'Kantsu'
        // Extended MSPZ:
        // Shuntsu/Koutsu -> [...]
        // Kantsu -> (...)

        let meldStr = ''
        const mMans: number[] = []
        const mPins: number[] = []
        const mSous: number[] = []
        const mZis: number[] = []

        const mSortAndPush = (id: HaiKindId) => {
            if (id >= 0 && id <= 8) mMans.push(id + 1)
            else if (id >= 9 && id <= 17) mPins.push(id - 9 + 1)
            else if (id >= 18 && id <= 26) mSous.push(id - 18 + 1)
            else if (id >= 27 && id <= 33) mZis.push(id - 27 + 1)
        }

        meld.hais.forEach(mSortAndPush)
        mMans.sort((a, b) => a - b); mPins.sort((a, b) => a - b); mSous.sort((a, b) => a - b); mZis.sort((a, b) => a - b);

        if (mMans.length) meldStr += mMans.join('') + 'm'
        if (mPins.length) meldStr += mPins.join('') + 'p'
        if (mSous.length) meldStr += mSous.join('') + 's'
        if (mZis.length) meldStr += mZis.join('') + 'z'

        if (meld.type === 'Kantsu') {
            result += `(${meldStr})`
        } else {
            result += `[${meldStr}]`
        }
    })

    return result
}

// ヘルパー: 牌文字列(MSPZ)をIDリストに変換
function parseHais(str: string | null): HaiKindId[] {
    if (!str) return []
    try {
        // まず標準MSPZとしてパースを試みる
        const tehai = parseMspz(str)
        return [...tehai.closed] as HaiKindId[]
    } catch {
        try {
            // 失敗したら拡張MSPZとして
            const tehai = parseExtendedMspz(str)
            return [...tehai.closed] as HaiKindId[]
        } catch {
            return []
        }
    }
}

// ヘルパー: 風牌文字列をIDに変換
function parseKazehai(str: string | null): Kazehai | undefined {
    if (!str) return undefined
    // 数値で来るか、文字列("ton")で来るか？ URL的には使いやすさ重視で数値(27-30)か、mspz(1z,2z...)
    // ここではMSPZ形式 (1z, 2z, 3z, 4z) を想定
    try {
        const tehai = parseMspz(str)
        const id = tehai.closed[0]
        if (id === HaiKind.Ton || id === HaiKind.Nan || id === HaiKind.Sha || id === HaiKind.Pei) {
            return id
        }
    } catch {
        // ignore
    }
    return undefined
}

