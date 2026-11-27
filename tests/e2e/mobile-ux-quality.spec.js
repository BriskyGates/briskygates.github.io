const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
    { name: '320x568', width: 320, height: 568 },
    { name: '375x667', width: 375, height: 667 },
    { name: '390x844', width: 390, height: 844 }
];

const ROUTES = [
    { lang: 'zh', name: '简体中文', path: '/' },
    { lang: 'en', name: 'English', path: '/?lang=en' },
    { lang: 'zh-Hant', name: '繁體中文', path: '/?lang=zh-Hant' },
    { lang: 'plain', name: '大白话', path: '/?lang=plain' },
    { lang: 'plain-en', name: 'Plain English', path: '/?lang=plain-en' },
    { lang: 'plain-Hant', name: '大白話·繁', path: '/?lang=plain-Hant' }
];

async function waitForAppReady(page) {
    await page.locator('#app[data-v-app]').waitFor();
    await page.waitForFunction(() => {
        const el = document.querySelector('.hero-title') || document.querySelector('.plain-brief-section');
        return el && el.textContent.trim().length > 2 && !el.textContent.includes('{{');
    });
    await page.evaluate(() => {
        document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-revealed'));
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
            for (const layer of layers) result = composite(layer, result);
            return result;
        }

        function relativeLuminance(c) {
            const toLinear = ch => {
                const s = ch / 255;
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
            if (el.closest('.studio-feature-panel, .work-poster--glide')) continue;
            if (el.matches(':disabled') || el.closest(':disabled')) continue;

            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) continue;
            const rect = el.getBoundingClientRect();
            if (rect.width <= 1 || rect.height <= 1) continue;

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

async function dispatchTouchSwipe(page, context, { startX, startY, endX, endY, steps = 8 }) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: Math.round(startX), y: Math.round(startY), id: 1 }]
    });
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{
                x: Math.round(startX + (endX - startX) * t),
                y: Math.round(startY + (endY - startY) * t),
                id: 1
            }]
        });
    }
    await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
    });
    await cdp.detach();
}

