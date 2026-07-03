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

test('默认加载简体中文并显示繁體切换按钮', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/繁體/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page).toHaveTitle(/阿布/);
});

test('点击繁體按钮切换到繁体中文', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/生產力/);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/白话/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await expect(page).toHaveURL(/lang=zh-Hant/);
});

test('繁体模式下点击白话切换到大白话', async ({ page }) => {
    await page.goto('/?lang=zh-Hant');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/生產力/);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/EN/);
    await expect(page).toHaveURL(/lang=plain/);
});

test('大白话模式下点击 EN 切换到英文', async ({ page }) => {
    await page.goto('/?lang=plain');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/中文/);
    await expect(page).toHaveURL(/lang=en/);
});

test('英文模式下点击中文按钮切回简体中文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).not.toContainText(/Production Power/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/繁體/);
    await expect(page).toHaveURL(/lang=zh/);
});

test('URL 参数 lang=en 直接加载英文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/中文/);
});

test('URL 参数 lang=plain 直接加载大白话', async ({ page }) => {
    await page.goto('/?lang=plain');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/EN/);
});

test('URL 参数 lang=zh-Hant 直接加载繁体中文', async ({ page }) => {
    await page.goto('/?lang=zh-Hant');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/生產力/);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/白话/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
});

test('localStorage 语言偏好在无 URL 参数时生效', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('preferredLanguage', 'en');
    });

    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);
});

test('浏览器后退应同步页面语言', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('.sidebar-footer .lang-btn').click();
    await waitForAppReady(page);
    await expect(page.locator('.hero-title')).toContainText(/生產力/);

    await page.goBack();
    await waitForAppReady(page);
    await expect(page.locator('.hero-title')).not.toContainText(/生產力/);
    await expect(page.locator('.sidebar-footer .lang-btn')).toHaveText(/繁體/);
});
