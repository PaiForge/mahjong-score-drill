import {
  HaiKind,
  MentsuType,
  FuroType,
  Tacha,
  calculateScoreForTehai,
  detectYaku,
  isMenzen,
  type HaiKindId,
  type Tehai14,
  type Kazehai,
  type CompletedMentsu,
  type Shuntsu,
  type Koutsu,
  type Kantsu,
  type ScoreResult,
} from '@pai-forge/riichi-mahjong'
import {
  calculateFuDetails,
  calculateChiitoiFuDetails,
  type HandStructure,
  type MentsuShape,
} from '@/lib/score/fuCalculator'
import { recalculateScore } from '@/lib/score/calculator'
import { getKeyForKazehai, countDoraInTehai } from '@/lib/core/haiNames'
import type { DrillQuestion, QuestionGeneratorOptions, YakuDetail } from './types'

import { ScoreLevel, getYakuNameJa } from '@/lib/core/constants'
import { randomInt, randomChoice, shuffle } from '@/lib/core/random'

// 数牌の範囲
const MANZU_START = HaiKind.ManZu1 // 0
const PINZU_START = HaiKind.PinZu1 // 9
const SOUZU_START = HaiKind.SouZu1 // 18

/**
 * 面子手（4面子1雀頭）を生成
 */
function generateMentsuTehai(
  includeFuro: boolean
): { tehai: Tehai14; agariHai: HaiKindId; structure: HandStructure } | null {
  const tracker = new HaiUsageTracker()
  const closedHais: HaiKindId[] = []
  const exposed: CompletedMentsu[] = []
  const structuralMentsu: MentsuShape[] = []

  // 副露の数を決定（0-2）
  const furoCount = includeFuro ? randomInt(0, 2) : 0

  // 4面子を生成
  for (let i = 0; i < 4; i++) {
    const isFuro = i < furoCount
    // 面子の種類を決定
    // 順子: 65%, 刻子: 30%, 槓子: 5%
    const rand = Math.random()
    const isShuntsu = rand < 0.65
    const isKantsu = rand >= 0.95

    let mentsu: CompletedMentsu | null = null
    if (isShuntsu) {
      mentsu = generateShuntsu(tracker, isFuro) || generateKoutsu(tracker, isFuro)
    } else if (isKantsu) {
      mentsu = generateKantsu(tracker, isFuro) || generateKoutsu(tracker, isFuro) || generateShuntsu(tracker, isFuro)
    } else {
      mentsu = generateKoutsu(tracker, isFuro) || generateShuntsu(tracker, isFuro)
    }

    if (!mentsu) return null

    structuralMentsu.push({
      type: mentsu.type,
      hais: mentsu.hais,
      isFuro: !!mentsu.furo,
    })

    if (mentsu.furo || mentsu.type === MentsuType.Kantsu) {
      exposed.push(mentsu)
    } else {
      closedHais.push(...mentsu.hais)
    }
  }

  // 雀頭を生成
  const toitsuHai = generateToitsu(tracker)
  if (!toitsuHai) return null
  closedHais.push(toitsuHai, toitsuHai)

  // 理牌
  closedHais.sort((a, b) => a - b)

  // 和了牌の候補を収集（インデックス情報を保持）
  const candidates: { hai: HaiKindId; target: { type: 'mentsu' | 'pair'; index: number } }[] = []

  // 面子からの候補
  structuralMentsu.forEach((m, idx) => {
    if (!m.isFuro && m.type !== MentsuType.Kantsu) {
      m.hais.forEach((hai) => {
        candidates.push({ hai, target: { type: 'mentsu', index: idx } })
      })
    }
  })

  // 雀頭からの候補
  candidates.push(
    { hai: toitsuHai, target: { type: 'pair', index: 0 } },
    { hai: toitsuHai, target: { type: 'pair', index: 0 } }
  )

  // 和了牌を決定
  const selected = randomChoice(candidates)
  const agariHai = selected.hai
  const agariTarget = selected.target

  const structure: HandStructure = {
    mentsuList: structuralMentsu,
    pair: toitsuHai,
    agariTarget,
  }

  return {
    tehai: {
      closed: closedHais,
      exposed,
    },
    agariHai,
    structure,
  }
}

