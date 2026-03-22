const { test, expect, devices } = require('@playwright/test');

const iPhone = devices['iPhone 12'];

test('mobile view renders correctly on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({
        ...iPhone,
    });
    const page = await context.newPage();
    
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    page.on('pageerror', err => {
        errors.push('PAGE ERROR: ' + err.message);
    });
    
    // Clear SW and caches
    await page.goto('/?e2e=1');
    await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        }
        localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(500);
    
    const cards = await page.locator('.pokemon-card').count();
    console.log(`Cards: ${cards}, Errors: ${errors.length}`);
    console.log('Errors:', errors);
    
    expect(cards).toBeGreaterThan(0);
    expect(errors).toHaveLength(0);
    
    await context.close();
});