test.describe('Mobile UX Quality Matrix (320 / 375 / 390 x 6 languages)', () => {
    for (const vp of VIEWPORTS) {
        test.describe(`${vp.name}`, () => {
            test.use({ viewport: { width: vp.width, height: vp.height }, contextOptions: { reducedMotion: 'reduce' } });

            for (const route of ROUTES) {
                test(`${route.name} (${route.path}): chrome budget, above-the-fold CTA, 44px touch targets, 16px inputs, typography >=12px, lang sheet, footer & WCAG AA contrast`, async ({ page }) => {
                    await page.goto(route.path);
                    await waitForAppReady(page);

                    // 1. Initial viewport: sticky chrome budget, brand single-line, no #home mobile-section stutter, above-the-fold Hero CTA
                    const initialReport = await page.evaluate(({ vpWidth, vpHeight }) => {
                        const header = document.querySelector('.studio-header');
                        const bottomNav = document.querySelector('.mobile-bottom-nav');
                        const brand = document.querySelector('.studio-brand');
                        const brandHandle = document.querySelector('.studio-brand .brand-handle');
                        const mobileSection = document.querySelector('.studio-brand .mobile-section');
                        const langBtn = document.querySelector('.sidebar-footer .lang-btn');
                        const heroTitle = document.querySelector('.hero-title');
                        const cta = document.querySelector('#launch-glide');
                        const tabs = [...document.querySelectorAll('.studio-feature-tabs button')];

                        let brandLineCount = 0;
                        if (brandHandle) {
                            const range = document.createRange();
                            range.selectNodeContents(brandHandle);
                            brandLineCount = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).length;
                        }

                        const mobileSectionVisible = Boolean(
                            mobileSection &&
                            getComputedStyle(mobileSection).display !== 'none' &&
                            mobileSection.getBoundingClientRect().width > 0
                        );

                        const headerRect = header.getBoundingClientRect();
                        const navRect = bottomNav.getBoundingClientRect();
                        const brandRect = brand.getBoundingClientRect();
                        const langRect = langBtn.getBoundingClientRect();
                        const ctaRect = cta ? cta.getBoundingClientRect() : null;
                        const titleRect = heroTitle ? heroTitle.getBoundingClientRect() : null;

                        return {
                            vpWidth,
                            vpHeight,
                            scrollWidth: document.documentElement.scrollWidth,
                            headerHeight: Number(headerRect.height.toFixed(1)),
                            headerBottom: Number(headerRect.bottom.toFixed(1)),
                            bottomNavHeight: Number(navRect.height.toFixed(1)),
                            bottomNavTop: Number(navRect.top.toFixed(1)),
                            brandLineCount,
                            brandOverlapLang: brandRect.right > langRect.left + 1,
                            mobileSectionVisible,
                            titleBottom: titleRect ? Number(titleRect.bottom.toFixed(1)) : null,
                            ctaTop: ctaRect ? Number(ctaRect.top.toFixed(1)) : null,
                            ctaBottom: ctaRect ? Number(ctaRect.bottom.toFixed(1)) : null,
                            tabBoxes: tabs.map(t => {
                                const r = t.getBoundingClientRect();
                                return { id: t.id, top: r.top, bottom: r.bottom, height: r.height, width: r.width };
                            })
                        };
                    }, { vpWidth: vp.width, vpHeight: vp.height });

                    expect(initialReport.scrollWidth, 'initial horizontal overflow').toBeLessThanOrEqual(vp.width);
                    expect(initialReport.headerHeight, 'header height budget <= 60px').toBeLessThanOrEqual(60);
                    expect(initialReport.bottomNavHeight, 'bottom nav height budget <= 64px').toBeLessThanOrEqual(64);
                    expect(initialReport.headerHeight + initialReport.bottomNavHeight, 'combined chrome <= 124px').toBeLessThanOrEqual(124);
                    expect(initialReport.brandLineCount, '.brand-handle must stay single-line without mid-word break').toBe(1);
                    expect(initialReport.brandOverlapLang, '.studio-brand must not overlap .lang-btn').toBe(false);
                    expect(initialReport.mobileSectionVisible, 'no .mobile-section stutter on #home').toBe(false);
                    expect(initialReport.ctaTop, '#launch-glide below header').toBeGreaterThanOrEqual(initialReport.headerBottom - 1);
                    expect(initialReport.ctaBottom, '#launch-glide CTA cleanly above .mobile-bottom-nav').toBeLessThanOrEqual(initialReport.bottomNavTop + 1);
                    for (const tab of initialReport.tabBoxes) {
                        expect(tab.height, `${tab.id} touch height >= 44px`).toBeGreaterThanOrEqual(43.9);
                    }

                    // 2. Touch targets (>= 44px), iOS 16px input guard, typography floor (>= 12px), pairwise non-overlap & clipping
                    const audit = await page.evaluate(() => {
                        const MIN_TOUCH = 43.9;
                        const touchChecks = [
                            { selector: '.studio-brand', requireWidth: true },
                            { selector: '.sidebar-footer .lang-btn', requireWidth: true },
                            { selector: '.mobile-bottom-nav .mobile-nav-item', requireWidth: true },
                            { selector: 'a.delivery-entry', requireWidth: true },
                            { selector: '.studio-feature-cta', requireWidth: true },
                            { selector: '.studio-feature-tabs button', requireWidth: true },
                            { selector: '.work-try', requireWidth: true },
                            { selector: '.work-link', requireWidth: true },
                            { selector: '.casebook-index a', requireWidth: true },
                            { selector: '.casebook article:not([hidden]) .case-jumps button', requireWidth: true },
                            { selector: '.casebook article:not([hidden]) .lab-reset', requireWidth: true },
                            { selector: '.casebook article:not([hidden]) .lab-workspace button', requireWidth: true },
                            { selector: '.casebook article:not([hidden]) .lab-workspace select', requireWidth: true },
                            { selector: '.casebook article:not([hidden]) .case-record > summary', requireWidth: true },
                            { selector: '#glide-delivery .delivery-sources a', requireWidth: true },
                            { selector: '#glide-delivery .delivery-routes a', requireWidth: true },
                            { selector: '#glide-delivery .delivery-collaboration header a', requireWidth: true },
                            { selector: '#contact form input, #contact form textarea', requireWidth: true },
                            { selector: '#contact form button[type="submit"]', requireWidth: true },
                            { selector: '#contact a.btn-support-link', requireWidth: true },
                            { selector: '.site-footer a.footer-link', requireWidth: true }
                        ];

                        const smallTargets = [];
                        for (const { selector, requireWidth } of touchChecks) {
                            for (const el of document.querySelectorAll(selector)) {
                                if (el.closest('[hidden], dialog:not([open])')) continue;
                                const style = getComputedStyle(el);
                                if (style.display === 'none' || style.visibility === 'hidden') continue;
                                const r = el.getBoundingClientRect();
                                if (r.width === 0 && r.height === 0) continue;
                                if (r.height < MIN_TOUCH || (requireWidth && r.width < MIN_TOUCH)) {
                                    smallTargets.push({
                                        selector,
                                        text: (el.innerText || el.getAttribute('aria-label') || el.id || '').trim().slice(0, 32),
                                        width: Number(r.width.toFixed(1)),
                                        height: Number(r.height.toFixed(1))
                                    });
                                }
                            }
                        }

                        // iOS Safari auto-zoom guard: >= 16px on visible form controls in #contact and #case-studies
                        const smallInputs = [];
                        for (const el of document.querySelectorAll('#contact :is(input, textarea, select), #case-studies :is(input, textarea, select)')) {
                            if (el.closest('[hidden]')) continue;
                            if (el.type === 'range') continue;
                            const style = getComputedStyle(el);
                            if (style.display === 'none' || style.visibility === 'hidden') continue;
                            const r = el.getBoundingClientRect();
                            if (r.width === 0 && r.height === 0) continue;
                            const fs = parseFloat(style.fontSize);
                            if (fs < 15.9) {
                                smallInputs.push({
                                    tag: el.tagName,
                                    id: el.id || el.dataset.caseChange || el.className,
                                    fontSize: Number(fs.toFixed(2))
                                });
                            }
                        }

                        // Pairwise non-overlap for sibling interactive control groups
                        const groupSelectors = [
                            '.studio-header-inner > :is(a, .sidebar-footer)',
                            '.mobile-bottom-nav .mobile-nav-item',
                            '.studio-feature-tabs button',
                            '.casebook-index a',
                            '.casebook article:not([hidden]) .case-jumps button',
                            '#glide-delivery .delivery-sources a',
                            '.site-footer-links a'
                        ];
                        const overlaps = [];
                        for (const groupSel of groupSelectors) {
                            const els = [...document.querySelectorAll(groupSel)].filter(el => {
                                const st = getComputedStyle(el);
                                const r = el.getBoundingClientRect();
                                return st.display !== 'none' && st.visibility !== 'hidden' && r.width > 0 && r.height > 0;
                            });
                            for (let i = 0; i < els.length; i++) {
                                const a = els[i].getBoundingClientRect();
                                for (let j = i + 1; j < els.length; j++) {
                                    const b = els[j].getBoundingClientRect();
                                    const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                                    const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                                    if (dx > 1 && dy > 1) {
                                        overlaps.push({
                                            groupSel,
                                            a: (els[i].innerText || els[i].className).trim().slice(0, 24),
                                            b: (els[j].innerText || els[j].className).trim().slice(0, 24),
                                            dx: Math.round(dx),
                                            dy: Math.round(dy)
                                        });
                                    }
                                }
                            }
                        }

                        // Vertical clipping check on interactive buttons/tabs/nav items
                        const clippedControls = [];
                        for (const el of document.querySelectorAll('.studio-header button, .mobile-nav-item, .studio-feature-tabs button, .studio-feature-cta, .casebook-index a, .casebook article:not([hidden]) .case-jumps button, .btn-submit, .btn-support-link')) {
                            if (el.closest('[hidden]')) continue;
                            const st = getComputedStyle(el);
                            if (st.display === 'none' || st.visibility === 'hidden') continue;
                            if (el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 2) {
                                clippedControls.push({
                                    cls: el.className,
                                    text: (el.innerText || '').trim().slice(0, 28),
                                    clientHeight: el.clientHeight,
                                    scrollHeight: el.scrollHeight
                                });
                            }
                        }

                        // Typography floor >= 12px on all visible UI text
                        const smallText = [];
                        const seenSmall = new Set();
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                        let node;
                        while ((node = walker.nextNode())) {
                            const txt = (node.nodeValue || '').trim();
                            if (!txt) continue;
                            const el = node.parentElement;
                            if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
                            if (el.closest('[hidden], dialog:not([open]), .case-live, .freight-demo__announce, .studio-skip, svg')) continue;
                            const st = getComputedStyle(el);
                            if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) continue;
                            const r = el.getBoundingClientRect();
                            if (r.width <= 1 || r.height <= 1) continue;
                            const fs = parseFloat(st.fontSize);
                            if (fs < 11.9) {
                                const cls = typeof el.className === 'string' ? el.className.trim() : '';
                                const key = `${el.tagName}|${cls}|${fs.toFixed(1)}`;
                                if (!seenSmall.has(key)) {
                                    seenSmall.add(key);
                                    smallText.push({
                                        tag: el.tagName,
                                        cls,
                                        text: txt.slice(0, 32),
                                        fontSize: Number(fs.toFixed(2))
                                    });
                                }
                            }
                        }

                        return { smallTargets, smallInputs, overlaps, clippedControls, smallText };
                    });

                    expect(audit.smallTargets, `Sub-44px touch targets: ${JSON.stringify(audit.smallTargets)}`).toEqual([]);
                    expect(audit.smallInputs, `Sub-16px mobile inputs (iOS zoom risk): ${JSON.stringify(audit.smallInputs)}`).toEqual([]);
                    expect(audit.overlaps, `Overlapping controls: ${JSON.stringify(audit.overlaps)}`).toEqual([]);
                    expect(audit.clippedControls, `Vertically clipped controls: ${JSON.stringify(audit.clippedControls)}`).toEqual([]);
                    expect(audit.smallText, `Sub-12px visible text: ${JSON.stringify(audit.smallText)}`).toEqual([]);

                    // 3. Bottom-sheet .lang-menu viewport containment, >=44px options, scroll lock & Escape focus return
                    const langBtn = page.locator('.sidebar-footer .lang-btn');
                    await langBtn.click();
                    const langMenu = page.locator('.sidebar-footer .lang-menu');
                    await expect(langMenu).toBeVisible();

                    const sheetCheck = await page.evaluate(({ vpWidth, vpHeight }) => {
                        const menu = document.querySelector('.sidebar-footer .lang-menu');
                        const r = menu.getBoundingClientRect();
                        const items = [...menu.querySelectorAll('.lang-menu__item')].map(item => {
                            const ir = item.getBoundingClientRect();
                            return { text: item.innerText.trim(), height: Number(ir.height.toFixed(1)), right: Number(ir.right.toFixed(1)) };
                        });
                        return {
                            left: Number(r.left.toFixed(1)),
                            right: Number(r.right.toFixed(1)),
                            top: Number(r.top.toFixed(1)),
                            bottom: Number(r.bottom.toFixed(1)),
                            vpWidth,
                            vpHeight,
                            htmlLocked: document.documentElement.classList.contains('sheet-scroll-lock'),
                            bodyLocked: document.body.classList.contains('sheet-scroll-lock'),
                            items
                        };
                    }, { vpWidth: vp.width, vpHeight: vp.height });

                    expect(sheetCheck.left, '.lang-menu left >= 0').toBeGreaterThanOrEqual(-1);
                    expect(sheetCheck.right, '.lang-menu right <= viewport').toBeLessThanOrEqual(vp.width + 1);
                    expect(sheetCheck.top, '.lang-menu top >= 0').toBeGreaterThanOrEqual(-1);
                    expect(sheetCheck.bottom, '.lang-menu bottom <= viewport').toBeLessThanOrEqual(vp.height + 1);
                    expect(sheetCheck.htmlLocked, 'html.sheet-scroll-lock enabled').toBe(true);
                    expect(sheetCheck.bodyLocked, 'body.sheet-scroll-lock enabled').toBe(true);
                    for (const item of sheetCheck.items) {
                        expect(item.height, `lang option "${item.text}" >= 44px`).toBeGreaterThanOrEqual(43.9);
                    }

                    // Check WCAG AA contrast of opened lang-menu
                    expect(await collectContrastViolations(page, '.sidebar-footer .lang-menu'), 'lang-menu contrast').toEqual([]);

                    await page.keyboard.press('Escape');
                    await expect(langMenu).toBeHidden();
                    await expect(langBtn).toBeFocused();
                    expect(await page.evaluate(() => document.documentElement.classList.contains('sheet-scroll-lock'))).toBe(false);

                    // 4. Scrolled header sanity (brand stays single-line when section changes) + footer reachability above bottom nav
                    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
                    await page.waitForTimeout(80);
                    const footerReport = await page.evaluate(() => {
                        const bottomNav = document.querySelector('.mobile-bottom-nav').getBoundingClientRect();
                        const brand = document.querySelector('.studio-brand').getBoundingClientRect();
                        const handle = document.querySelector('.studio-brand .brand-handle');
                        const range = document.createRange();
                        range.selectNodeContents(handle);
                        const brandLineCount = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).length;
                        const langRect = document.querySelector('.sidebar-footer .lang-btn').getBoundingClientRect();
                        const links = [...document.querySelectorAll('.site-footer a.footer-link')].map(a => {
                            const r = a.getBoundingClientRect();
                            return { text: a.innerText.trim(), bottom: Number(r.bottom.toFixed(1)), height: Number(r.height.toFixed(1)) };
                        });
                        return {
                            brandLineCount,
                            brandOverlapLang: brand.right > langRect.left + 1,
                            bottomNavTop: Number(bottomNav.top.toFixed(1)),
                            links
                        };
                    });

                    expect(footerReport.brandLineCount, 'scrolled .brand-handle remains single-line').toBe(1);
                    expect(footerReport.brandOverlapLang, 'scrolled .studio-brand does not overlap .lang-btn').toBe(false);
                    for (const link of footerReport.links) {
                        expect(link.bottom, `footer link "${link.text}" clears bottom nav`).toBeLessThanOrEqual(footerReport.bottomNavTop + 1);
                    }

                    // 5. Expanded details WCAG AA contrast check at 375px & 390px (320px already covered in theme-contrast.spec.js too)
                    if (vp.width >= 375) {
                        await page.evaluate(() => {
                            document.querySelectorAll('details').forEach(d => { d.open = true; });
                        });
                        const contrastViolations = await collectContrastViolations(page);
                        expect(contrastViolations, `${vp.name} ${route.name} WCAG AA contrast`).toEqual([]);
                        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
                    }
                });
            }
        });
    }
});

