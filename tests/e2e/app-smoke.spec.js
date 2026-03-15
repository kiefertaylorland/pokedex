const { test, expect } = require('@playwright/test');

async function resetClientState(page) {
    await page.goto('/?e2e=1');
    await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((registration) => registration.unregister()));
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
        }
        localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(350);
}

test.beforeEach(async ({ page }) => {
    await resetClientState(page);
    await expect(page.locator('.pokemon-card').first()).toBeVisible();
});

test('search, language, and theme controls work', async ({ page }) => {
    await page.fill('#search-input', 'pikachu');
    await page.waitForTimeout(250);
    await expect(page.locator('.pokemon-card')).toHaveCount(1);
    await expect(page.locator('.pokemon-card h3').first()).toContainText(/Pikachu|ピカチュウ/);

    const appTitle = page.locator('#app-title');
    const beforeTitle = await appTitle.textContent();
    await page.click('#lang-toggle');
    await expect(appTitle).not.toHaveText(beforeTitle || '');

    const beforeTheme = await page.evaluate(() => {
        const styles = getComputedStyle(document.body);
        return {
            dark: document.body.classList.contains('dark-mode'),
            bg: styles.getPropertyValue('--oc-bg').trim(),
            text: styles.getPropertyValue('--oc-text').trim()
        };
    });
    await page.click('#theme-toggle');
    const afterTheme = await page.evaluate(() => {
        const styles = getComputedStyle(document.body);
        return {
            dark: document.body.classList.contains('dark-mode'),
            bg: styles.getPropertyValue('--oc-bg').trim(),
            text: styles.getPropertyValue('--oc-text').trim()
        };
    });
    expect(afterTheme.dark).not.toBe(beforeTheme.dark);
    expect(afterTheme.bg).not.toBe(beforeTheme.bg);
    expect(afterTheme.text).not.toBe(beforeTheme.text);
});

test('keyboard shortcuts and card focus navigation work', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-input')).toBeFocused();
    await page.fill('#search-input', '');
    await page.waitForTimeout(200);

    await page.locator('.pokemon-card').first().focus();
    const firstLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));

    await page.keyboard.press('ArrowRight');
    const secondLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(secondLabel).not.toBe(firstLabel);

    await page.keyboard.press('Home');
    const homeLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(homeLabel).toBe(firstLabel);

    await page.keyboard.press('End');
    const endLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(endLabel).not.toBe(firstLabel);
});

test('comparison and team flows are reachable and functional', async ({ page }) => {
    await page.evaluate(() => {
        const firstActionRow = document.querySelector('.pokemon-card-actions');
        firstActionRow?.querySelectorAll('button')[0]?.click();
    });
    await expect(page.locator('.comparison-modal-content h3')).toContainText(/Select Pokémon to Compare|比較するポケモンを選択/);

    await page.locator('.pokemon-card').nth(1).click();
    await expect(page.locator('.comparison-modal-content h2')).toContainText(/Comparison|比較/);
    await expect(page.locator('.comparison-pokemon-header')).toHaveCount(2);
    await expect(page.locator('.comparison-pokemon-header .comparison-types-container')).toHaveCount(2);
    await expect(page.locator('.comparison-pokemon-header .comparison-matchup-chip')).toHaveCount(2);
    await expect(page.locator('.comparison-column-winner').first()).toBeVisible();

    await page.locator('.comparison-btn').filter({ hasText: /Add Third Pokémon|3匹目を追加/ }).click();
    await page.locator('.pokemon-card').nth(2).click();
    await expect(page.locator('.comparison-pokemon-header')).toHaveCount(3);
    await expect(page.locator('.comparison-pokemon-header .comparison-matchup-chip')).toHaveCount(6);
    await page.keyboard.press('Escape');

    await page.evaluate(() => localStorage.setItem('pokedex_team', JSON.stringify([])));
    await page.reload();
    await page.waitForTimeout(300);

    await expect(page.locator('#team-edge-tab')).toBeVisible();
    await expect(page.locator('#team-edge-tab')).toHaveAttribute('aria-expanded', 'false');
    const hiddenPanelGeometry = await page.evaluate(() => {
        const panel = document.getElementById('team-panel');
        if (!panel) {
            return null;
        }
        const rect = panel.getBoundingClientRect();
        return { left: rect.left, viewportWidth: window.innerWidth };
    });
    expect(hiddenPanelGeometry).not.toBeNull();
    expect(hiddenPanelGeometry.left).toBeGreaterThanOrEqual(hiddenPanelGeometry.viewportWidth);
    await page.click('#team-edge-tab');
    await expect(page.locator('#team-panel')).toHaveClass(/team-panel-visible/);
    await expect(page.locator('#team-edge-tab')).toHaveAttribute('aria-expanded', 'true');

    await page.evaluate(() => {
        const rows = document.querySelectorAll('.pokemon-card-actions');
        rows[0]?.querySelectorAll('button')[1]?.click();
        rows[1]?.querySelectorAll('button')[1]?.click();
    });
    await expect(page.locator('#team-count')).toContainText('2');
    await expect(page.locator('#team-edge-tab-count')).toContainText('2');
    await expect(page.locator('#team-coverage .team-coverage-summary')).toHaveCount(3);

    await page.selectOption('#sort-select', 'name-asc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail')).toHaveClass(/quick-jump-visible/);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText(/^[A-Z]$/);
    await page.locator('#quick-jump-rail .quick-jump-btn').first().click();
    await page.waitForTimeout(250);
    const focusedCard = await page.evaluate(() => document.activeElement?.classList?.contains('pokemon-card') || false);
    expect(focusedCard).toBe(true);

    await page.selectOption('#sort-select', 'number-asc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail')).toHaveClass(/quick-jump-visible/);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText(/^G[1-9]$/);

    await page.selectOption('#sort-select', 'height-asc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail')).toHaveClass(/quick-jump-visible/);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText('<0.5m');

    await page.selectOption('#sort-select', 'height-desc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText('3.0m+');

    await page.selectOption('#sort-select', 'weight-asc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText('<10kg');

    await page.selectOption('#sort-select', 'weight-desc');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText('200kg+');

    await page.selectOption('#sort-select', 'stat-total');
    await page.waitForTimeout(350);
    await expect(page.locator('#quick-jump-rail')).toHaveClass(/quick-jump-visible/);
    await expect(page.locator('#quick-jump-rail .quick-jump-btn').first()).toHaveText('600+');
});

test('detail modal shows move class and evolution methods', async ({ page }) => {
    await page.locator('.pokemon-card').first().click();
    await expect(page.locator('#pokemon-detail-view')).toHaveClass(/show/);

    const detailText = await page.locator('#detail-content').innerText();
    expect(detailText).toMatch(/Class|分類/);
    expect(detailText).toMatch(/Method|進化条件/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#pokemon-detail-view')).not.toHaveClass(/show/);
});
