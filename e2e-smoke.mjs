/* BookHive E2E smoke test.
 *
 * Run with the librarian credentials supplied by the environment:
 *
 *   E2E_LIBRARIAN_USERNAME=... E2E_LIBRARIAN_PASSWORD=... node e2e-smoke.mjs
 *
 * or keep them in a git-ignored env file and let Node load it:
 *
 *   node --env-file=.env e2e-smoke.mjs
 *
 * No credential is stored in this file. There is deliberately no fallback
 * account, and no credential value is ever printed by this script.
 */
import { randomBytes } from 'node:crypto'
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:5173'

const LIBRARIAN_USERNAME = process.env.E2E_LIBRARIAN_USERNAME
const LIBRARIAN_PASSWORD = process.env.E2E_LIBRARIAN_PASSWORD

if (!LIBRARIAN_USERNAME || !LIBRARIAN_PASSWORD) {
  // Report the missing variable NAMES only.
  const missing = [
    !LIBRARIAN_USERNAME && 'E2E_LIBRARIAN_USERNAME',
    !LIBRARIAN_PASSWORD && 'E2E_LIBRARIAN_PASSWORD',
  ].filter(Boolean)
  console.error(
    `E2E credentials are not configured. Missing: ${missing.join(', ')}\n` +
      'See .env.example for the variable names. Keep the values out of the\n' +
      'repository - .gitignore already excludes .env and .env.* files.'
  )
  process.exit(1)
}

const results = []
const log = (ok, msg) => {
  results.push({ ok, msg })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
}

async function newPage(browser, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  return { context, page, errors }
}

