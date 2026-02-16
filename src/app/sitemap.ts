import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.sudastock.com'

    // Base routes
    const routes = [
        '',
        '/market-data',
        '/currencies',
        '/gallery',
        '/announcements',
        '/contact',
        '/about',
        '/sample',
        '/quote',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    return [...routes]
}