test.describe('Mobile Hero Touch Swipe (390x844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, contextOptions: { reducedMotion: 'reduce' } });

    test('horizontal touch swipe on .studio-feature-frame toggles Glide <-> CrossLeads; vertical swipe does not', async ({ page, context }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const frame = page.locator('.studio-feature-frame');
        const box = await frame.boundingBox();
        const midY = box.y + box.height * 0.45;

        await expect(page.locator('#feature-tab-glide')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#feature-panel-glide')).toBeVisible();

        // Swipe left -> CrossLeads
        await dispatchTouchSwipe(page, context, {
            startX: box.x + box.width * 0.78,
            startY: midY,
            endX: box.x + box.width * 0.22,
            endY: midY + 6
        });
        await expect(page.locator('#feature-tab-freight')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#feature-panel-freight')).toBeVisible();

        // Mostly vertical swipe -> should NOT switch tab (and pan-y scrolling may shift frame position)
        await dispatchTouchSwipe(page, context, {
            startX: box.x + box.width * 0.5,
            startY: box.y + box.height * 0.75,
            endX: box.x + box.width * 0.5 + 12,
            endY: box.y + box.height * 0.2
        });
        await expect(page.locator('#feature-tab-freight')).toHaveAttribute('aria-selected', 'true');

        // Re-measure frame after pan-y scroll before swiping right -> Glide
        await frame.scrollIntoViewIfNeeded();
        const box2 = await frame.boundingBox();
        const midY2 = box2.y + box2.height * 0.45;
        await dispatchTouchSwipe(page, context, {
            startX: box2.x + box2.width * 0.22,
            startY: midY2,
            endX: box2.x + box2.width * 0.78,
            endY: midY2 - 4
        });
        await expect(page.locator('#feature-tab-glide')).toHaveAttribute('aria-selected', 'true');
        await expect(page.locator('#feature-panel-glide')).toBeVisible();
    });
});

test.describe('Mobile Product Viewer Bottom Sheet Ergonomics & Gestures', () => {
    for (const [vp, lang] of [
        [{ width: 390, height: 844 }, 'en'],
        [{ width: 320, height: 568 }, 'zh']
    ]) {
        test.describe(`${vp.width}x${vp.height} (${lang})`, () => {
            test.use({ viewport: vp, hasTouch: true, contextOptions: { reducedMotion: 'reduce' } });

            test('locks scroll & restores scrollY, prevents .gdraw-cue overlap, passes 44px/12px/contrast checks, supports .viewer-bar swipe-down without breaking canvas swipe or body scroll', async ({ page, context }) => {
                await page.goto(`/?lang=${lang}`);
                await waitForAppReady(page);

                const card = page.locator('#card-glide');
                await card.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
                const originY = await page.evaluate(() => window.scrollY);
                expect(originY).toBeGreaterThan(50);

                await card.click();
                const viewer = page.locator('dialog#project-viewer:modal');
                await expect(viewer).toBeVisible();

                // 1. Background scroll lock
                const lockCheck = await page.evaluate(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    window.scrollTo({ top: 900, behavior: 'instant' });
                    return {
                        lockedClass: document.documentElement.classList.contains('viewer-scroll-lock'),
                        bodyPos: getComputedStyle(document.body).position,
                        scrollYAfterAttempt: window.scrollY,
                        storedVar: document.documentElement.style.getPropertyValue('--viewer-scroll-y')
                    };
                });
                expect(lockCheck.lockedClass).toBe(true);
                expect(lockCheck.bodyPos).toBe('fixed');
                expect(lockCheck.scrollYAfterAttempt).toBe(0);
                expect(parseFloat(lockCheck.storedVar)).toBeCloseTo(originY, 0);

                // 2. .gdraw-cue does NOT overlap .gdraw-window, plus 44px controls, >=12px text, zero overflow, WCAG AA contrast
                const glideMetrics = await page.evaluate(vpWidth => {
                    const dialog = document.querySelector('dialog#project-viewer');
                    const dRect = dialog.getBoundingClientRect();
                    const winRect = dialog.querySelector('.gdraw-window').getBoundingClientRect();
                    const cueRect = dialog.querySelector('.gdraw-cue').getBoundingClientRect();
                    const overlapX = Math.min(winRect.right, cueRect.right) - Math.max(winRect.left, cueRect.left);
                    const overlapY = Math.min(winRect.bottom, cueRect.bottom) - Math.max(winRect.top, cueRect.top);

                    const controls = ['.viewer-close', '.viewer-switch', '.viewer-site', '.gdraw-reset', '[data-snap="max"]', '[data-snap="left"]', '[data-snap="right"]'];
                    const smallControls = [];
                    for (const sel of controls) {
                        const el = dialog.querySelector(sel);
                        if (!el) continue;
                        const r = el.getBoundingClientRect();
                        if (r.height < 43.9 || r.width < 43.9) {
                            smallControls.push({ sel, width: Number(r.width.toFixed(1)), height: Number(r.height.toFixed(1)) });
                        }
                    }

                    const smallText = [];
                    const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
                    let n;
                    while ((n = walker.nextNode())) {
                        if (!(n.nodeValue || '').trim()) continue;
                        const el = n.parentElement;
                        if (!el || el.closest('[hidden], template, .gdraw-window')) continue;
                        const st = getComputedStyle(el);
                        if (st.display === 'none' || st.visibility === 'hidden') continue;
                        const r = el.getBoundingClientRect();
                        if (r.width <= 1 || r.height <= 1) continue;
                        const fs = parseFloat(st.fontSize);
                        if (fs < 11.9) smallText.push({ cls: el.className, text: n.nodeValue.trim().slice(0, 24), fs });
                    }

                    const smallInputs = [...dialog.querySelectorAll('input, select, textarea')]
                        .filter(el => !el.closest('[hidden]') && getComputedStyle(el).display !== 'none')
                        .map(el => ({ tag: el.tagName, fs: parseFloat(getComputedStyle(el).fontSize) }))
                        .filter(x => x.fs < 15.9);

                    return {
                        dialogRight: Number(dRect.right.toFixed(1)),
                        dialogOverflowX: dialog.scrollWidth > vpWidth + 1,
                        cueOverlapsWindow: overlapX > 1 && overlapY > 1,
                        winBottom: Number(winRect.bottom.toFixed(1)),
                        cueTop: Number(cueRect.top.toFixed(1)),
                        smallControls,
                        smallText,
                        smallInputs
                    };
                }, vp.width);

                expect(glideMetrics.dialogOverflowX, 'viewer horizontal overflow').toBe(false);
                expect(glideMetrics.dialogRight).toBeLessThanOrEqual(vp.width + 1);
                expect(glideMetrics.cueOverlapsWindow, `.gdraw-cue (top=${glideMetrics.cueTop}) must not overlap .gdraw-window (bottom=${glideMetrics.winBottom})`).toBe(false);
                expect(glideMetrics.smallControls, `small Glide viewer controls: ${JSON.stringify(glideMetrics.smallControls)}`).toEqual([]);
                expect(glideMetrics.smallText, `sub-12px Glide viewer text: ${JSON.stringify(glideMetrics.smallText)}`).toEqual([]);
                expect(glideMetrics.smallInputs).toEqual([]);
                expect(await collectContrastViolations(page, '#project-viewer'), 'Glide mobile viewer contrast').toEqual([]);

                // 3. Single-finger upward swipe on Glide canvas STILL works inside mobile bottom sheet
                const canvas = viewer.locator('[data-glide-draw] canvas');
                await canvas.scrollIntoViewIfNeeded();
                const cBox = await canvas.boundingBox();
                await dispatchTouchSwipe(page, context, {
                    startX: cBox.x + cBox.width / 2,
                    startY: cBox.y + cBox.height * 0.8,
                    endX: cBox.x + cBox.width / 2,
                    endY: cBox.y + cBox.height * 0.25,
                    steps: 6
                });
                await expect(viewer.locator('[data-glide-draw]')).toHaveAttribute('data-side', 'max');
                await expect(viewer).toBeVisible();
                await viewer.locator('[data-reset]').click();

                // 4. Switch to CrossLeads, verify 44px targets (tabs, product chips, save, pool remove, empty find), zero overflow & contrast
                await viewer.locator('.viewer-switch').click();
                const freight = viewer.locator('[data-freight-demo]');
                await expect(freight).toBeVisible();
                await freight.locator('[data-freight-save]').click();
                await freight.locator('#freight-pool-tab').click();

                const freightMetrics = await page.evaluate(vpWidth => {
                    const dialog = document.querySelector('dialog#project-viewer');
                    const selectors = [
                        '#freight-search-tab',
                        '#freight-pool-tab',
                        '.freight-pool-remove'
                    ];
                    const small = [];
                    for (const sel of selectors) {
                        const el = dialog.querySelector(sel);
                        if (!el) continue;
                        const r = el.getBoundingClientRect();
                        if (r.height < 43.9 || r.width < 43.9) {
                            small.push({ sel, width: Number(r.width.toFixed(1)), height: Number(r.height.toFixed(1)) });
                        }
                    }
                    const smallText = [];
                    const walker = document.createTreeWalker(dialog.querySelector('[data-freight-demo]'), NodeFilter.SHOW_TEXT);
                    let n;
                    while ((n = walker.nextNode())) {
                        if (!(n.nodeValue || '').trim()) continue;
                        const el = n.parentElement;
                        if (!el || el.closest('[hidden], template')) continue;
                        const st = getComputedStyle(el);
                        if (st.display === 'none' || st.visibility === 'hidden') continue;
                        const r = el.getBoundingClientRect();
                        if (r.width <= 1 || r.height <= 1) continue;
                        const fs = parseFloat(st.fontSize);
                        if (fs < 11.9) smallText.push({ cls: el.className, text: n.nodeValue.trim().slice(0, 24), fs });
                    }
                    return { overflowX: dialog.scrollWidth > vpWidth + 1, small, smallText };
                }, vp.width);

                expect(freightMetrics.overflowX, 'CrossLeads viewer overflow').toBe(false);
                expect(freightMetrics.small, `small CrossLeads controls: ${JSON.stringify(freightMetrics.small)}`).toEqual([]);
                expect(freightMetrics.smallText, `sub-12px CrossLeads text: ${JSON.stringify(freightMetrics.smallText)}`).toEqual([]);
                expect(await collectContrastViolations(page, '#project-viewer'), 'CrossLeads mobile viewer contrast').toEqual([]);

                // Verify search-view buttons & empty-state find button are >= 44px too
                await freight.locator('.freight-pool-remove').click();
                const findBtnBox = await freight.locator('[data-freight-find]').boundingBox();
                expect(findBtnBox.height).toBeGreaterThanOrEqual(43.9);
                expect(findBtnBox.width).toBeGreaterThanOrEqual(43.9);

                await freight.locator('[data-freight-find]').click();
                for (const sel of ['[data-freight-key="bikes"]', '[data-freight-key="filters"]', '[data-freight-save]']) {
                    const b = await freight.locator(sel).boundingBox();
                    expect(b.height, `${sel} height >= 44px`).toBeGreaterThanOrEqual(43.9);
                    expect(b.width, `${sel} width >= 44px`).toBeGreaterThanOrEqual(43.9);
                }

                // 5. Verify .viewer-body scrolls independently when expanded
                await viewer.locator('.viewer-detail > summary').click();
                const bodyScrollable = await viewer.locator('.viewer-body').evaluate(el => {
                    el.scrollTop = 0;
                    const before = el.scrollTop;
                    el.scrollTop = 120;
                    const after = el.scrollTop;
                    el.scrollTop = 0;
                    return { scrollHeight: el.scrollHeight, clientHeight: el.clientHeight, before, after, moved: after > before };
                });
                if (bodyScrollable.scrollHeight > bodyScrollable.clientHeight + 4) {
                    expect(bodyScrollable.moved, '.viewer-body must scroll independently').toBe(true);
                }

                // 6. Small swipe-down on .viewer-bar springs back; >80px swipe-down dismisses & restores scrollY
                const barBox = await viewer.locator('.viewer-bar').boundingBox();
                const dragX = barBox.x + 28;
                const dragY = barBox.y + barBox.height / 2;

                await dispatchTouchSwipe(page, context, {
                    startX: dragX,
                    startY: dragY,
                    endX: dragX,
                    endY: dragY + 36,
                    steps: 5
                });
                await expect(viewer).toBeVisible();
                await expect.poll(() => viewer.evaluate(el => getComputedStyle(el).transform)).toBe('none');

                await dispatchTouchSwipe(page, context, {
                    startX: dragX,
                    startY: dragY,
                    endX: dragX,
                    endY: dragY + 130,
                    steps: 8
                });
                await expect(viewer).toHaveCount(0);
                expect(await page.evaluate(() => document.documentElement.classList.contains('viewer-scroll-lock'))).toBe(false);
                await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(originY, 0);
            });
        });
    }
});