/**
 * 七対子を生成
 */
function generateChiitoitsuTehai(): { tehai: Tehai14; agariHai: HaiKindId } | null {
  const tracker = new HaiUsageTracker()
  const closedHais: HaiKindId[] = []

  // 7つの対子を生成
  for (let i = 0; i < 7; i++) {
    const hai = generateToitsu(tracker)
    if (!hai) return null
    closedHais.push(hai, hai)
  }

  // 理牌
  closedHais.sort((a, b) => a - b)

  // 和了牌を決定
  const agariHai = randomChoice(closedHais)

  return {
    tehai: {
      closed: closedHais,
      exposed: [],
    },
    agariHai,
  }
}

/**
 * 槓子の数をカウント
 */
function countKantsu(tehai: Tehai14): number {
  return tehai.exposed.filter((mentsu) => mentsu.type === MentsuType.Kantsu).length
}

/**
 * ドラ表示牌を生成
 * 基本1枚、槓子がある場合はその分だけ追加
 */
function generateDoraMarkers(kantsuCount: number): HaiKindId[] {
  const count = 1 + kantsuCount // 基本1枚 + 槓子の数
  const markers: HaiKindId[] = []

  for (let i = 0; i < count; i++) {
    const kindId = randomInt(0, 33) as HaiKindId
    markers.push(kindId)
  }

  return markers
}

/**
 * 役牌照合ロジック
 * ライブラリの判定結果と手牌の実態を比較し、不足分があれば修正する
 */
function reconcileYakuhai(
  tehai: Tehai14,
  yakuResult: readonly (readonly [string, number])[],
  yakuDetails: YakuDetail[],
  answer: ScoreResult,
  bakaze: Kazehai,
  jikaze: Kazehai,
  isTsumo: boolean
): ScoreResult {
  let finalAnswer = answer

  let detectedYakuhaiHan = 0
  const yakuhaiNames = ['Yakuhai', 'Ton', 'Nan', 'Sha', 'Pei', 'Haku', 'Hatsu', 'Chun']

  yakuResult.forEach(([name, han]) => {
    if (yakuhaiNames.includes(name as string)) {
      detectedYakuhaiHan += han
    }
  })

  let expectedYakuhaiHan = 0
  const expectedYakuhaiDetails: YakuDetail[] = []

  const countHai = (id: HaiKindId) => {
    let c = tehai.closed.filter(h => h === id).length
    tehai.exposed.forEach(m => c += m.hais.filter(h => h === id).length)
    return c
  }

  const targets = [
    HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei,
    HaiKind.Haku, HaiKind.Hatsu, HaiKind.Chun
  ]

  targets.forEach(kind => {
    if (countHai(kind) >= 3) {
      let han = 0
      const nameKeys: string[] = []

      if (kind >= HaiKind.Haku) {
        han += 1
        if (kind === HaiKind.Haku) nameKeys.push('Haku')
        if (kind === HaiKind.Hatsu) nameKeys.push('Hatsu')
        if (kind === HaiKind.Chun) nameKeys.push('Chun')
      } else {
        if (kind === bakaze) {
          han += 1
          nameKeys.push(getKeyForKazehai(kind as Kazehai))
        }
        if (kind === jikaze) {
          han += 1
          nameKeys.push(getKeyForKazehai(kind as Kazehai))
        }
      }

      if (han > 0) {
        expectedYakuhaiHan += han
        nameKeys.forEach(key => {
          expectedYakuhaiDetails.push({
            name: getYakuNameJa(key),
            han: 1
          })
        })
      }
    }
  })

  const missingHan = expectedYakuhaiHan - detectedYakuhaiHan

  if (missingHan > 0) {
    finalAnswer = recalculateScore(finalAnswer, finalAnswer.han + missingHan, {
      isTsumo,
      isOya: jikaze === HaiKind.Ton
    })
  }

  // 表示用詳細リスト(yakuDetails)の再構築
  const yakuhaiJaNames = [
    '役牌 東', '役牌 南', '役牌 西', '役牌 北',
    '役牌 白', '役牌 發', '役牌 中',
    '役牌'
  ]

  const otherDetails = yakuDetails.filter(d => !yakuhaiJaNames.includes(d.name))
  while (yakuDetails.length > 0) yakuDetails.pop()
  yakuDetails.push(...otherDetails)
  yakuDetails.push(...expectedYakuhaiDetails)

  return finalAnswer
}

