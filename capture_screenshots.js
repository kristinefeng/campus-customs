const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    
    console.log('Loading app...');
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Screenshot 1: Chat interface - showing the chat widget
    console.log('1. Taking chat interface screenshot...');
    const chatToggle = page.locator('.chat-toggle');
    await chatToggle.click();
    await page.waitForSelector('.chat-panel', { timeout: 5000 });
    await page.waitForTimeout(800);
    
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    console.log('   ✓ Chat interface captured');
    
    // Close chat
    const chatClose = page.locator('.chat-close');
    await chatClose.click();
    await page.waitForTimeout(500);
    
    // Screenshot 2: Products/Search results
    console.log('2. Taking search results screenshot...');
    await page.waitForSelector('.products-grid', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    console.log('   ✓ Search results captured');
    
    // Screenshot 3: Product detail with size selector
    console.log('3. Taking size selector screenshot...');
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.waitFor({ timeout: 5000 });
    await firstProduct.click();
    
    await page.waitForSelector('.size-selector', { timeout: 5000 });
    await page.waitForTimeout(800);
    await page.locator('.size-selector').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    console.log('   ✓ Size selector captured');
    
    console.log('\n✅ All screenshots captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
