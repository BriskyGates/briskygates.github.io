const { test, expect } = require('@playwright/test');

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const el = document.querySelector('.hero-title') || document.querySelector('.plain-brief-section');
        return el && el.textContent.length > 2 && !el.textContent.includes('{{');
    });
}

test.describe('自研上线软件小栏位展示与跳转链接测试', () => {
    test('主页展示 Glide 与 CrossLeads 搜买家卡片，且外链与新窗口属性正确', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const productsCard = page.locator('.bento-card--products');
        await expect(productsCard).toBeVisible();

        const productTiles = page.locator('.bento-product-tile');
        await expect(productTiles).toHaveCount(2);

        // 验证 Glide
        const glideTile = productTiles.nth(0);
        await expect(glideTile.locator('.bento-product-name')).toHaveText('Glide');
        const glideLink = glideTile.locator('a.bento-product-link');
        await expect(glideLink).toHaveAttribute('href', 'https://www.glide-ai.fun/');
        await expect(glideLink).toHaveAttribute('target', '_blank');
        await expect(glideLink).toHaveAttribute('rel', 'noopener noreferrer');

        // 验证 CrossLeads 搜买家
        const crossleadsTile = productTiles.nth(1);
        await expect(crossleadsTile.locator('.bento-product-name')).toContainText('搜买家');
        const crossleadsLink = crossleadsTile.locator('a.bento-product-link');
        await expect(crossleadsLink).toHaveAttribute('href', 'https://app.soumaijia.cn/');
        await expect(crossleadsLink).toHaveAttribute('target', '_blank');
        await expect(crossleadsLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('英文语言下卡片同步切换为英文说明', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForAppReady(page);

        const productTiles = page.locator('.bento-product-tile');
        await expect(productTiles).toHaveCount(2);

        const glideTile = productTiles.nth(0);
        await expect(glideTile.locator('.bento-product-subtitle')).toContainText(/Gestures|Copilot/i);

        const crossleadsTile = productTiles.nth(1);
        await expect(crossleadsTile.locator('.bento-product-subtitle')).toContainText(/Global Trade|Lead Generation/i);
    });
});
