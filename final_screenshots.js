const { chromium } = require('playwright');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Screenshot 1: Chat visible on homepage
    console.log('Capturing: Chat Widget...');
    let page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await page.click('.chat-toggle');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(imgDir, 'test1_chat_interface.png') });
    await page.close();
    console.log('✓ Screenshot 1 saved');
    
    // Screenshot 2: Products page
    console.log('Capturing: Products Page...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(imgDir, 'test2_search_results.png') });
    await page.close();
    console.log('✓ Screenshot 2 saved');
    
    // Screenshot 3: Product detail
    console.log('Capturing: Size Selector...');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5178', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    const product = page.locator('.product-card').first();
    const count = await page.locator('.product-card').count();
    if (count > 0) {
      await product.click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: path.join(imgDir, 'test3_size_selector.png') });
    await page.close();
    console.log('✓ Screenshot 3 saved');
    
    console.log('\n✅ All screenshots captured!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
