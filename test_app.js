const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const imgDir = path.join(__dirname, 'output', 'app_check_images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

async function runTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Starting app testing...');

    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 800 });

    // Navigate to app
    console.log('1. Loading homepage...');
    await page.goto('http://localhost:5178', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(imgDir, '01_homepage.png') });
    console.log('✓ Homepage screenshot saved');

    // Click login
    console.log('2. Navigating to login...');
    await page.click('button:has-text("Login")');
    await page.waitForSelector('.login-form');
    await page.screenshot({ path: path.join(imgDir, '02_login_form.png') });
    console.log('✓ Login form screenshot saved');

    // Login with test credentials
    console.log('3. Logging in...');
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'hw4testsalt');
    await page.click('.login-form button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForSelector('.products-grid', { timeout: 5000 });
    console.log('✓ Login successful');

    // Take products page screenshot
    await page.screenshot({ path: path.join(imgDir, '03_products_page.png') });
    console.log('✓ Products page screenshot saved');

    // Test 1: Open chat and check inventory
    console.log('4. Testing inventory check via chat...');
    await page.click('.chat-toggle');
    await page.waitForSelector('.chat-input', { timeout: 3000 });

    // Ask about inventory
    await page.fill('.chat-input', 'How many large hoodies do you have in stock?');
    await page.click('.chat-send');
    await page.waitForSelector('.chat-message.assistant', { timeout: 8000 });
    await page.waitForTimeout(1000); // Wait for animation
    await page.screenshot({ path: path.join(imgDir, '04_inventory_chat.png') });
    console.log('✓ Inventory check screenshot saved');

    // Test 2: Search for products via chat
    console.log('5. Testing search results via chat...');
    await page.fill('.chat-input', 'Do you have blue hoodies?');
    await page.click('.chat-send');
    await page.waitForTimeout(2000);
    await page.waitForSelector('.chat-products', { timeout: 8000 });
    await page.screenshot({ path: path.join(imgDir, '05_search_results_chat.png') });
    console.log('✓ Search results screenshot saved');

    // Test 3: Close chat and show usability feature (search bar)
    console.log('6. Testing usability feature (search bar)...');
    await page.click('.chat-close');
    await page.waitForTimeout(500);

    // Use the search bar
    await page.click('.search-input');
    await page.fill('.search-input', 'navy');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(imgDir, '06_search_bar_feature.png') });
    console.log('✓ Search bar feature screenshot saved');

    // Test 4: Show product detail with size selector (usability feature)
    console.log('7. Testing size selector usability feature...');
    await page.fill('.search-input', ''); // Clear search
    await page.waitForTimeout(300);

    // Click first product
    const firstProduct = await page.locator('.product-card').first();
    await firstProduct.click();
    await page.waitForSelector('.size-selector', { timeout: 3000 });
    await page.screenshot({ path: path.join(imgDir, '07_size_selector.png') });
    console.log('✓ Size selector screenshot saved');

    console.log('\n✅ All tests completed successfully!');
    console.log(`Screenshots saved to: ${imgDir}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
