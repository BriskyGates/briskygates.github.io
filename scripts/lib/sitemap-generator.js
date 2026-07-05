'use strict';

/**
 * 生成 Jekyll 兼容的 sitemap.xml（带 front matter，避免 GitHub Pages 渲染 500）
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

    return `---
layout: null
permalink: /sitemap.xml
sitemap: false
---
<?xml version="1.0" encoding="UTF-8"?>
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
