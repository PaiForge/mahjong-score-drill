"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import { Hai } from "@pai-forge/mahjong-react-ui";
import { preprocessMarkdownWithTiles } from "@/lib/content/preprocessMarkdown";

interface ArticleMarkdownProps {
    /**
     * Markdownコンテンツ
     */
    readonly content: string;
}

/**
 * 麻雀の牌記法をサポートしたMarkdownレンダラー
 *
 * {{1222m}} のような記法を認識し、牌コンポーネントとしてレンダリングします。
 */
export function ArticleMarkdown({ content }: Readonly<ArticleMarkdownProps>) {
    // Markdownを前処理して、タイル記法をプレースホルダーに置き換える
    const { content: processedContent, tiles } = useMemo(
        () => preprocessMarkdownWithTiles(content),
        [content],
    );

    /**
     * テキストノード内のプレースホルダーを牌コンポーネントに変換
     */
    const replacePlaceholders = (text: string): React.ReactNode[] => {
        const parts: React.ReactNode[] = [];
        const placeholderPattern = /<<<TILE_(\d+)>>>/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = placeholderPattern.exec(text)) !== null) {
            // マッチ前のテキスト
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }

            // プレースホルダーを牌コンポーネントに置き換え
            const placeholder = match[0];
            const tileInfo = tiles.get(placeholder);

            if (tileInfo) {
                parts.push(
                    <span
                        key={placeholder}
                        className="inline-flex items-center gap-[2px] align-middle mx-[2px]"
                    >
                        {tileInfo.tiles.map((tile, idx) => (
                            <Hai key={idx} hai={tile} size="sm" />
                        ))}
                    </span>,
                );
            } else {
                parts.push(placeholder); // 見つからない場合は元のまま
            }

            lastIndex = placeholderPattern.lastIndex;
        }

        // 残りのテキスト
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.length > 0 ? parts : [text];
    };

    /**
     * children を再帰的に処理して、プレースホルダーを牌コンポーネントに変換
     */
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    const processChildren = (children: React.ReactNode): React.ReactNode => {
        return React.Children.map(children, (child) => {
            if (typeof child === "string") {
                return replacePlaceholders(child);
            }
            if (React.isValidElement(child)) {
                const props = child.props;
                if (
                    props &&
                    typeof props === "object" &&
                    "children" in props &&
                    props.children !== null &&
                    props.children !== undefined
                ) {
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    const childrenNode = props.children as React.ReactNode;
                    return React.cloneElement(
                        child,
                        props,
                        processChildren(childrenNode),
                    );
                }
            }
            return child;
        });
    };

    return (
        <article className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // テキストノードをカスタム処理
                    p: ({ node, children, ...props }) => (
                        <p {...props} className="mb-4 last:mb-0">
                            {processChildren(children)}
                        </p>
                    ),
                    li: ({ children }) => <li>{processChildren(children)}</li>,
                    h1: ({ children }) => <h1>{processChildren(children)}</h1>,
                    h2: ({ children }) => <h2>{processChildren(children)}</h2>,
                    h3: ({ children }) => <h3>{processChildren(children)}</h3>,
                    strong: ({ children }) => <strong>{processChildren(children)}</strong>,
                    em: ({ children }) => <em>{processChildren(children)}</em>,
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </article>
    );
}