async function login(page, username, password) {
  await page.goto(BASE + '/login')
  await page.fill('input[name="username"]', username)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

// ---------- MEMBER FLOW ----------
{
  const { context, page, errors } = await newPage(browser)

  // 1. Unauthenticated redirect
  await page.goto(BASE + '/dashboard')
  await page.waitForURL('**/login', { timeout: 10000 })
  log(true, 'Unauthenticated /dashboard redirects to /login')

  // 2. Register a member via UI
  const ts = Date.now().toString(36)
  const memberUser = `e2e_member_${ts}`
  // Generated per run so no password literal lives in the repository. The shape
  // keeps the upper/lower/digit/symbol mix the registration form expects, and
  // the account it creates is disposable.
  const memberPass = `E2e${randomBytes(12).toString('base64url')}9!`
  await page.goto(BASE + '/login')
  await page.click('button:has-text("Create account")')
  await page.fill('input[name="username"]', memberUser)
  await page.fill('input[name="password"]', memberPass)
  await page.fill('input[name="name"]', 'E2E Member')
  await page.fill('input[name="email"]', `${memberUser}@test.dev`)
  await page.fill('input[name="phone"]', '5550000')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
  log(true, 'Member registration + auto-login succeeds')

  // 3. Member dashboard renders real data
  await page.waitForSelector('text=Currently borrowed', { timeout: 10000 })
  log(true, 'Member dashboard renders (Currently borrowed section present)')

  // 4. Sidebar nav is member-scoped
  const aiLinkVisible = await page.locator('text=AI Assistant').count()
  if (aiLinkVisible === 0) log(true, 'Member sidebar hides AI Assistant')
  else log(false, `Member sidebar should hide AI (found ${aiLinkVisible})`)

  // 5. Browse books
  await page.click('aside:visible >> text=Browse Books')
  await page.waitForSelector('text=Browse Books', { timeout: 10000 })
  await page.waitForSelector('text=Search by title', { timeout: 10000 })
  log(true, 'Member Browse Books page renders')

  // 6. My Books
  await page.click('aside:visible >> text=My Books')
  await page.waitForSelector('text=My Books', { timeout: 10000 })
  log(true, 'Member My Books page renders')

  // 7. Member direct URL to librarian-only AI → unauthorized
  await page.goto(BASE + '/ai')
  await page.waitForURL('**/unauthorized', { timeout: 10000 })
  log(true, 'Member /ai redirects to /unauthorized')

  // 8. Session persistence on refresh
  await page.goto(BASE + '/dashboard')
  await page.waitForSelector('text=Currently borrowed', { timeout: 10000 })
  log(true, 'Session persists after refresh')

  // 9. Logout
  await page.click('button[aria-label="Account menu"]')
  await page.click('text=Sign out')
  await page.waitForURL('**/login', { timeout: 10000 })
  log(true, 'Logout returns to /login')

  const memberRuntimeErrors = errors.filter((e) => !e.includes('favicon'))
  log(memberRuntimeErrors.length === 0, `Member flow console errors: ${memberRuntimeErrors.length ? memberRuntimeErrors.join(' | ') : 'none'}`)

  await context.close()
}

/*__PART2__*/
// ---------- LIBRARIAN FLOW ----------
{
  const { context, page, errors } = await newPage(browser)

  await login(page, LIBRARIAN_USERNAME, LIBRARIAN_PASSWORD)

  // Dashboard
  await page.waitForSelector('text=BookHive Insights', { timeout: 15000 })
  log(true, 'Librarian dashboard renders (BookHive Insights present)')

  // Books
  await page.click('aside:visible >> text=Books')
  await page.waitForSelector('button:has-text("Add Book")', { timeout: 10000 })
  log(true, 'Librarian Books page renders with Add Book')

  // Members
  await page.click('aside:visible >> text=Members')
  await page.waitForSelector('button:has-text("Add Member")', { timeout: 10000 })
  log(true, 'Librarian Members page renders with Add Member')

  // Issue
  await page.click('aside:visible >> text=Issue Book')
  await page.waitForSelector('text=Lend a book to a member', { timeout: 10000 })
  log(true, 'Issue Book page renders')

  // Return
  await page.click('aside:visible >> text=Return Book')
  await page.waitForSelector('text=Process a book return', { timeout: 10000 })
  log(true, 'Return Book page renders')

  // Transactions
  await page.click('aside:visible >> text=Transactions')
  await page.waitForSelector('text=Record of all book issues and returns', { timeout: 10000 })
  log(true, 'Transactions page renders')

  // AI Assistant - real chat with tool call
  await page.click('aside:visible >> text=AI Assistant')
  await page.waitForSelector('text=Your BookHive librarian copilot', { timeout: 10000 })
  await page.fill('textarea', 'Show the dashboard summary.')
  await page.click('button[aria-label="Send message"]')
  await page.waitForSelector('text=Library Dashboard Summary', { timeout: 90000 })
  log(true, 'AI Assistant returns a real dashboard summary (tool-calling works)')

  // Logout
  await page.click('button[aria-label="Account menu"]')
  await page.click('text=Sign out')
  await page.waitForURL('**/login', { timeout: 10000 })
  log(true, 'Librarian logout works')

  const libRuntimeErrors = errors.filter((e) => !e.includes('favicon'))
  log(libRuntimeErrors.length === 0, `Librarian flow console errors: ${libRuntimeErrors.length ? libRuntimeErrors.join(' | ') : 'none'}`)

  await context.close()
}

// ---------- MOBILE VIEWPORT QUICK CHECK ----------
{
  const { context, page, errors } = await newPage(browser, { width: 390, height: 844 })
  await login(page, LIBRARIAN_USERNAME, LIBRARIAN_PASSWORD)
  await page.waitForSelector('text=BookHive Insights', { timeout: 15000 })
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientW = await page.evaluate(() => document.documentElement.clientWidth)
  log(!(scrollW > clientW), `Mobile viewport has no horizontal scroll (scrollW=${scrollW} clientW=${clientW})`)

  // open mobile drawer
  await page.click('button[aria-label="Open navigation"]')
  await page.waitForSelector('aside >> text=Transactions', { timeout: 5000 })
  await page.click('aside >> text=Transactions')
  await page.waitForSelector('text=Record of all book issues and returns', { timeout: 10000 })
  log(true, 'Mobile drawer navigation works')
  const mobileErrors = errors.filter((e) => !e.includes('favicon'))
  log(mobileErrors.length === 0, `Mobile flow console errors: ${mobileErrors.length ? mobileErrors.join(' | ') : 'none'}`)
  await context.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`)
if (failed.length) {
  console.log('Failed:')
  failed.forEach((f) => console.log('  - ' + f.msg))
  process.exit(1)
}
