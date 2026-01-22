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

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    // Remove the H1 title from the content since we might handle it separately or let markdown render it
    // For now, let's just render the raw markdown including h1
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <ArticleMarkdown content={article.content} />
        </div>
    );
}

export async function generateStaticParams() {
    const slugs = await getAllArticleSlugs();
    return slugs.map((slug) => ({ slug }));
}
