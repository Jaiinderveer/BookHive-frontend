import { chromium } from 'playwright-core';

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push('[' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => logs.push('PAGE ERROR: ' + err.message));
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      logs.push('NAVIGATED TO: ' + frame.url());
    }
  });

  // Test member login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'e2e_member_mszpw6fw');
  await page.fill('input[name="password"]', 'E2eMemberPass123!');
  await page.click('button[type="submit"]');
  
  // Wait and check URL
  await page.waitForTimeout(5000);
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
  
  // Check if on dashboard
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text (first 500):', bodyText.substring(0, 500));
  
  console.log('=== LOGS ===');
  logs.forEach(l => console.log(l));
  
  await browser.close();
})().catch(e => { console.error('Error:', e); process.exit(1); });