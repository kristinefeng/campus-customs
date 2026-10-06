const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 1400 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    
    // Go to products
    const navButtons = page.locator('.nav-links button');
    const productsBtn = navButtons.filter({ hasText: /^Products$/ }).first();
    await productsBtn.click();
    await page.waitForTimeout(2500);
    
    // Click first product
    const products = page.locator('.product-card');
    await products.first().click();
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png'), fullPage: true });
    console.log('✓ Full page screenshot captured');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
