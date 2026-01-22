import fs from "fs/promises";
import path from "path";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

export interface Article {
    slug: string;
    content: string;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return {
            slug,
            content,
        };
    } catch {
        return null;
    }
}

export async function getAllArticleSlugs(): Promise<string[]> {
    try {
        const files = await fs.readdir(ARTICLES_DIR);
        return files
            .filter((file) => file.endsWith(".md"))
            .map((file) => file.replace(/\.md$/, ""));
    } catch {
        return [];
    }
}