/**
 * リーチ・裏ドラの加算処理
 */
function applyRiichiAndUraDora(
  tehai: Tehai14,
  currentAnswer: ScoreResult,
  yakuDetails: YakuDetail[],
  kantsuCount: number,
  isTsumo: boolean,
  jikaze: Kazehai
): { answer: ScoreResult; uraDoraMarkers: HaiKindId[] | undefined } {
  const uraDoraMarkers = generateDoraMarkers(kantsuCount)

  const uraDoraHan = countDoraInTehai(tehai, uraDoraMarkers)

  const answer = recalculateScore(currentAnswer, currentAnswer.han + 1 + uraDoraHan, {
    isTsumo,
    isOya: jikaze === HaiKind.Ton,
  })

  // 詳細にリーチ/裏ドラを追加 (リーチが先)
  yakuDetails.unshift({ name: '立直', han: 1 })
  if (uraDoraHan > 0) {
    yakuDetails.push({ name: '裏ドラ', han: uraDoraHan })
  }

  return { answer, uraDoraMarkers }
}

interface BoostContext {
  readonly tehai: Tehai14
  readonly agariHai: HaiKindId
  readonly isTsumo: boolean
  readonly jikaze: Kazehai
  readonly bakaze: Kazehai
  readonly isRiichi: boolean
  readonly doraMarkers: HaiKindId[]
  readonly uraDoraMarkers: HaiKindId[] | undefined
  readonly yakuDetails: YakuDetail[]
  readonly currentAnswer: ScoreResult
}

/**
 * ドラブースト処理
 * 満貫未満の手に対してドラを追加して満貫以上に引き上げる
 */
function boostToMangan(ctx: BoostContext): { answer: ScoreResult; doraMarkers: HaiKindId[] } | undefined {
  const currentDoraMarkers = [...ctx.doraMarkers]
  const currentTehai = { ...ctx.tehai }
  const uraDoraMarkers = ctx.uraDoraMarkers ? [...ctx.uraDoraMarkers] : undefined

  // 最大5回までドラ追加を試みる
  for (let i = 0; i < 5; i++) {
    // ドラ表示牌の枚数が上限(5枚)に達していたら終了
    if (currentDoraMarkers.length >= 5) break

    // 新しいドラ表示牌を追加
    const newMarker = randomInt(0, 33) as HaiKindId
    currentDoraMarkers.push(newMarker)

    // リーチ時は裏ドラも増やす (整合性のため)
    if (ctx.isRiichi && uraDoraMarkers && uraDoraMarkers.length < currentDoraMarkers.length) {
      const newUraMarker = randomInt(0, 33) as HaiKindId
      uraDoraMarkers.push(newUraMarker)
    }

    // ドラ枚数を計算
    const additionalDoraHan = countDoraInTehai(currentTehai, currentDoraMarkers)

    // 裏ドラも考慮 (リーチ時)
    const additionalUraDoraHan = (ctx.isRiichi && uraDoraMarkers)
      ? countDoraInTehai(currentTehai, uraDoraMarkers)
      : 0

    // 再計算
    const newAnswer = calculateScoreForTehai(currentTehai, {
      agariHai: ctx.agariHai,
      isTsumo: ctx.isTsumo,
      jikaze: ctx.jikaze,
      bakaze: ctx.bakaze,
      doraMarkers: currentDoraMarkers,
    })

    // リーチ、裏ドラがある場合はそれらを加算
    let finalHan = newAnswer.han
    if (ctx.isRiichi) {
      finalHan += 1 // リーチ
      finalHan += additionalUraDoraHan
    }

    const boostResult = recalculateScore(newAnswer, finalHan, {
      isTsumo: ctx.isTsumo,
      isOya: ctx.jikaze === HaiKind.Ton
    })

    if (boostResult.scoreLevel !== ScoreLevel.Normal) {
      // 満貫に到達

      // yakuDetails を更新
      const nonDoraDetails = ctx.yakuDetails.filter(d => d.name !== 'ドラ' && d.name !== '裏ドラ' && d.name !== '立直')

      const newYakuDetails: YakuDetail[] = []
      if (ctx.isRiichi) newYakuDetails.push({ name: '立直', han: 1 })

      newYakuDetails.push(...nonDoraDetails)

      if (additionalDoraHan > 0) {
        newYakuDetails.push({ name: 'ドラ', han: additionalDoraHan })
      }
      if (additionalUraDoraHan > 0) {
        newYakuDetails.push({ name: '裏ドラ', han: additionalUraDoraHan })
      }

      while (ctx.yakuDetails.length > 0) ctx.yakuDetails.pop()
      ctx.yakuDetails.push(...newYakuDetails)

      // uraDoraMarkers を元の参照にも反映
      if (ctx.uraDoraMarkers && uraDoraMarkers) {
        while (ctx.uraDoraMarkers.length > 0) ctx.uraDoraMarkers.pop()
        ctx.uraDoraMarkers.push(...uraDoraMarkers)
      }

      return { answer: boostResult, doraMarkers: currentDoraMarkers }
    }
  }

  // ブーストしても満貫に届かなかった
  return undefined
}

