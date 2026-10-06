const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    
    console.log('Loading app...');
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    
    // Screenshot 1: Chat interface
    console.log('1. Chat interface...');
    const chatToggle = page.locator('.chat-toggle');
    await chatToggle.click();
    await page.waitForSelector('.chat-panel', { timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    console.log('   ✓');
    
    // Close chat and go back to products
    const chatClose = page.locator('.chat-close');
    await chatClose.click();
    await page.waitForTimeout(500);
    
    // Screenshot 2: Just the products page/search area
    console.log('2. Products and search...');
    await page.waitForSelector('.search-input, .products-page', { timeout: 8000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    console.log('   ✓');
    
    // Screenshot 3: Size selector
    console.log('3. Size selector...');
    const cards = page.locator('.product-card');
    const count = await cards.count();
    console.log(`   Found ${count} product cards`);
    
    if (count > 0) {
      await cards.first().click();
      await page.waitForSelector('.size-selector', { timeout: 8000 });
      await page.waitForTimeout(600);
      await page.locator('.size-selector').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
      console.log('   ✓');
    } else {
      console.log('   No products found, using current page');
      await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    }
    
    console.log('\n✅ Screenshots captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
    try {
      await page.screenshot({ path: path.join(imgDir, 'debug.png') });
    } catch(e) {}
  } finally {
    await browser.close();
  }
})();
