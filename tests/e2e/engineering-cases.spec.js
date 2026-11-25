const { test, expect } = require('@playwright/test');
const zh = require('../../assets/data/homeConfig.json');
const en = require('../../assets/data/homeConfig.en.json');

test.use({ viewport: { width: 320, height: 680 }, reducedMotion: 'reduce' });

const entry = (page, kind) => page.locator(`#case-studies article[data-case-kind="${kind}"]`);
const link = (page, kind) => page.locator(`#case-studies nav a[data-case-link="${kind}"]`);
const action = (lab, name, value) => lab.locator(`[data-case-action="${name}"]${value === undefined ? '' : `[data-value="${value}"]`}`);
const control = (lab, name) => lab.locator(`[data-case-change="${name}"]`);

async function openCase(page, lang, kind) {
    await page.goto(`/?lang=${lang}#case-studies`);
    await expect(link(page, 'report')).toHaveAttribute('aria-current', 'true');
    await link(page, kind).press('Enter');
    const lab = entry(page, kind);
    await expect(lab).toBeVisible();
    await expect(link(page, kind)).toHaveAttribute('aria-current', 'true');
    return lab;
}

for (const [lang, config] of [['zh', zh], ['en', en]]) {
    const examples = config.ui.studio.casebook.examples;

    test(`320px ${lang}: citations require the right paragraph, primary source and publication date`, async ({ page }) => {
        const lab = await openCase(page, lang, 'report');
        const report = config.ui.studio.casebook.labs.report;
        const check = action(lab, 'cite');
        await check.click();
        await expect(lab.locator('[data-document-verdict="secondary"]')).toContainText(report.verdicts.secondary.title);

        await action(lab, 'source', 'latest').click();
        await action(lab, 'section', 'supply').click();
        await check.click();
        await expect(lab.locator('[data-document-verdict="section"]')).toContainText(report.verdicts.section.title);
        await action(lab, 'section', 'demand').click();
        await check.press('Enter');
        const citation = lab.locator('[data-document-verdict="valid"] blockquote');
        await expect(citation).toContainText(report.docs.latest.demand.text);
        await expect(citation.locator('cite')).toContainText(report.docs.latest.demand.ref);

        await control(lab, 'period').selectOption('early');
        await check.click();
        await expect(lab.locator('[data-document-verdict="future"]')).toContainText(report.verdicts.future.title);
        await action(lab, 'source', 'earlier').click();
        await check.click();
        await expect(citation).toContainText(report.docs.earlier.demand.text);
        await expect(citation.locator('cite')).toContainText(report.docs.earlier.date);
    });

    test(`320px ${lang}: moving the column boundary repairs the second scan row before export`, async ({ page }) => {
        const lab = await openCase(page, lang, 'scan');
        const sample = examples.scan;
        const second = lab.locator('[data-scan-table] tbody tr').nth(1);
        await action(lab, 'check').click();
        await expect(lab.locator('[data-document-verdict="review"] li')).toContainText(sample.rows[1][0]);
        await expect(second.locator('td').last()).toHaveText(`${sample.rows[1][1]} ${sample.rows[1][2]}`);
        await expect(lab.locator('pre')).toHaveCount(0);

        const boundary = control(lab, 'boundary');
        await expect(boundary).toHaveValue('59');
        for (let i = 0; i < 5; i++) await boundary.press('ArrowRight');
        await expect(boundary).toHaveValue('64');
        await expect(second.locator('td')).toHaveText(sample.rows[1].slice(1));
        await action(lab, 'check').click();
        const exported = lab.locator('[data-document-verdict="valid"] pre');
        for (const row of [sample.headers, ...sample.rows]) {
            await expect(exported).toContainText('| ' + row.join(' | ') + ' |');
        }
        await lab.locator('[data-case-reset]').click();
        await expect(boundary).toHaveValue('59');
        await expect(exported).toHaveCount(0);
    });

    test(`320px ${lang}: an order can only clear review with matching evidence, preserving its audit trail`, async ({ page }) => {
        const lab = await openCase(page, lang, 'ledger');
        const proof = control(lab, 'proof');
        const feedback = lab.locator('[data-case-feedback]');
        const audit = lab.locator('.ledger-log ol');
        await action(lab, 'order', 'A').click();
        await expect(lab.locator('.ledger-evidence')).toContainText('V-A');
        await expect(lab.locator('.ledger-evidence')).toContainText('R-A');
        await action(lab, 'order', 'B').click();
        await expect(lab.locator('.ledger-evidence')).toContainText(examples.ledger.missing);
        await action(lab, 'verify').click();
        await expect(feedback).toHaveText(config.ui.studio.casebook.labs.ledger.noProof.replace('{B}', examples.ledger.idB));

        await action(lab, 'request').click();
        await proof.selectOption('A');
        await action(lab, 'attach').click();
        await action(lab, 'verify').click();
        await expect(feedback).toContainText('V-A');
        await expect(feedback).toContainText(examples.ledger.idA);
        const rejection = await feedback.textContent();
        await expect(audit).toContainText(rejection);

        await proof.selectOption('B');
        await action(lab, 'attach').click();
        await action(lab, 'verify').click();
        await expect(feedback).toContainText('V-B');
        await expect(feedback).toContainText('R-B');
        await expect(audit.locator('li').last()).toHaveText(await feedback.textContent());
        await expect(audit).toContainText(rejection);
        await expect(action(lab, 'verify')).toHaveCount(0);
        await action(lab, 'order', 'A').click();
        await expect(lab.locator('.ledger-evidence')).toContainText('V-A');
        await expect(lab.locator('.ledger-evidence')).not.toContainText('V-B');
    });

    test(`320px ${lang}: fixing an empty column changes the tool result without overwriting the failed run`, async ({ page }) => {
        const lab = await openCase(page, lang, 'tools');
        const run = action(lab, 'tools-run');
        await run.click();
        const trace = lab.locator('.tools-trace');
        await expect(lab.locator('[data-tools-verdict="ghost"]')).toBeVisible();
        await expect(trace).toContainText('TOPOLOGY_VIOLATION');
        await expect(trace).not.toContainText('count_units');
        await control(lab, 'tools-mode').selectOption('trim');
        await run.click();
        await expect(lab.locator('[data-tools-verdict="passed"] [data-case-feedback]')).toContainText('19');
        await expect(trace).toContainText('count_units');
        await expect(trace).toContainText('12 + 7');
        await expect(trace.locator('thead th')).toHaveCount(2);

        await link(page, 'scan').click();
        await expect(lab).toBeHidden();
        await page.goBack();
        await expect(link(page, 'tools')).toHaveAttribute('aria-current', 'true');
        await expect(lab.locator('[data-tools-verdict="passed"]')).toBeVisible();
        await control(lab, 'tools-history').selectOption('1');
        await expect(lab.locator('[data-tools-verdict="ghost"]')).toBeVisible();
        await expect(trace).toContainText('TOPOLOGY_VIOLATION');
        await expect(trace.locator('thead th')).toHaveCount(3);
        await expect(trace).not.toContainText('count_units');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
}
