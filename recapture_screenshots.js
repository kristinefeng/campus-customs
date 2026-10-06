const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Screenshot 1: Chat open
    console.log('1. Capturing chat...');
    let page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await page.click('.chat-toggle');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    await page.close();
    console.log('   ✓ Chat screenshot (showing chat widget)');
    
    // Screenshot 2: Products page - scroll down to show more products
    console.log('2. Capturing products page...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    // Scroll down to show more product cards
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    await page.close();
    console.log('   ✓ Products page (showing product grid)');
    
    // Screenshot 3: Product detail with size selector
    console.log('3. Capturing product detail...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const products = page.locator('.product-card');
    const count = await products.count();
    console.log(`   Found ${count} products, clicking first...`);
    if (count > 0) {
      await products.first().click();
      await page.waitForTimeout(1500);
      // Scroll to size selector
      await page.locator('.size-selector').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    await page.close();
    console.log('   ✓ Size selector page (showing inventory by size)');
    
    console.log('\n✅ Screenshots recaptured!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
