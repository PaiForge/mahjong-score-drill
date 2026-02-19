import { HaiKind, type HaiKindId, type Kazehai, type Tehai14 } from '@pai-forge/riichi-mahjong'

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
    return (indicator === HaiKind.ManZu9
      ? HaiKind.ManZu1
      : indicator + 1) as HaiKindId
  }
  // 筒子
  if (indicator >= HaiKind.PinZu1 && indicator <= HaiKind.PinZu9) {
    return (indicator === HaiKind.PinZu9
      ? HaiKind.PinZu1
      : indicator + 1) as HaiKindId
  }
  // 索子
  if (indicator >= HaiKind.SouZu1 && indicator <= HaiKind.SouZu9) {
    return (indicator === HaiKind.SouZu9
      ? HaiKind.SouZu1
      : indicator + 1) as HaiKindId
  }
  // 風牌
  if (indicator >= HaiKind.Ton && indicator <= HaiKind.Pei) {
    return (indicator === HaiKind.Pei
      ? HaiKind.Ton
      : indicator + 1) as HaiKindId
  }
  // 三元牌
  if (indicator >= HaiKind.Haku && indicator <= HaiKind.Chun) {
    return (indicator === HaiKind.Chun
      ? HaiKind.Haku
      : indicator + 1) as HaiKindId
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
