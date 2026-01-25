import { getArticleBySlug, getAllArticleSlugs } from "@/lib/articles";
import { ArticleMarkdown } from "@/app/_components/ArticleMarkdown";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: "記事が見つかりません",
        };
    }

    // extract title from content or use slug
    const titleMatch = article.content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : slug;

    return {
        title: `${title} | Mahjong Score Drill`,
    };
}

import { PageTitle } from "@/app/_components/PageTitle";

// ...

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    // Extract title
    const titleMatch = article.content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : slug;

    // Remove the H1 from content if it exists
    const content = titleMatch
        ? article.content.replace(/^#\s+.+$/m, '').trim()
        : article.content;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <PageTitle>{title}</PageTitle>
            <ArticleMarkdown content={content} />
        </div>
    );
}

export async function generateStaticParams() {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
}
