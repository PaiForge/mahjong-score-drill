import {
    HaiKind,
    parseExtendedMspz,
    parseMspz,
    calculateScoreForTehai,
    detectYaku,
    isTehai14,
    type HaiKindId,
    type Kazehai,
    type Tehai14,
} from '@pai-forge/riichi-mahjong'
import type { DrillQuestion, YakuDetail } from './types'
import { recalculateScore } from '@/lib/score/calculator'
import { countDoraInTehai } from '@/lib/core/haiNames'
import { getYakuNameJa } from '@/lib/core/constants'

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
            const parsed = parseExtendedMspz(tehaiStr)
            if (!isTehai14(parsed)) {
                return { type: 'error', message: `Invalid tehai: not a valid 14-tile hand.` }
            }
            tehai = parsed
        } catch {
            try {
                // 標準MSPZとして再試行 (Extended parserが標準記法に厳密で失敗する場合の救済)
                const parsed = parseMspz(tehaiStr)
                if (!isTehai14(parsed)) {
                    return { type: 'error', message: `Invalid tehai: not a valid 14-tile hand.` }
                }
                tehai = parsed
            } catch {
                return { type: 'error', message: `Invalid Extended MSPZ string: ${tehaiStr}` }
            }
        }

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

        // 和了牌のパース（parseMspz → parseExtendedMspz のフォールバック）
        let agariHai: HaiKindId | undefined
        try {
            const agariTehai = parseMspz(agariStr)
            agariHai = agariTehai.closed[0]
        } catch {
            // 拡張構文だった場合のフォールバック（単一牌ではあまりないが）
            try {
                const agariTehai = parseExtendedMspz(agariStr)
                agariHai = agariTehai.closed[0]
            } catch {
                return null
            }
        }

        if (agariHai === undefined) return null

        const bakaze = parseKazehai(baStr) ?? HaiKind.Ton
        const jikaze = parseKazehai(jiStr) ?? HaiKind.Ton

        const uraDoraMarkers = uraDoraStr ? parseHais(uraDoraStr) : undefined
        const isOya = jikaze === HaiKind.Ton

        // 点数計算（fuDetails は構造解析が必要なため Query 生成時は省略）
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
            const uraDoraHan = uraDoraMarkers ? countDoraInTehai(tehai, uraDoraMarkers) : 0

            finalAnswer = recalculateScore(answer, answer.han + addedHan + uraDoraHan, { isTsumo, isOya })

            yakuDetails.unshift({ name: '立直', han: 1 })
            if (uraDoraHan > 0) {
                yakuDetails.push({ name: '裏ドラ', han: uraDoraHan })
            }
        }

        // ドラ (表ドラ) の加算
        const doraHan = countDoraInTehai(tehai, doraMarkers)

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

    return `/problems/score/play?${params.toString()}`
}

function haiIdToMspz(id: HaiKindId): string {
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
    let result = ''
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

    tehai.exposed.forEach(meld => {
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

        if (meld.type === 'Kantsu' && !meld.furo) {
            // 暗槓: (...) 表記
            result += `(${meldStr})`
        } else {
            // 副露（チー・ポン・大明槓）: [...] 表記
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
        return [...tehai.closed]
    } catch {
        try {
            // 失敗したら拡張MSPZとして
            const tehai = parseExtendedMspz(str)
            return [...tehai.closed]
        } catch {
            return []
        }
    }
}

// ヘルパー: 風牌文字列をIDに変換
function parseKazehai(str: string | null): Kazehai | undefined {
    if (!str) return undefined
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

