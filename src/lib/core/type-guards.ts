import type { HaiKindId } from '@pai-forge/riichi-mahjong'

/** 数値が有効な HaiKindId（0-33）かどうかを判定する型ガード */
export function isHaiKindId(value: number): value is HaiKindId {
  return Number.isInteger(value) && value >= 0 && value <= 33
}

/** 数値が有効な HaiKindId（0-33）であることを表明する assertion function */
export function assertHaiKindId(value: number): asserts value is HaiKindId {
  if (!isHaiKindId(value)) {
    throw new RangeError(`Invalid HaiKindId: ${value}. Expected integer in range 0-33.`)
  }
}
