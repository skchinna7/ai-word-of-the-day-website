const { test, expect } = require('@playwright/test');

test.describe('Homepage Tests', () => {
    test('should load word of the day', async ({ page }) => {
        await page.goto('http://localhost:8080');
        
        // Wait for word to load
        await page.waitForSelector('#word');
        
        // Check word is displayed
        const word = await page.locator('#word').textContent();
        expect(word).not.toBe('Loading...');
        expect(word.length).toBeGreaterThan(0);
    });

test('should show word count', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Check word count
    const count = await page.locator('#totalWords').textContent();
    expect(count).not.toBe('...');
    expect(parseInt(count)).toBeGreaterThan(0);
});

test('should search for words', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Type in search
    await page.fill('#searchBar', 'test');
    
    // Wait for results
    await page.waitForSelector('#searchResults', { state: 'visible' });
    
    // Check results appear
    const resultsVisible = await page.locator('#searchResults').isVisible();
    expect(resultsVisible).toBe(true);
});

test('should toggle theme', async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    const bodyBefore = await page.locator('body').getAttribute('class');
    
    // Click theme toggle
    await page.click('#themeToggle');
    
    const bodyAfter = await page.locator('body').getAttribute('class');
    
    expect(bodyBefore).not.toBe(bodyAfter);
});
});