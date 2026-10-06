const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Screenshot 1: Chat
    console.log('1. Chat...');
    await page.click('.chat-toggle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    await page.click('.chat-close');
    await page.waitForTimeout(500);
    console.log('   ✓');
    
    // Screenshot 2: Click Products button to show products page
    console.log('2. Products page...');
    const navButtons = page.locator('.nav-links button');
    const productsBtn = navButtons.filter({ hasText: /^Products$/ }).first();
    await productsBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    console.log('   ✓');
    
    // Screenshot 3: Click a product to show detail page
    console.log('3. Product detail...');
    const products = page.locator('.product-card');
    const count = await products.count();
    if (count > 0) {
      await products.first().click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    console.log('   ✓');
    
    console.log('\n✅ Captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
