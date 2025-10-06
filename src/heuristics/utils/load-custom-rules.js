const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

/**
 * Loads custom UX rules from user-specified path in .vscode/settings.json
 * Each rule module must export a `detector(content)` or `detector(content, url)` function.
 *
 * @returns {Promise<Array<{ name: string, run: Function, acceptsUrl: boolean }>>}
 */
async function loadCustomRules() {
  try {
    const config = vscode.workspace.getConfiguration('react-ux-analyzer');
    const fallbackRuleDir = config.get('customRulePath') || 'public/custom-ux-rules';
    const fallbackUrl = config.get('targetUrl') || 'http://localhost:3000';

    if (!fallbackRuleDir) {
      vscode.window.showInformationMessage('ℹ️ No customRulePath configured in .vscode/settings.json');
      return [];
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      vscode.window.showWarningMessage('⚠️ No workspace folder open. Cannot load custom rules.');
      return [];
    }

    const resolvedDir = path.join(workspaceFolder, fallbackRuleDir);
    if (!fs.existsSync(resolvedDir)) {
      vscode.window.showWarningMessage(`⚠️ Custom rule folder not found at: ${resolvedDir}`);
      return [];
    }

    // Read all .js and .cjs files in the directory of custom rules
    const jsFiles = fs.readdirSync(resolvedDir).filter(f => f.endsWith('.js') || f.endsWith('.cjs'));

    // Array to hold loaded rule modules
    const ruleModules = [];

    // Dynamically import each rule module
    for (const file of jsFiles) {
      const filePath = path.join(resolvedDir, file);

      try {
        const rule = require(filePath);

        // Validate rule structure
        if (typeof rule.detector === 'function') {
          const acceptsUrl = rule.detector.length >= 2;

          ruleModules.push({
            name: file,
            run: rule.detector, // function(content) or function(content, url)
            acceptsUrl, // true if detector(content, url)
            overrideUrl: acceptsUrl ? fallbackUrl : undefined // pass URL if detector accepts it
          });
        } else {
          vscode.window.showWarningMessage(`⚠️ Skipped ${file}: missing exported 'detector(content)' function.`);
        }
      } catch (err) {
        vscode.window.showErrorMessage(`❌ Error loading custom rule '${file}': ${err.message}`);
      }
    }

    // Return the loaded rule modules
    return ruleModules;
  } catch (err) {
    vscode.window.showErrorMessage(`❌ Failed to load custom UX rules: ${err.message}`);
    return [];
  }
}

module.exports = { loadCustomRules };