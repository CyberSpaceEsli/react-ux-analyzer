const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { execSync } = require('child_process');
const fs = require('fs');
const takeFullPageScreenshot = require('./screenshot/take-screenshot');

async function runNimaCheck() {
  try {
    // 1. Load URL from .env or fallback
    const url = process.env.REACT_APP_URL || 'http://localhost:3000';
    if (!url.startsWith('http')) {
      throw new Error(`Invalid URL: "${url}" — must start with http://`);
    }

    // 2. Set paths
    const pythonPath = path.resolve(__dirname, './venv/bin/python3');
    const screenshotPath = path.resolve(__dirname, './screenshot/screenshot.png');
    const scriptPath = path.resolve(__dirname, './python/run_nima.py');

    // 3. Check if Python script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script NIMA not found at: ${scriptPath}`);
    }

    // 4. Take screenshot
    console.log('🔍 env REACT_APP_URL:', process.env.REACT_APP_URL);
    console.log(`📸 Taking screenshot of: ${url}`);
    try {
      // @ts-ignore
      await takeFullPageScreenshot(url, screenshotPath);
    } catch (screenshotErr) {
      throw new Error(`❌ Failed to take screenshot: ${screenshotErr.message}`);
    }

    // 5. Run Python scoring
    console.log('🤖 Running NIMA Python scoring...');
    let result;
    try {
      result = execSync(
    `"${pythonPath}" "${scriptPath}" "${screenshotPath}"`,
    { encoding: 'utf-8' }
    );
    } catch (pyErr) {
      throw new Error(`❌ Python script failed: ${pyErr.message}`);
    }

    // Cleanup screenshot
    fs.unlink(screenshotPath, (err) => {
        if (err) console.warn('Could not delete screenshot:', err);
        else console.log('🧹 Screenshot deleted');
    });

    // 6. Parse output
    const output = result.trim();
    if (!output.includes(',')) {
      throw new Error(`Unexpected output from Python script: "${output}"`);
    }

    const [mean, std] = output.split(',').map(Number);

    if (isNaN(mean) || isNaN(std)) {
      throw new Error(`Could not parse scores. Output was: "${output}"`);
    }

    console.log(`✅ NIMA Score: ${mean.toFixed(2)} (±${std.toFixed(2)})`);
    return { mean, std };

  } catch (err) {
    console.error('❗ NIMA check failed:', err.message);
    return { mean: null, std: null, error: err.message };
  }
}

module.exports = runNimaCheck;