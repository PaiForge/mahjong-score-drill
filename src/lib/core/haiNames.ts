import { HaiKind, type HaiKindId, type Kazehai, type Tehai14 } from '@pai-forge/riichi-mahjong'
import { assertHaiKindId } from './type-guards'

/**
 * 風牌の日本語名を取得
 */
export function getKazeName(kaze: Kazehai): string {
  switch (kaze) {
    case HaiKind.Ton:
      return '東'
    case HaiKind.Nan:
      return '南'
    case HaiKind.Sha:
      return '西'
    case HaiKind.Pei:
      return '北'
    default:
      return ''
  }
}

/**
 * ドラ表示牌からドラを計算
 */
export function getDoraFromIndicator(indicator: HaiKindId): HaiKindId {
  // 萬子
  if (indicator >= HaiKind.ManZu1 && indicator <= HaiKind.ManZu9) {
    const next = indicator === HaiKind.ManZu9 ? HaiKind.ManZu1 : indicator + 1
    assertHaiKindId(next)
    return next
  }
  // 筒子
  if (indicator >= HaiKind.PinZu1 && indicator <= HaiKind.PinZu9) {
    const next = indicator === HaiKind.PinZu9 ? HaiKind.PinZu1 : indicator + 1
    assertHaiKindId(next)
    return next
  }
  // 索子
  if (indicator >= HaiKind.SouZu1 && indicator <= HaiKind.SouZu9) {
    const next = indicator === HaiKind.SouZu9 ? HaiKind.SouZu1 : indicator + 1
    assertHaiKindId(next)
    return next
  }
  // 風牌
  if (indicator >= HaiKind.Ton && indicator <= HaiKind.Pei) {
    const next = indicator === HaiKind.Pei ? HaiKind.Ton : indicator + 1
    assertHaiKindId(next)
    return next
  }
  // 三元牌
  if (indicator >= HaiKind.Haku && indicator <= HaiKind.Chun) {
    const next = indicator === HaiKind.Chun ? HaiKind.Haku : indicator + 1
    assertHaiKindId(next)
    return next
  }
  return indicator
}

/**
 * 手牌中のドラ枚数をカウント
 */
export function countDoraInTehai(
  tehai: Tehai14,
  markers: readonly HaiKindId[]
): number {
  let count = 0
  markers.forEach((marker) => {
    const doraHai = getDoraFromIndicator(marker)
    count += tehai.closed.filter((h) => h === doraHai).length
    tehai.exposed.forEach((mentsu) => {
      count += mentsu.hais.filter((h) => h === doraHai).length
    })
  })
  return count
}

/**
 * 風牌のキー名（英語）を取得（YAKU_NAME_MAP用）
 */
export function getKeyForKazehai(kaze: Kazehai): string {
  switch (kaze) {
    case HaiKind.Ton: return 'Ton'
    case HaiKind.Nan: return 'Nan'
    case HaiKind.Sha: return 'Sha'
    case HaiKind.Pei: return 'Pei'
  }
}
