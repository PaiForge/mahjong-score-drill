import { parseExtendedMspz, parseMspz, isExtendedMspz } from "@pai-forge/riichi-mahjong";
import type { HaiKindId } from "@pai-forge/riichi-mahjong";

/**
 * タイル記法のパターン（例: {{1222m}}）
 */
export const TILE_NOTATION_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * タイル記法文字列をHaiKindIdの配列にパースする
 *
 * @param notation - タイル記法文字列（例: "1222m"）
 * @returns パースされたHaiKindIdの配列
 * @throws パースに失敗した場合はエラーをスロー
 */
export function parseTileNotation(notation: string): readonly HaiKindId[] {
    if (isExtendedMspz(notation) || notation.includes("[")) {
        const tehai = parseExtendedMspz(notation);
        const exposedTiles = tehai.exposed.flatMap((f) => f.hais);
        return [...tehai.closed, ...exposedTiles];
    } else {
        const tehai = parseMspz(notation);
        return tehai.closed;
    }
}

/**
 * MarkdownコンテンツからH1タイトルを抽出する
 *
 * @param content - Markdownコンテンツ
 * @returns 抽出されたタイトル（H1が存在しない場合は空文字列）
 */
export function extractMarkdownTitle(content: string): string {
    const pattern = /^#\s+(.+)$/m;
    const match = pattern.exec(content);
    return match ? match[1].trim() : "";
}

/**
 * MarkdownコンテンツからH1タイトルを除去する
 *
 * @param content - Markdownコンテンツ
 * @returns H1タイトルが除去されたコンテンツ
 */
export function removeMarkdownTitle(content: string): string {
    return content.replace(/^#\s+.+$/m, "").trim();
}
