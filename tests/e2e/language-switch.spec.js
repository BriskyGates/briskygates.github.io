const { test, expect } = require('@playwright/test');

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const title = document.querySelector('.hero-title');
        return title && title.textContent.length > 4 && !title.textContent.includes('{{');
    });
}

async function openLangMenu(page) {
    await page.locator('.sidebar-footer .lang-btn').click();
    await expect(page.locator('.sidebar-footer .lang-menu')).toBeVisible();
}

async function selectLanguage(page, label) {
    await openLangMenu(page);
    await page.locator('.sidebar-footer .lang-menu__item', { hasText: label }).click();
    await waitForAppReady(page);
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.removeItem('preferredLanguage');
    });
});

test('默认加载简体中文并显示语言下拉', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('简体中文');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page).toHaveTitle(/阿布/);
});

test('下拉列表可选择繁体中文', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await selectLanguage(page, '繁體中文');

    await expect(page.locator('.hero-title')).toContainText(/生產力/);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('繁體中文');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    await expect(page).toHaveURL(/lang=zh-Hant/);
});

test('下拉列表可选择大白话', async ({ page }) => {
    await page.goto('/?lang=zh-Hant');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/生產力/);

    await selectLanguage(page, '大白话');

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('大白话');
    await expect(page).toHaveURL(/lang=plain/);
});

test('下拉列表可选择英文', async ({ page }) => {
    await page.goto('/?lang=plain');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);

    await selectLanguage(page, 'English');

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('English');
    await expect(page).toHaveURL(/lang=en/);
});

test('下拉列表可切回简体中文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);

    await selectLanguage(page, '简体中文');

    await expect(page.locator('.hero-title')).not.toContainText(/Production Power/i);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('简体中文');
    await expect(page).toHaveURL(/lang=zh/);
});

test('URL 参数 lang=en 直接加载英文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/Production Power/i);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('English');
});

test('URL 参数 lang=plain 直接加载大白话', async ({ page }) => {
    await page.goto('/?lang=plain');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/不只是做演示/);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('大白话');
});

test('URL 参数 lang=zh-Hant 直接加载繁体中文', async ({ page }) => {
    await page.goto('/?lang=zh-Hant');
    await waitForAppReady(page);

    await expect(page.locator('.hero-title')).toContainText(/生產力/);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('繁體中文');
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

    await selectLanguage(page, '繁體中文');
    await expect(page.locator('.hero-title')).toContainText(/生產力/);

    await page.goBack();
    await waitForAppReady(page);
    await expect(page.locator('.hero-title')).not.toContainText(/生產力/);
    await expect(page.locator('.lang-dropdown .lang-btn').first()).toContainText('简体中文');
});

test('当前语言在菜单中显示勾选状态', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await openLangMenu(page);

    const activeItem = page.locator('.sidebar-footer .lang-menu__item--active');
    await expect(activeItem).toHaveCount(1);
    await expect(activeItem).toContainText('简体中文');
    await expect(activeItem.locator('.lang-menu__check')).toBeVisible();
});
