const { test, expect } = require('@playwright/test');

const versions = [
    ['zh', require('../../assets/data/homeConfig.json')],
    ['en', require('../../assets/data/homeConfig.en.json')],
    ['zh-Hant', require('../../assets/data/homeConfig.zh-Hant.json')],
    ['plain', require('../../assets/data/homeConfig.plain.json')],
    ['plain-en', require('../../assets/data/homeConfig.plain-en.json')],
    ['plain-Hant', require('../../assets/data/homeConfig.plain-Hant.json')]
];

async function openStory(page, lang) {
    await page.goto('/?lang=' + lang);
    await page.locator('#app[data-v-app]').waitFor();
    const entry = page.locator('#home a[href="#glide-delivery"]');
    await expect(entry).toBeVisible();
    await entry.click();
    await expect(page).toHaveURL(/#glide-delivery$/);
    return page.locator('#glide-delivery');
}

for (const [lang, config] of versions) {
    test(`${lang}: homepage opens the published Glide case and its source links`, async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const story = await openStory(page, lang);
        await expect(story.locator('h2')).toBeInViewport();
        await expect(story).toContainText('1.1.8');
        const hrefs = await story.locator('a[href]').evaluateAll(links => links.map(link => link.href));
        for (const source of [
            /^https:\/\/(www\.)?v2ex\.com\/t\/1244175(?:[?#].*)?$/i,
            /^https:\/\/(www\.)?glide-ai\.fun\/#changelog$/i,
            /^https:\/\/(www\.)?glide-ai\.fun\/downloads\/Glide_v1\.1\.8_arm64\.dmg\.sha256$/
        ]) {
            expect(hrefs.some(href => source.test(href)), `missing public evidence ${source}`).toBe(true);
        }
        for (const icon of ['💬', '📦']) {
            await expect(story.locator(`a[data-delivery-route="${icon}"]`)).toHaveAttribute('href', '#contact');
        }
        await expect(page).toHaveTitle(config.ui.pageTitle);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
}

const draft = {
    name: 'Demo',
    info: 'example@example.invalid',
    topic: 'A draft about window gestures',
    message: 'My own description of the input problem.'
};

async function assertDraft(page) {
    for (const [id, value] of Object.entries(draft)) {
        await expect(page.locator('#contact-' + id)).toHaveValue(value);
    }
}

for (const [lang, config] of versions.filter(([id]) => ['zh', 'plain-en'].includes(id))) {
    test(`${lang}: change or remove a service without losing the draft, then submit its selected context`, async ({ page }) => {
        await page.setViewportSize({ width: lang === 'zh' ? 1280 : 320, height: 760 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const payloads = [];
        await page.route('**/*', async route => {
            if (route.request().method() === 'POST') {
                payloads.push(route.request().postDataJSON());
                await route.fulfill({ json: { code: 0 } });
            } else {
                await route.continue();
            }
        });

        const story = await openStory(page, lang);
        const form = page.locator('#contact form');
        const context = form.locator('[data-contact-context]');
        await expect(context).toHaveCount(0);
        for (const [id, value] of Object.entries(draft)) {
            await form.locator('#contact-' + id).fill(value);
        }
        const routes = lang === 'zh' ? ['💬', '📦'] : ['📦', '💬'];
        const serviceName = icon => config.services.items.find(item => item.icon === icon).title;
        for (const icon of routes) {
            const link = story.locator(`a[data-delivery-route="${icon}"]`);
            await link.focus();
            await link.press('Enter');
            await expect(page).toHaveURL(/#contact$/);
            await expect(context).toBeFocused();
            await expect(context).toContainText(config.ui.studio.deliveryStory.contextTitle);
            await expect(context).toContainText(serviceName(icon));
            await assertDraft(page);
            if (icon === routes[1]) {
                await form.locator('[data-clear-contact-context]').click();
                await expect(context).toHaveCount(0);
                await expect(form.locator('#contact-name')).toBeFocused();
                await assertDraft(page);
            }
            await page.goBack();
            await expect(page).toHaveURL(/#glide-delivery$/);
            await expect(story.locator('h2')).toBeInViewport();
        }
        await story.locator(`a[data-delivery-route="${routes[0]}"]`).click();
        await form.locator('button[type="submit"]').click();
        await expect(form.locator('.form-feedback')).toContainText(config.contact.form.success);
        expect(payloads).toHaveLength(1);
        const content = JSON.stringify(payloads[0].card.elements);
        for (const expected of [
            config.ui.studio.deliveryStory.contextTitle, serviceName(routes[0]), ...Object.values(draft)
        ]) {
            expect(content).toContain(expected);
        }
        expect(content).not.toContain(serviceName(routes[1]));
        await expect(context).toHaveCount(0);
    });
}
