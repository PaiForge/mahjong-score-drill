import { parseTileNotation, TILE_NOTATION_PATTERN } from "./markdown";
import type { HaiKindId } from "@pai-forge/riichi-mahjong";

export interface TileInfo {
    readonly id: string;
    readonly notation: string;
    readonly tiles: readonly HaiKindId[];
}

export interface PreprocessedMarkdown {
    readonly content: string;
    readonly tiles: ReadonlyMap<string, TileInfo>;
}

/**
 * Markdownコンテンツを前処理して、タイル記法をプレースホルダーに置き換える
 *
 * @param markdown - 元のMarkdownコンテンツ
 * @returns 前処理されたMarkdownとタイル情報のマップ
 */
export function preprocessMarkdownWithTiles(
    markdown: string,
): PreprocessedMarkdown {
    const tilesMap = new Map<string, TileInfo>();
    let counter = 0;

    const processedContent = markdown.replace(
        new RegExp(TILE_NOTATION_PATTERN, "g"),
        (match, notation: string) => {
            // Markdownのエスケープを避けるため、特殊な記号を使用
            const id = `<<<TILE_${counter}>>>`;
            counter++;

            try {
                const tiles = parseTileNotation(notation);
                tilesMap.set(id, { id, notation, tiles });
                return id;
            } catch (error) {
                console.warn(`Failed to parse tile notation: ${notation}`, error);
                return match; // パース失敗時は元のまま
            }
        },
    );

    return {
        content: processedContent,
        tiles: tilesMap,
    };
}
