const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

async function openGlide(page) {
    await page.goto('/');
    const launcher = page.locator('#launch-glide');
    await expect(launcher).toHaveAttribute('aria-haspopup', 'dialog');
    await launcher.click();
    const viewer = page.locator('dialog.project-viewer:modal');
    const demo = viewer.locator('[data-glide-draw]');
    await expect(demo).toBeVisible();
    return demo;
}

async function waitForViewerReturn(page, action) {
    // A history traversal dispatches popstate before hashchange. Check the final position after both routers have run.
    const settled = page.evaluate(() => new Promise(resolve => {
        window.addEventListener('hashchange', () => requestAnimationFrame(() => requestAnimationFrame(resolve)), { once: true });
    }));
    await action();
    await settled;
}

async function canvasGeometry(demo) {
    const canvas = demo.locator('canvas');
    await canvas.scrollIntoViewIfNeeded();
    const area = await canvas.boundingBox();
    return {
        x: Math.round(area.x + area.width / 2),
        startY: Math.round(area.y + area.height * 0.8),
        turnY: Math.round(area.y + area.height * 0.35),
        topEdge: Math.floor(area.y) - 5,
        turnDistance: Math.round(area.width * 0.25)
    };
}

async function expectWindow(demo, side) {
    await expect(demo).toHaveAttribute('data-side', side);
    await expect(demo.locator('[data-snap][aria-pressed="true"]')).toHaveCount(1);
    await expect(demo.locator(`[data-snap="${side}"]`)).toHaveAttribute('aria-pressed', 'true');
    const position = await demo.locator('.gdraw-window').evaluate(windowElement => {
        const pad = windowElement.closest('[data-pad]').getBoundingClientRect();
        const rect = windowElement.getBoundingClientRect();
        if (rect.width > pad.width * 0.8) return 'max';
        return rect.left + rect.width / 2 < pad.left + pad.width / 2 ? 'left' : 'right';
    });
    expect(position).toBe(side);
}

test('鼠标真实笔画区分上划与折线，释放后才提交动作', async ({ page }) => {
    const demo = await openGlide(page);
    const { x, startY, turnY, turnDistance } = await canvasGeometry(demo);
    const initialWindow = await demo.locator('.gdraw-window').boundingBox();
    for (const [side, offset] of [['left', -turnDistance], ['right', turnDistance], ['max', 0]]) {
        await page.mouse.move(x, startY);
        await page.mouse.down({ button: 'right' });
        await page.mouse.move(x, turnY, { steps: 5 });
        if (offset) await page.mouse.move(x + offset, turnY, { steps: 5 });
        await expect(demo).toHaveAttribute('data-preview', side);
        await expect(demo).not.toHaveAttribute('data-side', side);
        await page.mouse.up({ button: 'right' });
        await expectWindow(demo, side);
    }
    await demo.locator('[data-reset]').click();
    await expect(demo.locator('[data-snap][aria-pressed="true"]')).toHaveCount(0);
    const restored = await demo.locator('.gdraw-window').boundingBox();
    expect(restored.width).toBeCloseTo(initialWindow.width);
    expect(restored.x).toBeCloseTo(initialWindow.x);
});

test('上划超过画布上沿再释放也能最大化', async ({ page }) => {
    const demo = await openGlide(page);
    const { x, startY, topEdge } = await canvasGeometry(demo);
    await page.mouse.move(x, startY);
    await page.mouse.down();
    await page.mouse.move(x, topEdge, { steps: 8 });
    await page.mouse.up();
    await expectWindow(demo, 'max');
});

test.describe('手机画板', () => {
    test.use({ hasTouch: true, viewport: { width: 375, height: 812 } });

    test('单指上划最大化', async ({ page, context }) => {
        const demo = await openGlide(page);
        const { x, startY, turnY } = await canvasGeometry(demo);
        const touch = await context.newCDPSession(page);
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: turnY }] });
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expectWindow(demo, 'max');
    });
});

test('连续纵向滚动兼容两种方向，保留画板外滚动与 Ctrl 缩放', async ({ page }) => {
    const demo = await openGlide(page);
    const { x, turnY } = await canvasGeometry(demo);
    for (const direction of [1, -1]) {
        await page.mouse.move(x, turnY);
        for (let i = 0; i < 4; i++) await page.mouse.wheel(0, direction * 32);
        await expectWindow(demo, 'max');
        await demo.locator('[data-reset]').click();
    }

    // Chromium 的缩放 UI 不属于网页。保留实际收到的事件，检查分发完成后浏览器仍可执行默认动作。
    await page.evaluate(() => {
        window.addEventListener('wheel', event => { window.zoomWheel = event; }, { capture: true, passive: true, once: true });
    });
    await page.mouse.move(x, turnY);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -80);
    await page.keyboard.up('Control');
    await expect.poll(() => page.evaluate(() => window.zoomWheel?.ctrlKey)).toBe(true);
    expect(await page.evaluate(() => window.zoomWheel.defaultPrevented)).toBe(false);
    await expect(demo.locator('[data-snap][aria-pressed="true"]')).toHaveCount(0);

    // 缩短视口，确保鼠标滚动的目标是可溢出的面板，而非页面背景。
    await page.setViewportSize({ width: 640, height: 320 });
    const body = page.locator('.viewer-body');
    const scrollRoom = await body.evaluate(el => el.scrollHeight - el.clientHeight);
    expect(scrollRoom).toBeGreaterThan(0);
    await body.evaluate(el => { el.scrollTop = 0; });
    const outsideCanvas = await body.evaluate(el => {
        const box = el.getBoundingClientRect();
        for (let y = box.top + 3; y < box.bottom; y += 8) {
            const x = box.left + box.width / 2;
            const target = document.elementFromPoint(x, y);
            if (el.contains(target) && target.tagName !== 'CANVAS') return { x, y };
        }
        throw new Error('面板内未找到画板外的滚动位置');
    });
    const pageY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(outsideCanvas.x, outsideCanvas.y);
    await page.mouse.wheel(0, 180);
    await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageY);
});

