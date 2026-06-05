const { test, expect } = require('@playwright/test');

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const title = document.querySelector('.hero-title');
        return title && title.textContent.length > 4 && !title.textContent.includes('{{');
    });
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.removeItem('preferredLanguage');
    });
});

test('默认加载中文内容并显示 EN 切换按钮', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/EN/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page).toHaveTitle(/阿布/);
});

test('点击 EN 按钮切换到英文', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Engineering AI/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/中文/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveURL(/lang=en/);
});

test('英文模式下点击中文按钮切回中文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Engineering AI/i);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).not.toContainText(/Engineering AI into products/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/EN/);
    await expect(page).toHaveURL(/lang=zh/);
});

test('URL 参数 lang=en 直接加载英文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Engineering AI/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/中文/);
});

test('localStorage 语言偏好在无 URL 参数时生效', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('preferredLanguage', 'en');
    });

    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Engineering AI/i);
});

test('浏览器后退应同步页面语言', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);
    await expect(page.locator('.hero-title')).toContainText(/Engineering AI/i);

    await page.goBack();
    await waitForAppReady(page);
    await expect(page.locator('.hero-title')).not.toContainText(/Engineering AI into products/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/EN/);
});
