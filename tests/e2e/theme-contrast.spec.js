const { test, expect } = require('@playwright/test');

const ROUTES = [
    { name: '简体中文', path: '/' },
    { name: 'English', path: '/?lang=en' },
    { name: '繁體中文', path: '/?lang=zh-Hant' },
    { name: '大白话', path: '/?lang=plain' },
    { name: 'Plain English', path: '/?lang=plain-en' },
    { name: '大白話·繁', path: '/?lang=plain-Hant' }
];

async function waitForAppReady(page) {
    await page.locator('#app[data-v-app]').waitFor();
    await page.waitForFunction(() => {
        const el = document.querySelector('.hero-title') || document.querySelector('.plain-brief-section');
        return el && el.textContent.trim().length > 2 && !el.textContent.includes('{{');
    });
}

async function expandAllDetails(page) {
    await page.evaluate(() => {
        document.querySelectorAll('details').forEach(details => {
            details.open = true;
        });
        document.querySelectorAll('.motion-reveal').forEach(el => {
            el.classList.add('is-revealed');
        });
    });
}

async function collectContrastViolations(page, rootSelector = 'body') {
    return page.evaluate(selector => {
        const root = document.querySelector(selector);
        if (!root) return [];

        function parseColor(str) {
            if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
            const match = str.match(/rgba?\(([^)]+)\)/);
            if (!match) return null;
            const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
            return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: parts.length >= 4 ? parts[3] : 1
            };
        }

        function composite(fg, bg) {
            const alpha = fg.a + bg.a * (1 - fg.a);
            if (alpha === 0) return { r: 251, g: 251, b: 250, a: 1 };
            return {
                r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / alpha,
                g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / alpha,
                b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / alpha,
                a: alpha
            };
        }

        function getEffectiveBackground(el) {
            const layers = [];
            let current = el;
            while (current && current.nodeType === 1) {
                const bg = parseColor(getComputedStyle(current).backgroundColor);
                if (bg && bg.a > 0) layers.unshift(bg);
                current = current.parentElement;
            }
            let result = { r: 251, g: 251, b: 250, a: 1 };
            for (const layer of layers) {
                result = composite(layer, result);
            }
            return result;
        }

        function relativeLuminance(c) {
            const toLinear = channel => {
                const s = channel / 255;
                return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
        }

        function contrastRatio(c1, c2) {
            const l1 = relativeLuminance(c1);
            const l2 = relativeLuminance(c2);
            return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }

        const violations = [];
        const seen = new Set();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
            const text = (textNode.nodeValue || '').trim();
            if (!text) continue;
            const el = textNode.parentElement;
            if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
            if (el.closest('[hidden], dialog:not([open]), .case-live, .freight-demo__announce, .studio-skip')) continue;
            // Photo/gradient surfaces where background-image provides the dark backdrop
            if (el.closest('.studio-feature-panel, .work-poster--glide')) continue;
            // WCAG 2.1 SC 1.4.3 exempts inactive/disabled UI controls
            if (el.matches(':disabled') || el.closest(':disabled')) continue;

            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) continue;
            const rect = el.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;

            const fgRaw = parseColor(style.color);
            if (!fgRaw) continue;
            const bg = getEffectiveBackground(el);
            const fg = fgRaw.a < 1 ? composite(fgRaw, bg) : fgRaw;
            const ratio = contrastRatio(fg, bg);

            const fontSize = parseFloat(style.fontSize);
            const isBold = parseInt(style.fontWeight, 10) >= 700;
            const minRatio = (fontSize >= 24 || (fontSize >= 18.66 && isBold)) ? 3.0 : 4.5;

            if (ratio < minRatio) {
                const cls = typeof el.className === 'string' ? el.className.trim() : '';
                const key = `${el.tagName}|${cls}|${style.color}|${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    violations.push({
                        tag: el.tagName,
                        cls,
                        text: text.slice(0, 40),
                        color: style.color,
                        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
                        fontSize: style.fontSize,
                        ratio: Number(ratio.toFixed(2)),
                        minRatio
                    });
                }
            }
        }
        return violations;
    }, rootSelector);
}

test.describe('全站浅色主题对比度与暗色样式防泄漏回归测试', () => {
    for (const route of ROUTES) {
        test(`${route.name} (${route.path}) 展开全部折叠区块后文本对比度全部符合 WCAG AA`, async ({ page }) => {
            await page.setViewportSize({ width: 1280, height: 900 });
            await page.goto(route.path);
            await waitForAppReady(page);
            await expandAllDetails(page);

            const violations = await collectContrastViolations(page);
            expect(violations, `${route.name} 存在对比度不达标文本: ${JSON.stringify(violations)}`).toEqual([]);
        });

        test(`${route.name} (${route.path}) 320px 手机端展开全部折叠区块无横向溢出且对比度达标`, async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 568 });
            await page.goto(route.path);
            await waitForAppReady(page);
            await expandAllDetails(page);

            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            expect(scrollWidth, `${route.name} 展开折叠区后在 320px 下出现横向溢出`).toBeLessThanOrEqual(320);

            const violations = await collectContrastViolations(page);
            expect(violations, `${route.name} 320px 存在对比度不达标文本: ${JSON.stringify(violations)}`).toEqual([]);
        });
    }

    test('工作室资料与痛点卡片在悬停与静态下均无暗色主题残留', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/');
        await waitForAppReady(page);
        await expandAllDetails(page);

        const firstEntry = page.locator('#workflows .hero-flow-entry').first();
        await firstEntry.scrollIntoViewIfNeeded();
        await firstEntry.hover();

        const entryCheck = await firstEntry.evaluate(entry => {
            const strong = entry.querySelector('strong');
            const small = entry.querySelector('small');
            return {
                strongColor: getComputedStyle(strong).color,
                strongSize: parseFloat(getComputedStyle(strong).fontSize),
                smallColor: getComputedStyle(small).color,
                smallSize: parseFloat(getComputedStyle(small).fontSize),
                entryShadow: getComputedStyle(entry).boxShadow
            };
        });
        expect(entryCheck.strongColor).toBe('rgb(22, 25, 29)');
        expect(entryCheck.strongSize).toBeGreaterThanOrEqual(14);
        expect(entryCheck.smallSize).toBeGreaterThanOrEqual(13);
        expect(entryCheck.entryShadow).toBe('none');

        const darkLeaks = await page.evaluate(() => {
            const leaks = [];
            for (const el of document.querySelectorAll('.library-page .skill-tile-icon, .library-page .service-tile-icon, .library-page .partner-pill-icon, .library-page .flow-project-icon')) {
                const shadow = getComputedStyle(el).boxShadow;
                if (shadow !== 'none') leaks.push({ cls: el.className, shadow });
            }
            for (const el of document.querySelectorAll('.liquid-glass, .service-tile')) {
                const before = getComputedStyle(el, '::before');
                if (before.content !== 'none' && before.content !== 'normal') {
                    leaks.push({ cls: el.className, beforeContent: before.content });
                }
            }
            return leaks;
        });
        expect(darkLeaks, `存在暗色主题阴影或发光边框残留: ${JSON.stringify(darkLeaks)}`).toEqual([]);
    });

    test('作品体验弹窗（Glide / CrossLeads）文本对比度符合 WCAG AA', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/');
        await waitForAppReady(page);

        await page.locator('#launch-glide').click();
        await expect(page.locator('#project-viewer')).toHaveAttribute('open', '');
        expect(await collectContrastViolations(page, '#project-viewer')).toEqual([]);
        await page.locator('.viewer-close').click();

        await page.locator('#feature-tab-freight').click();
        await page.locator('#launch-freight').click();
        await expect(page.locator('#project-viewer')).toHaveAttribute('open', '');
        expect(await collectContrastViolations(page, '#project-viewer')).toEqual([]);

        await page.locator('#freight-pool-tab').click();
        expect(await collectContrastViolations(page, '#project-viewer')).toEqual([]);
    });
});
