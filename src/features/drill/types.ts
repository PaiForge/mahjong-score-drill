import type {
  HaiKindId,
  Tehai14,
  Kazehai,
  ScoreResult,
} from '@pai-forge/riichi-mahjong'

/**
 * ドリル問題
 */
export interface DrillQuestion {
  /** 手牌（14枚） */
  tehai: Tehai14
  /** 和了牌 */
  agariHai: HaiKindId
  /** ツモ和了かどうか */
  isTsumo: boolean
  /** 自風 */
  jikaze: Kazehai
  /** 場風 */
  bakaze: Kazehai
  /** ドラ表示牌 */
  doraMarkers: readonly HaiKindId[]
  /** リーチ有無 */
  isRiichi?: boolean
  /** 裏ドラ表示牌 */
  uraDoraMarkers?: readonly HaiKindId[]
  /** 正解の点数計算結果 */
  answer: ScoreResult
  /** 符計算の内訳 */
  fuDetails?: FuDetail[]
  /** 役の内訳 */
  yakuDetails?: YakuDetail[]
}

/**
 * 役の内訳詳細
 */
export interface YakuDetail {
  /** 役名（日本語） */
  name: string
  /** 翻数 */
  han: number
}

/**
 * 符計算の内訳詳細
 */
export interface FuDetail {
  /** 理由（例: 副底, 中張牌 暗刻, 等） */
  reason: string
  /** 符数 */
  fu: number
}

/**
 * ユーザーの回答
 */
export interface UserAnswer {
  /** 翻数 */
  han: number
  /** 符（満貫以上の場合はnull） */
  fu: number | null
  /** 点数（ロンまたは親ツモの場合） */
  score?: number
  /** 子のツモ時: 子からの点数 */
  scoreFromKo?: number
  /** 子のツモ時: 親からの点数 */
  scoreFromOya?: number
  /** 選択された役 */
  yakus: string[]
}

/**
 * 判定結果
 */
export interface JudgementResult {
  /** 正解かどうか */
  isCorrect: boolean
  /** 翻が正解かどうか */
  isHanCorrect: boolean
  /** 符が正解かどうか（満貫以上は常にtrue） */
  isFuCorrect: boolean
  /** 点数が正解かどうか */
  isScoreCorrect: boolean
  /** 役が正解かどうか */
  isYakuCorrect: boolean
}

/**
 * 問題生成オプション
 */
export interface QuestionGeneratorOptions {
  /** 副露を含めるかどうか */
  includeFuro?: boolean
  /** 七対子を含めるかどうか */
  includeChiitoi?: boolean
}
