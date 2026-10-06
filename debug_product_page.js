const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    
    // Navigate to Products
    const navButtons = page.locator('.nav-links button');
    const productsBtn = navButtons.filter({ hasText: /^Products$/ }).first();
    await productsBtn.click();
    await page.waitForTimeout(2500);
    
    // Click first product
    const products = page.locator('.product-card');
    const count = await products.count();
    console.log(`Found ${count} products, clicking first...`);
    
    await products.first().click();
    await page.waitForTimeout(2000);
    
    // Debug: Check what elements are on the page
    const pageContent = await page.content();
    
    if (pageContent.includes('size-selector')) {
      console.log('✓ Size selector found in HTML');
    } else {
      console.log('✗ Size selector NOT in HTML');
    }
    
    if (pageContent.includes('size-btn')) {
      console.log('✓ Size buttons found in HTML');
    } else {
      console.log('✗ Size buttons NOT in HTML');
    }
    
    if (pageContent.includes('detail-info')) {
      console.log('✓ Product detail page loaded');
    } else {
      console.log('✗ Product detail page NOT loaded');
    }
    
    // Check if we have the back button (indicates detail view)
    const backBtn = page.locator('.back-btn');
    const backCount = await backBtn.count();
    console.log(`Back button count: ${backCount}`);
    
    // Take screenshot to see actual state
    await page.screenshot({ path: path.join(__dirname, 'output/app_check_images/debug_product_state.png') });
    console.log('Debug screenshot saved');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
