const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    
    // Go to products
    const navButtons = page.locator('.nav-links button');
    const productsBtn = navButtons.filter({ hasText: /^Products$/ }).first();
    await productsBtn.click();
    await page.waitForTimeout(2500);
    
    // Click first product
    const products = page.locator('.product-card');
    await products.first().click();
    await page.waitForTimeout(2500);
    
    // Wait for size buttons and ensure they're visible
    await page.locator('.size-btn').first().waitFor({ timeout: 5000 });
    console.log('Size buttons visible');
    
    // Scroll entire page to see size selector
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(800);
    
    // Take screenshot showing the size selector with buttons
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    console.log('✓ Size selector captured with buttons visible');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
