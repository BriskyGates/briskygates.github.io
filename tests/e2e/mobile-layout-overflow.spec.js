const { test, expect } = require('@playwright/test');

const mobileViewports = [
    { name: 'iPhone SE 1 (320px)', width: 320, height: 568 },
    { name: 'iPhone SE 2/3 (375px)', width: 375, height: 667 },
    { name: 'iPhone 12/13/14 (390px)', width: 390, height: 844 },
];

const testRoutes = [
    { name: '简体中文主页', path: '/' },
    { name: '英文主页', path: '/?lang=en' },
    { name: '繁体中文主页', path: '/?lang=zh-Hant' },
    { name: '大白话主页', path: '/?lang=plain' },
    { name: 'Plain English', path: '/?lang=plain-en' },
    { name: '大白話·繁', path: '/?lang=plain-Hant' },
];

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const el = document.querySelector('.hero-title') || document.querySelector('.plain-brief-section');
        return el && el.textContent.length > 2 && !el.textContent.includes('{{');
    });
    // Ensure motion-revealed elements are visible
    await page.evaluate(() => {
        document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-revealed'));
    });
}

test.describe('移动端各视口按钮与内容框无溢出测试', () => {
    for (const vp of mobileViewports) {
        test.describe(`${vp.name}`, () => {
            test.use({ viewport: { width: vp.width, height: vp.height } });

            for (const route of testRoutes) {
                test(`${route.name} (${route.path}) 页面与关键组件均不超出手机视口`, async ({ page }) => {
                    await page.goto(route.path);
                    await waitForAppReady(page);

                    const overflowReport = await page.evaluate((vpWidth) => {
                        const docScrollWidth = document.documentElement.scrollWidth;
                        const bodyScrollWidth = document.body.scrollWidth;

                        function isClippedByAncestor(el) {
                            let parent = el.parentElement;
                            while (parent && parent !== document.body && parent !== document.documentElement) {
                                const style = window.getComputedStyle(parent);
                                if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflow === 'clip' || style.overflowX === 'clip') {
                                    return true;
                                }
                                parent = parent.parentElement;
                            }
                            return false;
                        }

                        const unclippedOverflows = [];
                        const boxParentOverflows = [];

                        const all = document.querySelectorAll('*');
                        for (const el of all) {
                            if (['SCRIPT', 'STYLE', 'path', 'defs', 'filter', 'feDropShadow', 'g'].includes(el.tagName)) continue;
                            const style = window.getComputedStyle(el);
                            if (style.display === 'none' || style.visibility === 'hidden') continue;

                            const r = el.getBoundingClientRect();
                            if (r.width <= 0 || r.height <= 0) continue;

                            // 1. 元素本身是否超出视口
                            if (r.right > vpWidth + 1) {
                                if (!isClippedByAncestor(el)) {
                                    unclippedOverflows.push({
                                        tag: el.tagName,
                                        cls: typeof el.className === 'string' ? el.className : '',
                                        right: Math.round(r.right),
                                        diff: Math.round(r.right - vpWidth),
                                        text: (el.innerText || '').slice(0, 30).replace(/\s+/g, ' ')
                                    });
                                }
                            }

                            // 2. 关键按钮与内容卡片是否超出其直接父级
                            if (el.matches(
                                'button, a.btn-primary, a.btn-secondary, ' +
                                '.bento-card, .bento-flow-tile, .plain-case-card, .plain-tool-card, ' +
                                '.media-card, .timeline-card, .skill-tile, .service-tile, .contact-intro-card, .contact-form, ' +
                                '.partner-pill, .philosophy-card, .radar-status-badge, .plain-tool-status, .hero-stat-card'
                            )) {
                                if (el.parentElement) {
                                    const pr = el.parentElement.getBoundingClientRect();
                                    if (r.right > pr.right + 2) {
                                        boxParentOverflows.push({
                                            tag: el.tagName,
                                            cls: typeof el.className === 'string' ? el.className : '',
                                            right: Math.round(r.right),
                                            parentRight: Math.round(pr.right),
                                            diff: Math.round(r.right - pr.right),
                                            text: (el.innerText || '').slice(0, 30).replace(/\s+/g, ' ')
                                        });
                                    }
                                }
                            }
                        }

                        return {
                            docScrollWidth,
                            bodyScrollWidth,
                            unclippedOverflows,
                            boxParentOverflows
                        };
                    }, vp.width);

                    expect(overflowReport.docScrollWidth, `文档宽度超出视口 ${vp.width}px`).toBeLessThanOrEqual(vp.width);
                    expect(overflowReport.bodyScrollWidth, `Body宽度超出视口 ${vp.width}px`).toBeLessThanOrEqual(vp.width);
                    expect(overflowReport.unclippedOverflows, `未裁剪元素超出视口: ${JSON.stringify(overflowReport.unclippedOverflows)}`).toEqual([]);
                    expect(overflowReport.boxParentOverflows, `组件超出父容器: ${JSON.stringify(overflowReport.boxParentOverflows)}`).toEqual([]);
                });
            }
        });
    }
});
