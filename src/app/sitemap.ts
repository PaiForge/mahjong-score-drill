import { MetadataRoute } from 'next'
import { getAllArticleSlugs } from '@/lib/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const slugs = await getAllArticleSlugs()
    const baseUrl = 'https://score.mahjong.help'

    const routes = [
        '',
        '/articles',
        '/cheatsheet',
        '/problems',
        '/problems/score',
        '/problems/jantou-fu',
        '/problems/machi-fu',
        '/problems/mentsu-fu',
        '/problems/tehai-fu',
    ]

    const staticUrls = routes.map((route) => ({
        url: `${baseUrl}${route}`,
    }))

    const articleUrls = slugs.map((slug) => ({
        url: `${baseUrl}/articles/${slug}`,
    }))

    return [...staticUrls, ...articleUrls]
}
