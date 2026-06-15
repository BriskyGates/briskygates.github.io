'use strict';

const { stripHtml } = require('./escape');

function renderProjectBlock(project, indent = '') {
    const lines = [
        `${indent}### ${project.title}`,
        `${indent}- 副标题: ${project.subtitle}`,
        `${indent}- 描述: ${project.description}`
    ];
    if (project.tags && project.tags.length) {
        lines.push(`${indent}- 标签: ${project.tags.join(', ')}`);
    }
    if (project.highlights && project.highlights.length) {
        lines.push(`${indent}- 亮点:`);
        project.highlights.forEach(h => lines.push(`${indent}  - ${h}`));
    }
    return lines.join('\n');
}

/**
 * 生成 llms-full.txt 纯文本履历（供 AI / 爬虫读取）
 */
function generateLlmsFull(config, lang = 'zh') {
    const ui = config.ui || {};
    const profile = config.profile || {};
    const lines = [];

    lines.push(`# ${ui.pageTitle || profile.name}`);
    lines.push('');
    lines.push(`> ${ui.pageDescription || ''}`);
    lines.push('');
    lines.push('## 个人简介');
    lines.push('');
    lines.push(`- 姓名: ${profile.name}`);
    lines.push(`- 状态: ${profile.status}`);
    lines.push(`- 标语: ${profile.tagline}`);
    lines.push(`- 定位: ${profile.heroTitle}`);
    lines.push(`- 介绍: ${stripHtml(profile.greeting?.description || profile.greeting?.text || '')}`);
    if (profile.heroChips?.length) {
        lines.push(`- 技术关键词: ${profile.heroChips.join(', ')}`);
    }
    if (profile.stats?.length) {
        lines.push(`- 数据: ${profile.stats.map(s => `${s.number} ${s.label}`).join(' · ')}`);
    }
    lines.push('');

    if (config.featured?.items?.length) {
        lines.push(`## ${config.featured.title}`);
        lines.push('');
        lines.push(config.featured.subtitle || '');
        lines.push('');
        config.featured.items.forEach(p => {
            lines.push(renderProjectBlock(p));
            lines.push('');
        });
    }

    if (config.projectShowcase?.rows?.length) {
        lines.push('## 项目库');
        lines.push('');
        config.projectShowcase.rows.forEach(row => {
            lines.push(`### ${row.title}`);
            lines.push(row.description || '');
            lines.push('');
            (row.items || []).forEach(p => {
                lines.push(renderProjectBlock(p, ''));
                lines.push('');
            });
        });
    }

    if (config.experience?.items?.length) {
        lines.push(`## ${config.experience.title}`);
        lines.push('');
        lines.push(config.experience.subtitle || '');
        lines.push('');
        config.experience.items.forEach(item => {
            lines.push(`### ${item.period} — ${item.title}`);
            lines.push(item.description);
            if (item.tags?.length) {
                lines.push(`标签: ${item.tags.join(', ')}`);
            }
            lines.push('');
        });
    }

    if (config.skills?.items?.length) {
        lines.push(`## ${config.skills.title}`);
        lines.push('');
        lines.push(stripHtml(config.skills.motto || ''));
        lines.push('');
        config.skills.items.forEach(skill => {
            lines.push(`### ${skill.title}`);
            lines.push(skill.description);
            if (skill.tags?.length) {
                lines.push(`标签: ${skill.tags.join(', ')}`);
            }
            lines.push('');
        });
    }

    if (config.services?.items?.length) {
        lines.push(`## ${config.services.title}`);
        lines.push('');
        config.services.items.forEach(service => {
            lines.push(`### ${service.title} [${service.badge}]`);
            lines.push(service.description);
            if (service.technologies?.length) {
                lines.push(`技术: ${service.technologies.join(', ')}`);
            }
            lines.push('');
        });
    }

    if (config.projects?.innovation) {
        const inv = config.projects.innovation;
        lines.push(`## ${inv.title}`);
        lines.push('');
        lines.push(inv.text);
        lines.push('');
    }

    const siteUrl = 'https://briskygates.github.io';
    lines.push('## 机器可读数据源');
    lines.push('');
    lines.push(`- 站点: ${siteUrl}`);
    lines.push(`- 中文配置 JSON: ${siteUrl}/assets/data/homeConfig.json`);
    lines.push(`- 英文配置 JSON: ${siteUrl}/assets/data/homeConfig.en.json`);
    lines.push(`- llms.txt: ${siteUrl}/llms.txt`);
    lines.push(`- 语言: ${lang}`);

    return lines.join('\n').trim() + '\n';
}

module.exports = { generateLlmsFull };