/**
 * 点数範囲の妥当性チェック
 */
function validateScoreRange(
  scoreLevel: string,
  allowedRanges: readonly ('non_mangan' | 'mangan_plus')[]
): boolean {
  if (allowedRanges.length === 1 && allowedRanges[0] === 'non_mangan' && scoreLevel !== ScoreLevel.Normal) return false
  if (allowedRanges.length === 1 && allowedRanges[0] === 'mangan_plus' && scoreLevel === ScoreLevel.Normal) return false
  return true
}

/**
 * ドリル問題を生成
 */
export function generateQuestion(
  options: QuestionGeneratorOptions = {}
): DrillQuestion | null {
  const { includeFuro = true, includeChiitoi = false, includeParent = true, includeChild = true } = options

  // 手牌を生成（七対子は10%の確率）
  const isChiitoi = includeChiitoi && Math.random() < 0.1

  let tehaiResult
  if (isChiitoi) {
    tehaiResult = generateChiitoitsuTehai()
  } else {
    tehaiResult = generateMentsuTehai(includeFuro)
  }

  if (!tehaiResult) return null

  const { tehai, agariHai } = tehaiResult
  // generateMentsuTehai は構造を返すが、generateChiitoitsuTehai は返さない
  const structure = 'structure' in tehaiResult ? tehaiResult.structure : null

  // コンテキストを生成
  const isTsumo = Math.random() < 0.5

  // 自風の決定 (親・子の除外設定を反映)
  let validKazehai: Kazehai[] = [...KAZEHAI]

  if (!includeParent) {
    validKazehai = validKazehai.filter(k => k !== HaiKind.Ton)
  }
  if (!includeChild) {
    // 東以外を除外 -> 東のみにする
    validKazehai = validKazehai.filter(k => k === HaiKind.Ton)
  }

  // 両方falseの場合はありえないが、SetupScreenで防いでいる。
  // 万が一空になった場合はデフォルト(全種類)に戻す
  if (validKazehai.length === 0) validKazehai = [...KAZEHAI]

  const jikaze = randomChoice(validKazehai)
  const bakaze = randomChoice([HaiKind.Ton, HaiKind.Nan] as Kazehai[])
  const kantsuCount = countKantsu(tehai)
  const doraMarkers = generateDoraMarkers(kantsuCount)

  // 点数を計算
  try {
    const answer = calculateScoreForTehai(tehai, {
      agariHai,
      isTsumo,
      jikaze,
      bakaze,
      doraMarkers,
    })

    // 役情報を取得
    const yakuResult = detectYaku(tehai, agariHai, bakaze, jikaze, doraMarkers, undefined, isTsumo)
    const yakuDetails: YakuDetail[] = []

    yakuResult.forEach(([name, han]) => {
      const jaName = getYakuNameJa(name)
      const yakuName = name as string

      // 役牌（風）の特別対応
      // ライブラリが `Yakuhai` を返すとき、それがどの風によるものか特定する
      if (yakuName === 'Yakuhai') {
        // 後でまとめて追加するのでここではスキップ
        return
      }

      yakuDetails.push({
        name: jaName,
        han: han
      })
    })

    // 役牌照合
    let finalAnswer = reconcileYakuhai(tehai, yakuResult, yakuDetails, answer, bakaze, jikaze, isTsumo)

    // 役なしの場合は再生成
    if (finalAnswer.han === 0) return null

    // リーチ判定 (門前の場合のみ、20%の確率)
    const isRiichi = isMenzen(tehai) && Math.random() < 0.2

    let uraDoraMarkers: HaiKindId[] | undefined
    if (isRiichi) {
      const riichiResult = applyRiichiAndUraDora(tehai, finalAnswer, yakuDetails, kantsuCount, isTsumo, jikaze)
      finalAnswer = riichiResult.answer
      uraDoraMarkers = riichiResult.uraDoraMarkers
    }

    // ドラのカウントと追加 (表ドラ)
    const doraHan = countDoraInTehai(tehai, doraMarkers)

    if (doraHan > 0) {
      const existing = yakuDetails.find(d => d.name === 'ドラ')
      if (!existing) {
        yakuDetails.push({ name: 'ドラ', han: doraHan })
      }
    }

    // 符の内訳を計算
    let fuDetails
    if (isChiitoi) {
      fuDetails = calculateChiitoiFuDetails()
    } else if (structure) {
      fuDetails = calculateFuDetails(structure as HandStructure, {
        agariHai,
        isTsumo,
        bakaze,
        jikaze,
      })
    }

    const { allowedRanges = ['non_mangan', 'mangan_plus'] } = options

    // 満貫未満のみ許可 かつ 現状が満貫以上 -> リトライ対象
    if (!validateScoreRange(finalAnswer.scoreLevel, allowedRanges)) {
      return null
    }

    // ドラ調整 (Boosting)
    let boostedAnswer = finalAnswer
    let currentDoraMarkers = [...doraMarkers]

    if (allowedRanges.length === 1 && allowedRanges[0] === 'mangan_plus' && boostedAnswer.scoreLevel === ScoreLevel.Normal) {
      const boostResult = boostToMangan({
        tehai,
        agariHai,
        isTsumo,
        jikaze,
        bakaze,
        isRiichi,
        doraMarkers,
        uraDoraMarkers,
        yakuDetails,
        currentAnswer: finalAnswer,
      })

      if (!boostResult) {
        // ブーストしても届かなかった場合 -> リトライ
        return null
      }

      boostedAnswer = boostResult.answer
      currentDoraMarkers = boostResult.doraMarkers
    }

    // 最終確認: 範囲外ならnull
    if (!validateScoreRange(boostedAnswer.scoreLevel, allowedRanges)) {
      return null
    }

    return {
      tehai,
      agariHai,
      isTsumo,
      jikaze,
      bakaze,
      doraMarkers: currentDoraMarkers, // 更新されたドラ表示牌
      isRiichi,
      uraDoraMarkers,
      answer: boostedAnswer, // 更新された回答
      fuDetails,
      yakuDetails, // 更新された役詳細
    }
  } catch {
    // 計算エラーの場合はnullを返す
    return null
  }
}

