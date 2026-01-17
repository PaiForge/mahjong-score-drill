import {
    type ScoreResult,
    type Payment,
} from '@pai-forge/riichi-mahjong'

/**
 * 翻数が変わった場合の点数を再計算する
 * (riichi-mahjong ライブラリは手牌から全て再計算する仕様のため、
 *  リーチのように「手牌は変わらないが役（翻数）が増える」ケースで使用する)
 */
export function recalculateScore(
    originalResult: ScoreResult,
    newHanValue: number,
    config: {
        isTsumo: boolean
        isOya: boolean
    }
): ScoreResult {
    const newHan = newHanValue
    const fu = originalResult.fu
    const { isTsumo, isOya } = config

    // 点数レベル（満貫など）の判定
    // 基本符計算: fu * 2^(2+han)
    // ただし満貫以上は固定
    let basePoints = fu * Math.pow(2, 2 + newHan)
    let scoreLevel = originalResult.scoreLevel

    if (newHan >= 13) {
        scoreLevel = 'Yakuman' // ※数え役満: 13翻以上
        basePoints = 8000
        // ダブル役満等は考慮簡略化（ドリルなので）
    } else if (newHan >= 11) {
        scoreLevel = 'Sanbaiman'
        basePoints = 6000
    } else if (newHan >= 8) {
        scoreLevel = 'Baiman'
        basePoints = 4000
    } else if (newHan >= 6) {
        scoreLevel = 'Haneman'
        basePoints = 3000
    } else if (basePoints >= 2000 || newHan >= 5) {
        scoreLevel = 'Mangan'
        basePoints = 2000
    } else {
        scoreLevel = 'Normal'
        // basePoints is already calculated
    }

    // 支払い計算 (100点単位切り上げ)
    const ceil100 = (n: number) => Math.ceil(n / 100) * 100

    let payment: Payment

    if (isTsumo) {
        if (isOya) {
            // 親ツモ: オール
            const amount = ceil100(basePoints * 2)
            payment = { type: 'oyaTsumo', amount }
        } else {
            // 子ツモ: [子払い, 親払い]
            const koPayment = ceil100(basePoints)
            const oyaPayment = ceil100(basePoints * 2)
            payment = { type: 'koTsumo', amount: [koPayment, oyaPayment] }
        }
    } else {
        // ロン
        const multiplier = isOya ? 6 : 4
        const amount = ceil100(basePoints * multiplier)
        payment = { type: 'ron', amount }
    }

    return {
        han: newHan,
        fu: fu,
        scoreLevel: scoreLevel,
        payment: payment,
    }
}
