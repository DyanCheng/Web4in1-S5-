const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message, err.stack));

  console.log('Navigating to http://localhost:3000/login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(3000);
  
  console.log('Attempting to fill login form...');
  try {
    await page.type('input[type="email"]', 'employee@travel.com');
    await page.type('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  } catch (e) {
    console.log('Error filling form:', e.message);
  }

  await browser.close();
})();
