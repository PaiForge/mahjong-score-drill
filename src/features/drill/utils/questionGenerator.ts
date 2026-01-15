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
} from '@pai-forge/riichi-mahjong'
import {
  calculateFuDetails,
  calculateChiitoiFuDetails,
  type HandStructure,
  type MentsuShape,
} from './fuCalculator'
import { recalculateScore } from './scoreCalculator'
import { getDoraFromIndicator } from './haiNames'
import type { DrillQuestion, QuestionGeneratorOptions, YakuDetail } from '../types'

// Yaku Name Mapping (English -> Japanese)
const YAKU_NAME_MAP: Record<string, string> = {
  // 1 Han
  'Tanyao': '断変九',
  'Pinfu': '平和',
  'Iipeikou': '一盃口',
  'MenzenTsumo': '門前清自摸和',
  'Riichi': '立直',
  'Yakuhai': '役牌', // Special handling needed for specific yakuhai
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

  // Yakuman (Example subset)
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
}

function getYakuNameJa(name: string): string {
  return YAKU_NAME_MAP[name] || name
}

// 数牌の範囲
const MANZU_START = HaiKind.ManZu1 // 0
const PINZU_START = HaiKind.PinZu1 // 9
const SOUZU_START = HaiKind.SouZu1 // 18

// ... existing imports ...

// ... (omitted helper functions) ...

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
    if (!m.isFuro) {
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

// ... helper functions ...

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
 * ドリル問題を生成
 */
export function generateQuestion(
  options: QuestionGeneratorOptions = {}
): DrillQuestion | null {
  const { includeFuro = true, includeChiitoi = false } = options

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
  // generateMentsuTehai returns structure, generateChiitoitsuTehai does not.
  const structure = 'structure' in tehaiResult ? tehaiResult.structure : null

  // コンテキストを生成
  const isTsumo = Math.random() < 0.5
  const jikaze = randomChoice(KAZEHAI)
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
    const yakuDetails: YakuDetail[] = yakuResult.map(([name, han]) => ({
      name: getYakuNameJa(name),
      han: han
    }))

    // 役なしの場合は再生成
    if (answer.han === 0) return null

    // リーチ判定 (門前の場合のみ、20%の確率)
    let finalAnswer = answer
    const isRiichi = isMenzen(tehai) && Math.random() < 0.2

    // 裏ドラ生成
    let uraDoraMarkers: HaiKindId[] | undefined
    if (isRiichi) {
      uraDoraMarkers = generateDoraMarkers(kantsuCount)

      // 裏ドラの翻数を計算
      let uraDoraHan = 0
      uraDoraMarkers.forEach((marker) => {
        const doraHai = getDoraFromIndicator(marker)
        // 閉じた手牌からカウント
        uraDoraHan += tehai.closed.filter((h) => h === doraHai).length
        // 副露からカウント
        tehai.exposed.forEach((mentsu) => {
          uraDoraHan += mentsu.hais.filter((h) => h === doraHai).length
        })
      })

      // 点数再計算 (+1翻(リーチ) + 裏ドラ翻数)
      finalAnswer = recalculateScore(answer, 1 + uraDoraHan, {
        isTsumo,
        isOya: jikaze === HaiKind.Ton,
      })

      // 役詳細に追加 (リーチは先頭)
      yakuDetails.unshift({ name: '立直', han: 1 })

      if (uraDoraHan > 0) {
        yakuDetails.push({ name: '裏ドラ', han: uraDoraHan })
      }
    }

    // ドラのカウントと追加 (表ドラ)
    let doraHan = 0
    doraMarkers.forEach(marker => {
      const doraHai = getDoraFromIndicator(marker)
      doraHan += tehai.closed.filter(h => h === doraHai).length
      tehai.exposed.forEach(m => doraHan += m.hais.filter(h => h === doraHai).length)
    })

    if (doraHan > 0) {
      yakuDetails.push({ name: 'ドラ', han: doraHan })
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

    // 計算した符の合計が、ライブラリの計算結果と一致するか確認（デバッグ用）
    // ライブラリは切り上げ後の値(answer.fu)。内訳の合計は切り上げ前。
    // 内訳の合計を切り上げて answer.fu と一致すればOK。
    // 一致しない場合は、ライブラリの方が最適解を見つけている可能性があるので、
    // 生成された構造が「最適ではない」待ちとして解釈されている可能性がある。
    // この場合、問題として不適切（曖昧）かもしれないが、
    // ドリルとしては「意図した構造」での符を表示するのが親切。
    // ただし、解答（answer.fu）と内訳合計が矛盾すると混乱するので、
    // 矛盾する場合は内訳を採用せず、非表示にする手もある。
    // ここでは一旦そのまま出す。

    return {
      tehai,
      agariHai,
      isTsumo,
      jikaze,
      bakaze,
      doraMarkers,
      isRiichi,
      uraDoraMarkers,
      answer: finalAnswer,
      fuDetails,
      yakuDetails,
    }
  } catch {
    // 計算エラーの場合はnullを返す
    return null
  }
}

// 風牌
const KAZEHAI: readonly Kazehai[] = [HaiKind.Ton, HaiKind.Nan, HaiKind.Sha, HaiKind.Pei]

/**
 * 指定範囲内のランダムな整数を取得
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 配列からランダムに1つ選択
 */
function randomChoice<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

/**
 * 配列をシャッフル
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
      ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

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
