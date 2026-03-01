import { parseExtendedMspz, parseMspz, isExtendedMspz } from "@pai-forge/riichi-mahjong";
import { ok, err, type Result } from "neverthrow";
import type { HaiKindId } from "@pai-forge/riichi-mahjong";

/**
 * タイル記法のパターン（例: {{1222m}}）
 */
export const TILE_NOTATION_PATTERN = /\{\{([^}]+)\}\}/g;

/**
 * タイル記法文字列をHaiKindIdの配列にパースする
 *
 * @param notation - タイル記法文字列（例: "1222m"）
 * @returns パースされたHaiKindIdの配列、またはパースエラー
 */
export function parseTileNotation(notation: string): Result<readonly HaiKindId[], Error> {
    if (isExtendedMspz(notation) || notation.includes("[")) {
        const result = parseExtendedMspz(notation);
        if (result.isErr()) return err(result.error);
        const tehai = result.value;
        const exposedTiles = tehai.exposed.flatMap((f) => f.hais);
        return ok([...tehai.closed, ...exposedTiles]);
    } else {
        const result = parseMspz(notation);
        if (result.isErr()) return err(result.error);
        return ok(result.value.closed);
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
