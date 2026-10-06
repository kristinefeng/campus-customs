const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    
    // Navigate to Products page
    console.log('Navigating to products...');
    const navButtons = page.locator('.nav-links button');
    const productsBtn = navButtons.filter({ hasText: /^Products$/ }).first();
    await productsBtn.click();
    await page.waitForTimeout(2500);
    
    // Click first product
    console.log('Opening first product...');
    const products = page.locator('.product-card');
    const count = await products.count();
    console.log(`Found ${count} products`);
    
    if (count > 0) {
      await products.first().click();
      await page.waitForTimeout(2000);
      
      // Wait for size selector to be visible
      await page.waitForSelector('.size-btn', { timeout: 5000 });
      console.log('Size buttons found');
      
      // Scroll to size selector to ensure it's in view
      await page.locator('.size-selector').scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      
      // Take screenshot
      await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
      console.log('✓ Size selector screenshot captured with inventory');
    } else {
      console.log('No products found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    // Take debug screenshot
    try {
      await page.screenshot({ path: path.join(imgDir, 'debug_size.png') });
      console.log('Debug screenshot saved');
    } catch(e) {}
  } finally {
    await browser.close();
  }
})();
