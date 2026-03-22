const { test, expect, devices } = require('@playwright/test');

const iPhone = devices['iPhone 12'];

test('mobile view - detailed check', async ({ browser }) => {
    const context = await browser.newContext({ ...iPhone });
    const page = await context.newPage();
    
    const resourceErrors = [];
    const jsErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            if (text.includes('net::ERR_NAME_NOT_RESOLVED') || text.includes('cdn.jsdelivr') || text.includes('fonts.goog')) {
                // Count these separately
            } else {
                jsErrors.push(text);
            }
        }
    });
    page.on('pageerror', err => {
        jsErrors.push('PAGE ERROR: ' + err.message);
    });
    
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
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const cards = await page.locator('.pokemon-card').count();
    const errorContainers = await page.locator('.error-container').count();
    const errorMessages = await page.locator('.error-message').count();
    
    console.log(`Cards: ${cards}`);
    console.log(`Error containers: ${errorContainers}`);
    console.log(`Error messages: ${errorMessages}`);
    console.log(`JS Errors:`, jsErrors);
    
    // Check for any visible error text
    if (errorContainers > 0 || errorMessages > 0) {
        const bodyHTML = await page.locator('body').innerHTML();
        console.log('Body snippet:', bodyHTML.substring(0, 2000));
    }
    
    expect(cards).toBeGreaterThan(0);
    expect(jsErrors).toHaveLength(0);
    
    await context.close();
});
