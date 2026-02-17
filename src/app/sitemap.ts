import { MetadataRoute } from 'next'
import { getAllArticleSlugs } from '@/lib/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const slugs = await getAllArticleSlugs()
    const baseUrl = 'https://score.mahjong.help'
    const lastModified = new Date('2026-02-17')

    const highPriorityRoutes = [
        '',
        '/problems',
        '/problems/score',
    ]

    const mediumPriorityRoutes = [
        '/problems/jantou-fu',
        '/problems/machi-fu',
        '/problems/mentsu-fu',
        '/problems/tehai-fu',
        '/cheatsheet',
    ]

    const lowPriorityRoutes = [
        '/articles',
    ]

    const staticUrls: MetadataRoute.Sitemap = [
        ...highPriorityRoutes.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        })),
        ...mediumPriorityRoutes.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...lowPriorityRoutes.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        })),
    ]

    const articleUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
        url: `${baseUrl}/articles/${slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [...staticUrls, ...articleUrls]
}