// 風牌
const KAZEHAI: readonly Kazehai[] = [HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei]


/**
 * 牌使用状況を管理するクラス
 */
class HaiUsageTracker {
  private usage: number[] = Array(34).fill(0)

  canUse(kindId: HaiKindId, count: number = 1): boolean {
    return this.usage[kindId] + count <= 4
  }

  use(kindId: HaiKindId, count: number = 1): boolean {
    if (!this.canUse(kindId, count)) return false
    this.usage[kindId] += count
    return true
  }
}

/**
 * 順子を生成（数牌のみ）
 */
function generateShuntsu(
  tracker: HaiUsageTracker,
  furo: boolean = false
): Shuntsu | null {
  // どの色の数牌から作るかランダムに決定
  const suits = shuffle([
    { start: MANZU_START },
    { start: PINZU_START },
    { start: SOUZU_START },
  ])

  for (const suit of suits) {
    // 順子の開始位置をランダムに決定（1-7）
    const startPositions = shuffle(Array.from({ length: 7 }, (_, i) => i))
    for (const pos of startPositions) {
      const hai1 = (suit.start + pos) as HaiKindId
      const hai2 = (suit.start + pos + 1) as HaiKindId
      const hai3 = (suit.start + pos + 2) as HaiKindId

      if (tracker.canUse(hai1) && tracker.canUse(hai2) && tracker.canUse(hai3)) {
        tracker.use(hai1)
        tracker.use(hai2)
        tracker.use(hai3)

        const shuntsu: Shuntsu = {
          type: MentsuType.Shuntsu,
          hais: [hai1, hai2, hai3] as const,
        }

        if (furo) {
          return {
            ...shuntsu,
            furo: {
              type: FuroType.Chi,
              from: Tacha.Kamicha,
            },
          }
        }
        return shuntsu
      }
    }
  }
  return null
}

