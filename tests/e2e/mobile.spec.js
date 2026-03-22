const { test, expect, devices } = require('@playwright/test');

const iPhone = devices['iPhone 12'];

async function resetClientState(page) {
    await page.goto('/?e2e=1');
    await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
        }
        localStorage.clear();
    });
    await page.reload();
    await expect(page.locator('.pokemon-card').first()).toBeVisible();
}

test('mobile view loads without JavaScript errors on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();

    const jsErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore expected external resource failures in test sandbox
            if (!text.includes('ERR_NAME_NOT_RESOLVED') &&
                !text.includes('cdn.jsdelivr') &&
                !text.includes('raw.githubusercontent') &&
                !text.includes('fonts.google')) {
                jsErrors.push(text);
            }
        }
    });
    page.on('pageerror', (err) => {
        jsErrors.push('PAGE ERROR: ' + err.message);
    });

    await resetClientState(page);

    const cards = await page.locator('.pokemon-card').count();
    const errorContainers = await page.locator('.error-container').count();

    expect(cards).toBeGreaterThan(0);
    expect(errorContainers).toBe(0);
    expect(jsErrors).toHaveLength(0);

    await context.close();
});

test('mobile view renders Pokemon cards and handles taps', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();

    await resetClientState(page);

    // Verify Pokemon cards are rendered
    const firstCard = page.locator('.pokemon-card').first();
    await expect(firstCard).toBeVisible();

    // Tap a card to open the detail view
    await firstCard.tap();
    await expect(page.locator('#pokemon-detail-view')).toHaveClass(/show/);

    // Close detail view
    await page.locator('#close-detail-view').tap();
    await expect(page.locator('#pokemon-detail-view')).not.toHaveClass(/show/);

    await context.close();
});
