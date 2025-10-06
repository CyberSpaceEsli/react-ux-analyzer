const path = require('path');
//require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const vscode = require('vscode');
const { execSync } = require('child_process');
const fs = require('fs');
const takeFullPageScreenshot = require('./screenshot/take-screenshot');

async function runNimaCheck(url) {
  try {
      // Load URL from .env or fallback
      //const url = process.env.REACT_APP_URL || 'http://localhost:3000';
      if (!url) {
        const config = vscode.workspace.getConfiguration('react-ux-analyzer');
        url = config.get('targetUrl') || 'http://localhost:3000';
      }

      if (!url.startsWith('http')) {
        throw new Error(`Invalid URL: "${url}" — must start with http://`);
      }

      // Set python and screenshot paths
      //const debugPythonPath = path.resolve(__dirname, process.env.PYTHON_PATH);
      //const pythonPath = debugPythonPath;

      // Get workspace root 
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
          throw new Error('No workspace folder opened. Please open your React project folder.');
      }

      // Adjust the python path according to your OS for venv location in project root
      const venvPythonPath = path.resolve(workspaceRoot, 'venv/bin/python3'); // Mac/Linux
      // const venvPythonPath = path.resolve(workspaceRoot, 'venv/Scripts/python.exe'); // Windows

        if (!fs.existsSync(venvPythonPath)) {
          throw new Error(`Virtual environment not found at: ${venvPythonPath}`);
        }

      const pythonPath = venvPythonPath;

     try {
        const version = execSync(`"${pythonPath}" --version`, { encoding: 'utf-8' });
        console.log('✅ Python version:', version.trim());
      } catch (err) {
        throw new Error('Python not found. Please check your virtual environment setup.', err);
      }

      // Check if required Python packages are available
      try {
        const packages = execSync(`"${pythonPath}" -c "import tensorflow, numpy; print('Packages OK')"`, { encoding: 'utf-8' });
        console.log('✅ Package check:', packages.trim());
      } catch (err) {
        throw new Error(`Required packages not found in venv. Error: ${err.message}`);
    }

    const screenshotPath = path.resolve(__dirname, './screenshot/screenshot.png');
    const scriptPath = path.resolve(__dirname, './python/run_nima.py');

    // Check if Python script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script NIMA not found at: ${scriptPath}`);
    }

    // Take screenshot
    console.log('🔍 env REACT_APP_URL:', process.env.REACT_APP_URL);
    console.log(`📸 Taking screenshot of: ${url}`);
    try {
      // @ts-ignore
      await takeFullPageScreenshot(url, screenshotPath);
    } catch (screenshotErr) {
      throw new Error(`Failed to take screenshot: ${screenshotErr.message}`);
    }

    // Run Python scoring
    console.log('🤖 Running NIMA Python scoring...');
    let result;
    try {
      result = execSync(
    `"${pythonPath}" "${scriptPath}" "${screenshotPath}"`,
    { encoding: 'utf-8' }
    );
    } catch (pyErr) {
      throw new Error(`Python script failed: ${pyErr.message}`);
    }

    // Cleanup screenshot
    fs.unlink(screenshotPath, (err) => {
        if (err) console.warn('Could not delete screenshot:', err);
        else console.log('🧹 Screenshot deleted');
    });

    // Parse output
    const output = result.trim();
    if (!output.includes(',')) {
      throw new Error(`Unexpected output from Python script: "${output}"`);
    }

    const [mean, std] = output.split(',').map(Number);

    if (isNaN(mean) || isNaN(std)) {
      throw new Error(`Could not parse scores. Output was: "${output}"`);
    }

    return { mean, std };

  } catch (err) {
    console.error('❗ NIMA check failed:', err.message);
    return { mean: null, std: null, error: err.message };
  }
}

module.exports = runNimaCheck;