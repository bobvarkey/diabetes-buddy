const { chromium } = require('playwright');
const fs = require('fs');

const CDP_URL = 'http://127.0.0.1:18800';
const URL = 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today';
const OUT_DIR = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes';

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0] || browser;
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 10000));

  const html = await page.content();
  fs.writeFileSync(`${OUT_DIR}/x-diagnose.html`, html, 'utf8');

  await page.screenshot({ path: `${OUT_DIR}/x-diagnose.png`, fullPage: true });

  const hasArticle = await page.locator('article').count();
  const bodyText = await page.locator('body').textContent();

  console.log('Articles found:', hasArticle);
  console.log('Body text snippet:', bodyText.slice(0, 500));

  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
