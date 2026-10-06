const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Test 1: Homepage
    console.log('Taking homepage screenshot...');
    await page.goto('http://localhost:5178', { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: path.join(imgDir, '01_homepage.png'), fullPage: false });

    // Test 2: Login page
    console.log('Taking login page screenshot...');
    const loginBtn = page.locator('button:has-text("Login")').first();
    await loginBtn.click();
    await page.waitForSelector('.login-form', { timeout: 5000 });
    await page.screenshot({ path: path.join(imgDir, '02_login_page.png'), fullPage: false });

    // Test 3: Login with test user
    console.log('Logging in...');
    await page.locator('input[type="email"]').fill('testapp@campuscustoms.yale.edu');
    await page.locator('input[type="password"]').fill('TestPassword123');
    await page.locator('.login-form button[type="submit"]').click();
    await page.waitForTimeout(3000); // Wait for redirect

    // Test 4: Products page after login
    console.log('Taking products page screenshot...');
    try {
      await page.waitForSelector('.products-grid', { timeout: 8000 });
    } catch (e) {
      // If products-grid not found, try waiting for products-page
      await page.waitForSelector('.products-page', { timeout: 5000 });
    }
    await page.screenshot({ path: path.join(imgDir, '03_products_page.png'), fullPage: false });

    // Test 5: Search bar feature
    console.log('Testing search bar...');
    await page.waitForSelector('.product-card', { timeout: 8000 }); // Wait for products to load
    const searchInput = page.locator('.search-input');
    await searchInput.click();
    await searchInput.fill('hoodie');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(imgDir, '04_search_bar_feature.png'), fullPage: false });

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Test 6: Click product for size selector
    console.log('Testing size selector feature...');
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.waitFor({ timeout: 5000 });
    await firstProduct.click();
    await page.waitForSelector('.size-selector', { timeout: 5000 });
    await page.screenshot({ path: path.join(imgDir, '05_size_selector_feature.png'), fullPage: false });

    // Test 7: Back to products, open chat
    console.log('Testing chat...');
    await page.locator('.back-btn').click();
    await page.waitForSelector('.products-grid', { timeout: 5000 });

    const chatToggle = page.locator('.chat-toggle');
    await chatToggle.click();
    await page.waitForSelector('.chat-input', { timeout: 5000 });
    await page.screenshot({ path: path.join(imgDir, '06_chat_widget_open.png'), fullPage: false });

    // Test 8: Chat inventory check
    console.log('Testing inventory via chat...');
    const chatInput = page.locator('.chat-input');
    await chatInput.fill('Do you have large navy hoodies in stock?');
    await page.locator('.chat-send').click();
    await page.waitForSelector('.chat-message.assistant', { timeout: 15000 });
    await page.waitForTimeout(1500); // Wait for animation
    await page.screenshot({ path: path.join(imgDir, '07_chat_inventory_response.png'), fullPage: false });

    // Test 9: Search results in chat
    console.log('Testing search results via chat...');
    await chatInput.fill('What hoodies do you have?');
    await page.locator('.chat-send').click();
    await page.waitForSelector('.chat-products', { timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(imgDir, '08_chat_search_results.png'), fullPage: false });

    console.log('\n✅ All tests passed!');
    console.log(`📸 Screenshots saved to: ${imgDir}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
