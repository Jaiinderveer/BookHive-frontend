import { chromium } from 'playwright-core'
const BASE = 'http://localhost:5173'
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
page.on('console', (m) => console.log('CONSOLE[' + m.type() + ']: ' + m.text().slice(0, 500)))
page.on('pageerror', (e) => console.log('PAGEERROR: ' + e.message))
page.on('response', (r) => {
  if (r.status() >= 400) console.log('HTTP ' + r.status() + ' ' + r.url())
})

await page.goto(BASE + '/login')
await page.fill('input[name="username"]', 'e2e_member_mszpw6fw')
await page.fill('input[name="password"]', 'E2eMemberPass123!')
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard', { timeout: 15000 })
await page.waitForTimeout(5000)
console.log('URL: ' + page.url())
const html = await page.evaluate(() => document.documentElement.outerHTML.slice(0, 2500))
console.log('=== HTML ===')
console.log(html)
const hasRoot = await page.evaluate(() => document.getElementById('root')?.innerHTML.length)
console.log('root innerHTML length:', hasRoot)
await browser.close()
