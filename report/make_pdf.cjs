// Renders report.html to PDF with headless Chromium (Playwright).
const { chromium } = require('/Users/coldkey/SE-Practice06-RoomBooking/tools/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'report.html'), { waitUntil: 'load' });
  const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')));
  if (broken.length) { console.error('BROKEN IMAGES', broken); process.exit(1); }
  await page.pdf({ path: path.join(__dirname, process.argv[2]), format: 'A4', printBackground: true });
  await browser.close();
  console.log('pdf ok');
})();
