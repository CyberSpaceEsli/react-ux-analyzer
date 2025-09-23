// screenshot.js
const puppeteer = require('puppeteer');

/**
 * @param {string} url - The URL to screenshot
 * @param {`${string}.png`} output - The filename (.png)
 */
async function takeFullPageScreenshot(url = 'http://localhost:3000', output = 'screenshot.png') {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.setViewport({width: 1080, height: 1024});

 await page.screenshot({ path: output, fullPage: true });

  await browser.close();
  console.log(`✅ Full-page screenshot saved to: ${output}`);
}

module.exports = takeFullPageScreenshot;