import { MetadataRoute } from 'next'
import { getAllArticleSlugs } from '@/lib/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const slugs = await getAllArticleSlugs()
    const baseUrl = 'https://score.mahjong.help'

    const articleUrls = slugs.map((slug) => ({
        url: `${baseUrl}/articles/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...articleUrls,
    ]
}