test.describe('Mobile Casebook Sticky Jumps, Range Target & Post-Interaction Ergonomics', () => {
    for (const [vp, lang] of [
        [{ width: 320, height: 568 }, 'zh'],
        [{ width: 320, height: 568 }, 'en'],
        [{ width: 390, height: 844 }, 'en']
    ]) {
        test.describe(`${vp.width}x${vp.height} (${lang})`, () => {
            test.use({ viewport: vp, contextOptions: { reducedMotion: 'reduce' } });

            test('sticky .case-jumps stays below header, updates data-active/data-updated, and all 4 labs stay >=16px select / >=44px controls / zero overflow / WCAG AA after interaction', async ({ page }) => {
                await page.goto(`/?lang=${lang}#case-studies`);
                await waitForAppReady(page);

                // Report lab: source interaction sets data-updated on inspect jump; inspect click clears it & scrolls below header
                const reportLab = page.locator('#case-studies article[data-case-kind="report"]');
                await reportLab.locator('[data-case-action="source"][data-value="latest"]').click();
                const inspectJump = reportLab.locator('[data-case-jump="inspect"]');
                const sourceJump = reportLab.locator('[data-case-jump="source"]');
                await expect(inspectJump).toHaveAttribute('data-updated', 'true');

                await inspectJump.click();
                await expect(inspectJump).not.toHaveAttribute('data-updated', 'true');
                await expect(inspectJump).toHaveAttribute('data-active', 'true');

                // Verify sticky .case-jumps sits cleanly below .studio-header (no overlap)
                const stickyCheck = await page.evaluate(() => {
                    const header = document.querySelector('.studio-header').getBoundingClientRect();
                    const jumps = document.querySelector('#case-studies article:not([hidden]) .case-jumps').getBoundingClientRect();
                    return { headerBottom: Number(header.bottom.toFixed(1)), jumpsTop: Number(jumps.top.toFixed(1)), jumpsHeight: Number(jumps.height.toFixed(1)) };
                });
                expect(stickyCheck.jumpsTop, '.case-jumps must pin cleanly below .studio-header').toBeGreaterThanOrEqual(stickyCheck.headerBottom - 1);

                // Trigger a verdict in report lab and check contrast & overflow
                await reportLab.locator('[data-case-action="cite"]').click();
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
                expect(await collectContrastViolations(page, '#case-studies article[data-case-kind="report"]'), 'report lab contrast').toEqual([]);
                await expect(sourceJump).toBeVisible();

                // Scan lab: range slider >= 44px tall, changing boundary marks inspect updated, zero overflow & WCAG AA after export
                await page.locator('#case-studies nav a[data-case-link="scan"]').click();
                const scanLab = page.locator('#case-studies article[data-case-kind="scan"]');
                const rangeInput = scanLab.locator('input[type="range"][data-case-change="boundary"]');
                const rangeBox = await rangeInput.boundingBox();
                expect(rangeBox.height, 'scan boundary range touch height >= 44px').toBeGreaterThanOrEqual(43.9);
                await rangeInput.focus();
                for (let i = 0; i < 5; i++) await rangeInput.press('ArrowRight');
                await expect(scanLab.locator('[data-case-jump="inspect"]')).toHaveAttribute('data-updated', 'true');
                await scanLab.locator('[data-case-action="check"]').click();
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
                expect(await collectContrastViolations(page, '#case-studies article[data-case-kind="scan"]'), 'scan lab contrast').toEqual([]);

                // Ledger lab: select >= 16px & >= 44px, order switch + verify + audit trail zero overflow & contrast
                await page.locator('#case-studies nav a[data-case-link="ledger"]').click();
                const ledgerLab = page.locator('#case-studies article[data-case-kind="ledger"]');
                await ledgerLab.locator('[data-case-action="order"][data-value="B"]').click();
                await ledgerLab.locator('[data-case-action="request"]').click();
                const proofSelect = ledgerLab.locator('[data-case-change="proof"]');
                const proofStyle = await proofSelect.evaluate(el => ({
                    fs: parseFloat(getComputedStyle(el).fontSize),
                    height: el.getBoundingClientRect().height
                }));
                expect(proofStyle.fs, 'ledger select font-size >= 16px').toBeGreaterThanOrEqual(15.9);
                expect(proofStyle.height, 'ledger select height >= 44px').toBeGreaterThanOrEqual(43.9);
                await proofSelect.selectOption('B');
                await ledgerLab.locator('[data-case-action="attach"]').click();
                await ledgerLab.locator('[data-case-action="verify"]').click();
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
                expect(await collectContrastViolations(page, '#case-studies article[data-case-kind="ledger"]'), 'ledger lab contrast').toEqual([]);

                // Tools lab: mode/history selects >= 16px & >= 44px, trace summary >= 44px, stacked trace zero overflow & contrast
                await page.locator('#case-studies nav a[data-case-link="tools"]').click();
                const toolsLab = page.locator('#case-studies article[data-case-kind="tools"]');
                const modeSelect = toolsLab.locator('[data-case-change="tools-mode"]');
                const modeStyle = await modeSelect.evaluate(el => ({
                    fs: parseFloat(getComputedStyle(el).fontSize),
                    height: el.getBoundingClientRect().height
                }));
                expect(modeStyle.fs, 'tools select font-size >= 16px').toBeGreaterThanOrEqual(15.9);
                expect(modeStyle.height, 'tools select height >= 44px').toBeGreaterThanOrEqual(43.9);
                await toolsLab.locator('[data-case-action="tools-run"]').click();
                await modeSelect.selectOption('trim');
                await toolsLab.locator('[data-case-action="tools-run"]').click();
                const traceSummary = toolsLab.locator('.tools-trace > summary');
                expect((await traceSummary.boundingBox()).height).toBeGreaterThanOrEqual(43.9);
                await traceSummary.click();
                expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
                expect(await collectContrastViolations(page, '#case-studies article[data-case-kind="tools"]'), 'tools lab contrast').toEqual([]);
            });
        });
    }
});

