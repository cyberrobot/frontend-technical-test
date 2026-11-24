const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/browser',
    fullyParallel: true,
    use: {
        baseURL: 'http://127.0.0.1:4173',
        browserName: 'chromium',
        contextOptions: {
            reducedMotion: 'reduce',
        },
        channel: 'chrome',
    },
    projects: [
        { name: 'mobile', use: { viewport: { width: 320, height: 800 } } },
        { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
        { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    ],
    webServer: {
        command: 'BROWSER=none npm start -- --port 4173',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
