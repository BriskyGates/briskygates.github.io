'use strict';

/**
 * 生成纯静态 sitemap.xml（无 Jekyll front matter，经 include 原样发布）
 */
function generateSitemap(siteUrl, entries) {
    const today = new Date().toISOString().slice(0, 10);
    const urlBlocks = entries.map(({ path, priority = '0.8', changefreq = 'weekly' }) => {
        const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlBlocks}
</urlset>
`;
}

const DEFAULT_ENTRIES = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/llms.txt', priority: '0.9', changefreq: 'weekly' },
    { path: '/llms-full.txt', priority: '0.9', changefreq: 'weekly' },
    { path: '/llms-full.en.txt', priority: '0.8', changefreq: 'weekly' }
];

module.exports = { generateSitemap, DEFAULT_ENTRIES };
