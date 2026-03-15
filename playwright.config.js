const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:8000',
        headless: true
    },
    webServer: {
        command: 'python3 -m http.server 8000',
        url: 'http://127.0.0.1:8000',
        reuseExistingServer: true,
        timeout: 120000
    }
});