/**
 * 刻子を生成
 */
function generateKoutsu(
  tracker: HaiUsageTracker,
  furo: boolean = false
): Koutsu | null {
  // すべての牌種からランダムに選択
  const allKinds = shuffle(Array.from({ length: 34 }, (_, i) => i as HaiKindId))

  for (const kindId of allKinds) {
    if (tracker.canUse(kindId, 3)) {
      tracker.use(kindId, 3)

      const koutsu: Koutsu = {
        type: MentsuType.Koutsu,
        hais: [kindId, kindId, kindId] as const,
      }

      if (furo) {
        return {
          ...koutsu,
          furo: {
            type: FuroType.Pon,
            from: randomChoice([Tacha.Shimocha, Tacha.Toimen, Tacha.Kamicha]),
          },
        }
      }
      return koutsu
    }
  }
  return null
}

/**
 * 槓子を生成
 */
function generateKantsu(
  tracker: HaiUsageTracker,
  furo: boolean = false
): Kantsu | null {
  // すべての牌種からランダムに選択
  const allKinds = shuffle(Array.from({ length: 34 }, (_, i) => i as HaiKindId))

  for (const kindId of allKinds) {
    if (tracker.canUse(kindId, 4)) {
      tracker.use(kindId, 4)

      const kantsu: Kantsu = {
        type: MentsuType.Kantsu,
        hais: [kindId, kindId, kindId, kindId] as const,
      }

      if (furo) {
        // 明槓 (大明槓)
        return {
          ...kantsu,
          furo: {
            type: FuroType.Daiminkan,
            from: randomChoice([Tacha.Shimocha, Tacha.Toimen, Tacha.Kamicha]),
          },
        }
      }
      // 暗槓 (furoプロパティなし)
      return kantsu
    }
  }
  return null
}

/**
 * 対子（雀頭）を生成
 */
function generateToitsu(tracker: HaiUsageTracker): HaiKindId | null {
  const allKinds = shuffle(Array.from({ length: 34 }, (_, i) => i as HaiKindId))

  for (const kindId of allKinds) {
    if (tracker.canUse(kindId, 2)) {
      tracker.use(kindId, 2)
      return kindId
    }
  }
  return null
}



/**
 * 有効な問題が生成されるまでリトライ
 */
export function generateValidQuestion(
  options: QuestionGeneratorOptions = {},
  maxRetries: number = 100
): DrillQuestion | null {
  for (let i = 0; i < maxRetries; i++) {
    const question = generateQuestion(options)
    if (question) return question
  }
  return null
}
