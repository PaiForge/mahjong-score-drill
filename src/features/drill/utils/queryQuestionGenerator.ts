import {
    HaiKind,
    parseExtendedMspz,
    parseMspz,
    calculateScoreForTehai,
    type HaiKindId,
    type Kazehai,
    type Tehai14,
} from '@pai-forge/riichi-mahjong'
import type { DrillQuestion } from '../types'
import { recalculateScore } from './scoreCalculator'
import { getDoraFromIndicator } from './haiNames'


export type QueryResult =
    | { type: 'success', question: DrillQuestion }
    | { type: 'error', message: string }

/**
 * URLクエリパラメータから問題を生成
 */
export function generateQuestionFromQuery(params: URLSearchParams): QueryResult | null {
    try {
        const tehaiStr = params.get('tehai')
        const agariStr = params.get('agari')
        const isTsumoStr = params.get('tsumo')
        const doraStr = params.get('dora')
        const uraDoraStr = params.get('ura')
        const riichiStr = params.get('riichi')
        const baStr = params.get('ba')
        const jiStr = params.get('ji')

        if (!tehaiStr && !agariStr && !doraStr) return null // 何も指定がない場合はnull (ランダム生成へ)
        if (!tehaiStr || !agariStr) return { type: 'error', message: 'tehai, agari parameters are required.' }

        // 手牌のパース (Extended MSPZ)
        const tehai = parseExtendedMspz(tehaiStr) as Tehai14

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
            // fallback if it was somehow extended syntax (unlikely for single tile)
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
        let answer = calculateScoreForTehai(tehai, {
            agariHai,
            isTsumo,
            jikaze,
            bakaze,
            doraMarkers,
        })

        // リーチ・裏ドラの加算
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

            answer = recalculateScore(answer, addedHan + uraDoraHan, { isTsumo, isOya })
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
                answer,
                fuDetails: undefined,
            }
        }

    } catch (e) {
        console.error('Failed to parse query params:', e)
        return { type: 'error', message: e instanceof Error ? e.message : 'Unknown error occurred during parsing.' }
    }
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
