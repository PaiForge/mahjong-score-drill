import { getAllArticles } from "@/lib/articles";
import { PageTitle } from "@/app/_components/PageTitle";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "記事一覧 | Mahjong Score Drill",
};

export default async function ArticlesPage() {
    const articles = await getAllArticles();

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <PageTitle>記事一覧</PageTitle>
            <div className="mt-8">
                {articles.length === 0 ? (
                    <p className="text-slate-500 text-center py-10">記事はまだありません。</p>
                ) : (
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/articles/${article.slug}`}
                                className="block group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl text-slate-800 group-hover:text-blue-600 transition-colors">
                                        {article.title}
                                    </h2>
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <nav className="mt-16 pt-8 border-t border-slate-200" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-slate-500">
                    <li>
                        <Link href="/" className="hover:text-blue-600 transition-colors">
                            Home
                        </Link>
                    </li>
                    <li>
                        <span className="mx-2 text-slate-300">/</span>
                    </li>
                    <li className="text-slate-800 font-medium" aria-current="page">
                        記事一覧
                    </li>
                </ol>
            </nav>
        </div>
    );
}
