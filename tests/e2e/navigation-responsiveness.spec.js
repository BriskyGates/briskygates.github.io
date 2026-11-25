const { test, expect } = require('@playwright/test');

for (const [width, nav] of [[390, '.mobile-bottom-nav'], [1440, '.sidebar-nav']]) {
    test.describe(`正式首页导航 · ${width}px`, () => {
        test.use({ viewport: { width, height: 860 } });

        test('四个章节均可访问，滚动位置与当前导航一致', async ({ page }) => {
            await page.goto('/');
            await page.locator('#app[data-v-app]').waitFor();
            for (const id of ['showcase', 'case-studies', 'studio-library', 'contact']) {
                const link = page.locator(`${nav} a[href="#${id}"]`);
                await link.click();
                await expect(link).toHaveAttribute('aria-current', 'location');
                await expect(page).toHaveURL(new RegExp('#' + id + '$'));
                await expect.poll(() => page.locator('#' + id).evaluate(el => {
                    const top = el.getBoundingClientRect().top;
                    return top < innerHeight / 2 && top >= -4;
                })).toBe(true);
                await expect(link).toHaveClass(/active/);
            }
            await page.locator('.studio-brand').click();
            await expect(page).toHaveURL(/#home$/);
        });

        test('旧版业务流链接展开对应资料，浏览器后退回到案例', async ({ page }) => {
            await page.goto('/#case-studies');
            await page.locator('#app[data-v-app]').waitFor();
            await page.locator('#case-fastapi_celery_kb .casebook-related').click();
            await expect(page).toHaveURL(/#flow-rag$/);
            await expect(page.locator('#workflows')).toHaveAttribute('open', '');
            await expect(page.locator('#flow-rag')).toBeInViewport();
            await expect(page.locator(nav + ' a[href="#studio-library"]')).toHaveClass(/active/);
            await page.goBack();
            await expect(page.locator('#casebook-heading')).toBeInViewport();
        });

        test('滚动到页面底部时选中联系项', async ({ page }) => {
            await page.goto('/');
            await page.locator('#app[data-v-app]').waitFor();
            await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
            await expect(page.locator(nav + ' a[href="#contact"]')).toHaveClass(/active/);
        });
    });
}
