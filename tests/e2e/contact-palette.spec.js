const { test, expect } = require('@playwright/test');

async function expectFlatSurface(control) {
    const effects = await control.evaluate(element => {
        const styles = [getComputedStyle(element)];
        for (const pseudo of ['::before', '::after']) {
            const style = getComputedStyle(element, pseudo);
            if (style.content !== 'none' && style.content !== 'normal') styles.push(style);
        }
        return styles.map(style => ({
            gradient: style.backgroundImage.includes('gradient('),
            looping: style.animationName !== 'none' && style.animationIterationCount.includes('infinite')
        })).filter(effect => effect.gradient || effect.looping);
    });
    expect(effects).toEqual([]);
}

test('contact actions share the case palette and have visible keyboard focus', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const primary = page.locator('#case-studies [data-case-kind="report"] [data-case-action="cite"]');
    const submit = page.locator('#contact form button[type="submit"]');
    const support = page.locator('#contact a.btn-support-link');
    await expect(primary).toBeEnabled();
    await expect(submit).toBeVisible();
    await expect(support).toBeVisible();

    const caseColor = await primary.evaluate(element => getComputedStyle(element).backgroundColor);
    await expect(submit).toHaveCSS('background-color', caseColor);
    await expect(support).not.toHaveCSS('background-color', caseColor);
    await expectFlatSurface(support);
    await expectFlatSurface(submit);
    await primary.hover();
    const hoveredCaseColor = await primary.evaluate(element => getComputedStyle(element).backgroundColor);
    await submit.hover();
    await expect(submit).toHaveCSS('background-color', hoveredCaseColor);
    await expectFlatSurface(submit);

    for (const control of [support, submit]) {
        await control.focus();
        await page.keyboard.press('Shift+Tab');
        await page.keyboard.press('Tab');
        await expect(control).toBeFocused();
        expect(await control.evaluate(element => {
            const style = getComputedStyle(element);
            return element.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        })).toBe(true);
    }
});
