const { test, expect } = require('@playwright/test');

async function waitForAppReady(page) {
    await page.waitForFunction(() => {
        const title = document.querySelector('#profile .section-title');
        return title && !title.textContent.includes('{{');
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

    await expect(page.locator('#profile .section-title')).toContainText('关于我');
    await expect(page.locator('#langToggle .lang-text')).toHaveText('EN');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    await expect(page).toHaveTitle(/阿布的个人主页/);
});

test('点击 EN 按钮切换到英文', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('#langToggle').click();
    await waitForAppReady(page);

    await expect(page.locator('#profile .section-title')).toContainText('About Me');
    await expect(page.locator('#langToggle .lang-text')).toHaveText('中文');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/Abu's Personal Homepage/);
    await expect(page).toHaveURL(/lang=en/);
    await expect(page.locator('.project-highlights h4').first()).toHaveText('Highlights:');
});

test('英文模式下点击中文按钮切回中文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('#profile .section-title')).toContainText('About Me');

    await page.locator('#langToggle').click();
    await waitForAppReady(page);

    await expect(page.locator('#profile .section-title')).toContainText('关于我');
    await expect(page.locator('#langToggle .lang-text')).toHaveText('EN');
    await expect(page).toHaveURL(/lang=zh/);
    await expect(page.locator('.project-highlights h4').first()).toHaveText('亮点：');
});

test('URL 参数 lang=en 直接加载英文', async ({ page }) => {
    await page.goto('/?lang=en');
    await waitForAppReady(page);

    await expect(page.locator('#profile .section-title')).toContainText('About Me');
    await expect(page.locator('#langToggle .lang-text')).toHaveText('中文');
});

test('localStorage 语言偏好在无 URL 参数时生效', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('preferredLanguage', 'en');
    });

    await page.goto('/');
    await waitForAppReady(page);

    await expect(page.locator('#profile .section-title')).toContainText('About Me');
});

test('浏览器后退应同步页面语言', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('#langToggle').click();
    await waitForAppReady(page);
    await expect(page.locator('#profile .section-title')).toContainText('About Me');

    await page.goBack();
    await waitForAppReady(page);
    await expect(page.locator('#profile .section-title')).toContainText('关于我');
    await expect(page.locator('#langToggle .lang-text')).toHaveText('EN');
});
