import { chromium } from 'playwright-core';

async function runTests() {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push('[' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => logs.push('PAGE ERROR: ' + err.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      logs.push('HTTP ERROR: ' + response.status() + ' ' + response.url());
    }
  });

  console.log('=== BOOKHIVE FRONTEND E2E TEST ===\n');

  // Test 1: Unauthenticated access redirects to login
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const url1 = page.url();
  console.log('Test 1 - Unauthenticated /dashboard redirects to login:', url1.includes('/login') ? 'PASS' : 'FAIL');

  // Test 2: Librarian login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'e2e_librarian');
  await page.fill('input[name="password"]', 'E2eLibPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(3000);
  const dashText = await page.evaluate(() => document.body.innerText);
  console.log('Test 2 - Librarian login + dashboard:', dashText.includes('Library overview') ? 'PASS' : 'FAIL');

  // Test 3: Librarian routes
  const libRoutes = ['/books', '/members', '/issue', '/return', '/transactions', '/ai'];
  console.log('\n--- Librarian Routes ---');
  for (const route of libRoutes) {
    await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`  ${route}: ${text.length > 100 ? 'PASS' : 'FAIL'}`);
  }

  // Test 4: Logout
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.click('button[aria-label="Account menu"]');
  await page.waitForTimeout(500);
  await page.click('text=Sign out');
  await page.waitForURL('**/login', { timeout: 10000 });
  console.log('\nTest 4 - Logout:', (await page.url()).includes('/login') ? 'PASS' : 'FAIL');

  // Test 5: Member login - navigate to login page first
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'e2e_member_mszpw6fw');
  await page.fill('input[name="password"]', 'E2eMemberPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForTimeout(3000);
  const memberText = await page.evaluate(() => document.body.innerText);
  console.log('\nTest 5 - Member login + dashboard:', memberText.includes('Currently borrowed') ? 'PASS' : 'FAIL');

  // Test 6: Member routes
  const memberRoutes = ['/books', '/my-books'];
  console.log('\n--- Member Routes ---');
  for (const route of memberRoutes) {
    await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log(`  ${route}: ${text.length > 100 ? 'PASS' : 'FAIL'}`);
  }

  // Test 7: Member blocked from librarian routes
  await page.goto('http://localhost:5173/members', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const unauthorizedText = await page.evaluate(() => document.body.innerText);
  console.log('\nTest 7 - Member blocked from /members:', unauthorizedText.includes('Unauthorized') ? 'PASS' : 'FAIL');

  // Test 8: Direct access to /unauthorized
  await page.goto('http://localhost:5173/unauthorized', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const unauthText = await page.evaluate(() => document.body.innerText);
  console.log('\nTest 8 - /unauthorized page:', unauthText.includes('Unauthorized') ? 'PASS' : 'FAIL');

  // Test 9: 404 page
  await page.goto('http://localhost:5173/nonexistent', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  const notfoundText = await page.evaluate(() => document.body.innerText);
  console.log('\nTest 9 - 404 page:', notfoundText.includes('not found') || notfoundText.includes('Page not found') ? 'PASS' : 'FAIL');

  console.log('\n=== ALL TESTS COMPLETE ===');
  console.log('Errors:', logs.filter(l => l.includes('ERROR') || l.includes('Error')).length);

  await browser.close();
}

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push('[' + msg.type() + '] ' + msg.text()));
  page.on('pageerror', err => logs.push('PAGE ERROR: ' + err.message));
  page.on('response', response => {
    if (response.status() >= 400) {
      logs.push('HTTP ERROR: ' + response.status() + ' ' + response.url());
    }
  });

  await runTests();
})().catch(e => { console.error('Error:', e); process.exit(1); });