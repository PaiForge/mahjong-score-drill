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
} from '@/lib/score/fuCalculator'
import { recalculateScore } from '@/lib/score/calculator'
import { getDoraFromIndicator, getKeyForKazehai } from '@/lib/core/haiNames'
import type { DrillQuestion, QuestionGeneratorOptions, YakuDetail } from './types'

import { YAKU_NAME_MAP } from '@/lib/core/constants'

function getYakuNameJa(name: string): string {
  return YAKU_NAME_MAP[name] || name
}

// 数牌の範囲
const MANZU_START = HaiKind.ManZu1 // 0
const PINZU_START = HaiKind.PinZu1 // 9
const SOUZU_START = HaiKind.SouZu1 // 18

const ScoreLevel = {
  Normal: 'Normal',
  Mangan: 'Mangan',
  Haneman: 'Haneman',
  Baiman: 'Baiman',
  Sanbaiman: 'Sanbaiman',
  Yakuman: 'Yakuman',
  DoubleYakuman: 'DoubleYakuman',
} as const

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
  // generateMentsuTehai は構造を返すが、generateChiitoitsuTehai は返さない
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

    // --- Yakuhai Robust Reconciliation (役牌の堅牢な照合) ---
    // ベースの回答
    let finalAnswer = answer

    // ライブラリの判定（検出された役）と、手牌の実態（期待される役）を比較し、
    // 不足分があれば加算修正する。特にGenericな'Yakuhai'が返ってきた場合や判定漏れ対策。

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
        let nameKeys: string[] = []

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

    // --- End Robust Reconciliation (照合終了) ---

    // 役なしの場合は再生成
    if (finalAnswer.han === 0) return null


    // リーチ判定 (門前の場合のみ、20%の確率)
    const isRiichi = isMenzen(tehai) && Math.random() < 0.2

    let uraDoraMarkers: HaiKindId[] | undefined
    if (isRiichi) {
      uraDoraMarkers = generateDoraMarkers(kantsuCount)

      let uraDoraHan = 0
      uraDoraMarkers.forEach((marker) => {
        const doraHai = getDoraFromIndicator(marker)
        uraDoraHan += tehai.closed.filter((h) => h === doraHai).length
        tehai.exposed.forEach((mentsu) => {
          uraDoraHan += mentsu.hais.filter((h) => h === doraHai).length
        })
      })

      // 最終回答の翻数を累積更新
      finalAnswer = recalculateScore(finalAnswer, finalAnswer.han + 1 + uraDoraHan, {
        isTsumo,
        isOya: jikaze === HaiKind.Ton,
      })

      // 詳細にリーチ/裏ドラを追加 (リーチが先)
      yakuDetails.unshift({ name: '立直', han: 1 })
      if (uraDoraHan > 0) {
        yakuDetails.push({ name: '裏ドラ', han: uraDoraHan })
      }
    }


    // ドラのカウントと追加 (表ドラ)
    let doraHan = 0
    doraMarkers.forEach((marker) => {
      const doraHai = getDoraFromIndicator(marker)
      doraHan += tehai.closed.filter((h) => h === doraHai).length
      tehai.exposed.forEach((mentsu) => {
        doraHan += mentsu.hais.filter((h) => h === doraHai).length
      })
    })

    if (doraHan > 0) {
      // 結果表示にまだなければ追加する (ライブラリは通常 'Dora' または 'Dorahai' として追加する?)
      // `detectYaku` は通常ドラを yakuResult に追加する。
      // ドキュメント/挙動を確認すると、通常は追加される。
      // もし不確かなら、確認することができる。
      // 以前のコードには `if (doraHan > 0) yakuDetails.push...` があった。
      // 安全のため、存在確認をしてから追加する。
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

    // ドラ調整 (Boosting)
    // 満貫以上が要求されているのに満貫未満の場合、ドラを乗せて調整する
    let boostedAnswer = finalAnswer
    let currentDoraMarkers = [...doraMarkers] // コピーを作成
    let currentTehai = { ...tehai }

    // 満貫未満のみ許可 かつ 現状が満貫以上 -> リトライ対象 (nullを返して再生成させる)
    if (allowedRanges.length === 1 && allowedRanges[0] === 'non_mangan' && boostedAnswer.scoreLevel !== ScoreLevel.Normal) {
      return null
    }

    // 満貫以上のみ許可 かつ 現状が満貫未満 -> ドラを増やして調整
    if (allowedRanges.length === 1 && allowedRanges[0] === 'mangan_plus' && boostedAnswer.scoreLevel === ScoreLevel.Normal) {
      // 最大5回までドラ追加を試みる
      for (let i = 0; i < 5; i++) {
        // ドラ表示牌の枚数が上限(5枚)に達していたら終了
        if (currentDoraMarkers.length >= 5) break

        // 新しいドラ表示牌を追加
        const newMarker = randomInt(0, 33) as HaiKindId
        currentDoraMarkers.push(newMarker)

        // リーチ時は裏ドラも増やす (整合性のため)
        if (isRiichi && uraDoraMarkers && uraDoraMarkers.length < currentDoraMarkers.length) {
          const newUraMarker = randomInt(0, 33) as HaiKindId
          uraDoraMarkers.push(newUraMarker)
        }

        // 点数再計算
        // ドラ枚数を計算
        let additionalDoraHan = 0
        currentDoraMarkers.forEach(marker => {
          const doraHai = getDoraFromIndicator(marker)
          additionalDoraHan += currentTehai.closed.filter(h => h === doraHai).length
          currentTehai.exposed.forEach(m => additionalDoraHan += m.hais.filter(h => h === doraHai).length)
        })

        // 裏ドラも考慮 (リーチ時)
        let additionalUraDoraHan = 0
        if (isRiichi && uraDoraMarkers) {
          uraDoraMarkers.forEach(marker => {
            const doraHai = getDoraFromIndicator(marker)
            additionalUraDoraHan += currentTehai.closed.filter(h => h === doraHai).length
            currentTehai.exposed.forEach(m => additionalUraDoraHan += m.hais.filter(h => h === doraHai).length)
          })
        }

        // 基本点数計算にドラ分を加算して再計算するのは難しい（calculateScoreForTehaiはドラ表示牌を受け取る）
        // なので、calculateScoreForTehai を再度呼ぶのが確実だが、tehai構造が変わるわけではないので
        // recalculateScore を使う手もあるが、ドラの翻数が変わるので calculateScoreForTehai に新しいドラ表示牌を渡すのがベスト。
        // ただし、uraDoraMarkers は calculateScoreForTehai には渡せない（裏ドラは役ではないため）。
        // ここでは、answer (基本計算結果) はそのままで、最終的な点数を調整する必要がある。
        // しかし、DoraはYakuとして扱われるため、calculateScoreForTehai に渡せば ScoreResult に反映される。

        // 再計算
        const newAnswer = calculateScoreForTehai(currentTehai, {
          agariHai,
          isTsumo,
          jikaze,
          bakaze,
          doraMarkers: currentDoraMarkers,
        })

        // リーチ、裏ドラがある場合はそれらを加算
        let finalHan = newAnswer.han
        if (isRiichi) {
          finalHan += 1 // リーチ
          finalHan += additionalUraDoraHan
        }

        // 点数計算のみ実行（役判定等は calculateScoreForTehai で済んでいるが、リーチ・裏ドラは手動加算が必要）
        // recalculateScore を使って、newAnswer をベースに最終的な翻数を適用する
        // newAnswer.han はドラ込み、役込みの翻数。
        // ここにリーチと裏ドラを足す。

        // 正確には:
        // calculateScoreForTehai の結果には「リーチ」「裏ドラ」は含まれていない（オプションにない）。
        // なので、newAnswer.han + (isRiichi ? 1 : 0) + additionalUraDoraHan で再計算する。

        const boostResult = recalculateScore(newAnswer, finalHan, {
          isTsumo,
          isOya: jikaze === HaiKind.Ton
        })

        if (boostResult.scoreLevel !== ScoreLevel.Normal) {
          // 満貫に到達した！
          boostedAnswer = boostResult

          // yakuDetails を更新
          // 既存のリストをベースに、ドラの項目を更新または追加する必要がある

          // まずドラ以外の役を抽出
          const nonDoraDetails = yakuDetails.filter(d => d.name !== 'ドラ' && d.name !== '裏ドラ' && d.name !== '立直')

          // 再構築
          const newYakuDetails: YakuDetail[] = []
          if (isRiichi) newYakuDetails.push({ name: '立直', han: 1 })

          newYakuDetails.push(...nonDoraDetails)

          // ドラ
          if (additionalDoraHan > 0) {
            newYakuDetails.push({ name: 'ドラ', han: additionalDoraHan })
          }
          // 裏ドラ
          if (additionalUraDoraHan > 0) {
            newYakuDetails.push({ name: '裏ドラ', han: additionalUraDoraHan })
          }

          // 結果を更新してループを抜ける
          while (yakuDetails.length > 0) yakuDetails.pop()
          yakuDetails.push(...newYakuDetails)

          break
        }
      }

      // ブーストしても届かなかった場合 -> 今回は諦めて null (リトライ)
      if (boostedAnswer.scoreLevel === ScoreLevel.Normal) {
        return null
      }
    }

    // 最終確認: 範囲外ならnull (例えば意図せず高くなりすぎた場合など)
    // non_mangan 指定で mangan になったケースは上で弾いているが、念のため
    if (allowedRanges.length === 1 && allowedRanges[0] === 'non_mangan' && boostedAnswer.scoreLevel !== ScoreLevel.Normal) return null
    if (allowedRanges.length === 1 && allowedRanges[0] === 'mangan_plus' && boostedAnswer.scoreLevel === ScoreLevel.Normal) return null

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
