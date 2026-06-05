const { defineConfig } = require('@playwright/test');
const path = require('node:path');

module.exports = defineConfig({
    testDir: path.join(__dirname, 'tests/e2e'),
    timeout: 30000,
    use: {
        baseURL: 'http://127.0.0.1:4174',
        headless: true
    },
    webServer: {
        command: 'node tests/helpers/serve-fixture.js',
        url: 'http://127.0.0.1:4174',
        reuseExistingServer: false,
        timeout: 120000
    }
});
