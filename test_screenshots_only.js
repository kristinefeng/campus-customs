const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'output', 'app_check_images');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    
    // Just get the homepage (shows design/layout)
    await page.goto('http://localhost:5178', { waitUntil: 'load', timeout: 15000 });
    await page.screenshot({ path: path.join(imgDir, '03_homepage_design.png') });
    console.log('✓ Homepage with design elements');
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