test.describe('Mobile Contact Form Error & Retry Ergonomics (390x844)', () => {
    test.use({ viewport: { width: 390, height: 844 }, contextOptions: { reducedMotion: 'reduce' } });

    for (const [lang, expectedRetry] of [['zh', '重试发送'], ['en', 'Try again']]) {
        test(`${lang}: failed submit renders accessible >=44px retry button that succeeds on retry`, async ({ page }) => {
            let attempt = 0;
            await page.route('**/*', async route => {
                if (route.request().method() === 'POST') {
                    attempt += 1;
                    if (attempt === 1) {
                        await route.fulfill({ status: 500, json: { code: 500, msg: 'error' } });
                    } else {
                        await route.fulfill({ status: 200, json: { code: 0 } });
                    }
                } else {
                    await route.continue();
                }
            });

            await page.goto(`/?lang=${lang}#contact`);
            await waitForAppReady(page);

            const form = page.locator('#contact form');
            await form.locator('#contact-name').fill('Alex');
            await form.locator('#contact-info').fill('alex@example.invalid');
            await form.locator('#contact-topic').fill('Mobile QA');
            await form.locator('#contact-message').fill('Testing retry feedback on phone.');
            await form.locator('button[type="submit"]').click();

            const retryBtn = form.locator('.contact-retry-btn');
            await expect(retryBtn).toBeVisible();
            await expect(retryBtn).toHaveText(expectedRetry);
            const retryBox = await retryBtn.boundingBox();
            expect(retryBox.height).toBeGreaterThanOrEqual(43.9);
            expect(retryBox.width).toBeGreaterThanOrEqual(43.9);
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
            expect(await collectContrastViolations(page, '#contact'), 'contact error state contrast').toEqual([]);

            await retryBtn.click();
            await expect(retryBtn).toHaveCount(0);
            await expect(form.locator('.form-feedback')).toHaveClass(/success/);
            expect(attempt).toBe(2);
        });
    }
});
