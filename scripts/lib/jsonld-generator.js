'use strict';

const { stripHtml } = require('./escape');

/**
 * 生成 JSON-LD 结构化数据（Person + ItemList）
 */
function generateJsonLd(config, siteUrl = 'https://briskygates.github.io') {
    const profile = config.profile || {};
    const ui = config.ui || {};

    const knowsAbout = new Set();
    (profile.heroChips || []).forEach(t => knowsAbout.add(t));
    (config.skills?.items || []).forEach(skill => {
        (skill.tags || []).forEach(t => knowsAbout.add(t));
    });

    const featuredProjects = (config.featured?.items || []).map(project => ({
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        keywords: (project.tags || []).join(', ')
    }));

    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                '@id': `${siteUrl}/#person`,
                name: profile.name,
                description: stripHtml(profile.greeting?.description || ui.pageDescription || ''),
                jobTitle: 'AI Full-Stack Engineer',
                url: siteUrl,
                knowsAbout: [...knowsAbout],
                worksFor: {
                    '@type': 'Organization',
                    name: 'Independent / Freelance'
                }
            },
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: ui.pageTitle || profile.name,
                description: ui.pageDescription,
                author: { '@id': `${siteUrl}/#person` },
                inLanguage: ['zh-CN', 'en']
            },
            {
                '@type': 'ProfilePage',
                '@id': `${siteUrl}/#profilepage`,
                url: siteUrl,
                name: ui.pageTitle,
                description: ui.pageDescription,
                mainEntity: { '@id': `${siteUrl}/#person` },
                isPartOf: { '@id': `${siteUrl}/#website` }
            }
        ]
    };

    if (featuredProjects.length) {
        graph['@graph'].push({
            '@type': 'ItemList',
            '@id': `${siteUrl}/#featured-projects`,
            name: config.featured?.title || 'Featured Projects',
            itemListElement: featuredProjects.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: project
            }))
        });
    }

    return graph;
}

function renderJsonLdScript(config, siteUrl) {
    const data = generateJsonLd(config, siteUrl);
    return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>\n`;
}

module.exports = { generateJsonLd, renderJsonLdScript };
