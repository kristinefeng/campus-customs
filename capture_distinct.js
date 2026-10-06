const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Screenshot 1: Chat interface
    console.log('1. Chat interface...');
    let page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    const chatBtn = page.locator('.chat-toggle');
    await chatBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    await page.close();
    console.log('   ✓ Saved');
    
    // Screenshot 2: Homepage with full content
    console.log('2. Homepage/products view...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(3000);
    // Make sure we're fully scrolled to see products
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    await page.close();
    console.log('   ✓ Saved');
    
    // Screenshot 3: Scroll down to show different content
    console.log('3. Product detail area...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2500);
    // Scroll way down to show lower content
    await page.evaluate(() => {
      window.scrollTo(0, 600);
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    await page.close();
    console.log('   ✓ Saved');
    
    console.log('\n✅ Done');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