for (const [width, height, project] of [[1440, 900, 'glide'], [375, 667, 'freight']]) {
    test.describe(`作品弹窗 · ${width}px`, () => {
        test.use({ viewport: { width, height } });
        const other = project === 'glide' ? 'freight' : 'glide';

        test('从作品卡试用、切换、返回和前进，保持原卡片位置', async ({ page }) => {
            const entryUrl = width === 1440 ? '/#showcase' : '/#work';
            await page.goto(entryUrl);
            const source = page.locator(`#card-${project}`);
            await expect(source).toHaveAttribute('aria-haspopup', 'dialog');
            await source.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
            const originY = await page.evaluate(() => window.scrollY);
            const viewer = page.locator('dialog.project-viewer:modal');

            await source.click();
            await expect(page).toHaveURL(`/#desk-${project}`);
            await expect(viewer.locator(`#demo-${project}`)).toBeVisible();
            if (width === 1440) {
                const lockedY = await page.evaluate(() => window.scrollY);
                const wheelDelivered = page.evaluate(() => new Promise(resolve => {
                    window.addEventListener('wheel', () => requestAnimationFrame(() => requestAnimationFrame(resolve)), { once: true, capture: true });
                }));
                await page.mouse.move(4, 4);
                await page.mouse.wheel(0, 180);
                await wheelDelivered;
                expect(await page.evaluate(() => window.scrollY)).toBe(lockedY);
            }
            await viewer.locator('.viewer-switch:visible').click();
            await expect(page).toHaveURL(`/#desk-${other}`);
            await expect(viewer.locator(`#demo-${other}`)).toBeVisible();

            // 两个作品共享本次打开的历史项，一次后退应回到最初的作品卡。
            await waitForViewerReturn(page, () => page.goBack());
            await expect(page).toHaveURL(entryUrl);
            await expect(viewer).toHaveCount(0);
            await expect(source).toBeFocused();
            await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(originY, 0);
            await page.goForward();
            await expect(viewer.locator(`#demo-${other}`)).toBeVisible();
            await waitForViewerReturn(page, () => page.keyboard.press('Escape'));
            await expect(viewer).toHaveCount(0);
            await expect(source).toBeFocused();
            await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(originY, 0);
        });

        test('深链接直接显示对应产品，关闭后聚焦可见的产品入口', async ({ page }) => {
            await page.goto(`/#desk-${project}`);
            const viewer = page.locator('dialog.project-viewer:modal');
            await expect(viewer.locator(`#demo-${project}`)).toBeVisible();
            const close = viewer.locator('.viewer-close');
            await expect(close).toBeFocused();
            await expect(viewer.locator('.viewer-body')).toHaveJSProperty('scrollTop', 0);
            await close.click();
            await expect(viewer).toHaveCount(0);
            // 首屏默认展示 Glide，搜买家的可见入口位于作品选集。
            const shortcut = page.locator(project === 'glide' ? '#launch-glide' : '#card-freight');
            await expect(shortcut).toBeFocused();
            await expect(shortcut).toBeInViewport();
            await page.keyboard.press('Enter');
            await expect(viewer.locator(`#demo-${project}`)).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(shortcut).toBeFocused();
        });
    });
}

test('首屏方向键切换到搜买家，进入体验后可返回同一入口', async ({ page }) => {
    await page.goto('/');
    const launcher = page.locator('#launch-freight');
    await expect(launcher).toHaveAttribute('aria-haspopup', 'dialog');
    await page.getByRole('tab', { name: 'Glide', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'CrossLeads', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(launcher).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(launcher).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/#desk-freight');
    await expect(page.locator('dialog:modal #demo-freight')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL('/');
    await expect(launcher).toBeFocused();
});

test('搜买家潜客池保留已选买家，逐条移出后显示空态', async ({ page }) => {
    await page.goto(`/#desk-freight`);
    const demo = page.locator('[data-freight-demo]');
    const count = demo.locator('[data-freight-count]');
    const buyerNames = [];
    for (const key of ['bikes', 'filters']) {
        await demo.locator(`[data-freight-key="${key}"]`).click();
        buyerNames.push(await demo.locator('[data-freight-name]').innerText());
        await demo.locator('[data-freight-save]').click();
    }
    await demo.locator('[data-freight-tab="pool"]').click();
    const names = demo.locator('[data-pool-name]');
    await expect(names).toHaveText(buyerNames);
    await expect(count).toHaveText('2');

    const switchProduct = page.locator('dialog:modal .viewer-switch');
    await switchProduct.click();
    await expect(page.locator('#demo-glide')).toBeVisible();
    await switchProduct.click();
    await expect(names).toHaveText(buyerNames);
    await demo.locator('[data-freight-remove="bikes"]').click();
    await expect(names).toHaveText([buyerNames[1]]);
    await expect(count).toHaveText('1');
    await demo.locator('[data-freight-remove="filters"]').click();
    await expect(names).toHaveCount(0);
    await expect(count).toHaveText('0');
    await expect(demo.locator('[data-freight-empty]')).toBeVisible();
});
