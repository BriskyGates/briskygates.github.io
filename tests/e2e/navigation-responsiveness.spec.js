const { test, expect } = require('@playwright/test');

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const title = document.querySelector('.hero-title');
        return title && title.textContent.length > 4 && !title.textContent.includes('{{');
    });
}

test.describe('移动端导航栏跟手性与交互测试', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('移动端点击各导航项均能准确高亮且无回退', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const navItems = [
            { id: 'showcase', label: '作品' },
            { id: 'flow-rag', label: '业务流' },
            { id: 'experience', label: '履历' },
            { id: 'skills', label: '技能' },
            { id: 'services', label: '服务' },
            { id: 'contact', label: '联系' },
            { id: 'home', label: '首页' }
        ];

        for (const item of navItems) {
            const navLink = page.locator(`.mobile-bottom-nav .mobile-nav-item[href="#${item.id}"]`);
            await navLink.click();
            await page.waitForTimeout(600);
            await expect(navLink).toHaveClass(/active/);
        }
    });

    test('页面自然滚动到底部时联系模块自动高亮', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        });
        await page.waitForTimeout(300);

        const contactLink = page.locator('.mobile-bottom-nav .mobile-nav-item[href="#contact"]');
        await expect(contactLink).toHaveClass(/active/);
    });

    test('点击 Hero 业务流诊断卡能正确联动到业务流导航', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const heroFlowEntries = page.locator('.hero-flow-entry');
        const count = await heroFlowEntries.count();
        expect(count).toBeGreaterThan(0);

        await heroFlowEntries.first().click();
        await page.waitForTimeout(600);

        const flowNav = page.locator('.mobile-bottom-nav .mobile-nav-item[href="#flow-rag"]');
        await expect(flowNav).toHaveClass(/active/);
        await expect(page.locator('.top-bar-brand strong')).toHaveText('业务流');
    });
});

test.describe('桌面端导航栏跟手性与交互测试', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('桌面端点击各导航项均能精准高亮对应项', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        const navItems = ['showcase', 'flow-rag', 'experience', 'skills', 'services', 'contact', 'home'];

        for (const id of navItems) {
            const navLink = page.locator(`.sidebar-nav .nav-item[href="#${id}"]`);
            await navLink.click();
            await page.waitForTimeout(600);
            await expect(navLink).toHaveClass(/active/);
        }
    });

    test('桌面端自然滚动到底部时激活联系项', async ({ page }) => {
        await page.goto('/');
        await waitForAppReady(page);

        await page.evaluate(() => {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
        });
        await page.waitForTimeout(300);

        const contactLink = page.locator(`.sidebar-nav .nav-item[href="#contact"]`);
        await expect(contactLink).toHaveClass(/active/);
    });
});
