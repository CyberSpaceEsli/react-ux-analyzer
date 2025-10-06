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
        console.log('🔍 Loading custom rule from:', filePath);

        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }

        // Clear any cached version and load the module
        let rule;
try {
  rule = require(path.resolve(filePath));
} catch (requireErr) {
  // Fallback: manual execution with Extension's dependencies
  console.log('🔄 Direct require failed, trying manual execution...', requireErr.message);
  
  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Provide Extension's dependencies to custom rules
    const customRequire = (moduleName) => {
      console.log(`🔍 Custom rule requesting: ${moduleName}`);
      
      // Provide Extension's Babel dependencies
      switch (moduleName) {
        case '@babel/parser':
          console.log('✅ Providing @babel/parser from Extension');
          return require('@babel/parser');
        case '@babel/traverse':
          console.log('✅ Providing @babel/traverse from Extension');
          return require('@babel/traverse');
        case 'vscode':
          console.log('✅ Providing vscode API from Extension');
          return vscode;
        // Add more dependencies as needed
        case 'fs':
          return require('fs');
        case 'path':
          return require('path');
        default:
          // Try normal require for other modules
          try {
            return require(moduleName);
          } catch (err) {
            throw new Error(`Dependency '${moduleName}' not available. Available: @babel/parser, @babel/traverse, vscode, fs, path`, err);
          }
      }
    };
    
    const moduleFunc = new Function('module', 'exports', 'require', '__filename', '__dirname', code);
    const module = { exports: {} };
    
    // Use custom require that provides Extension dependencies
    moduleFunc(module, module.exports, customRequire, filePath, path.dirname(filePath));
    rule = module.exports;
    
    console.log('✅ Custom rule loaded with Extension dependencies');
  } catch (manualErr) {
    throw new Error(`Failed to load custom rule: ${manualErr.message}`);
  }
}

        console.log('🔍 Rule loaded, structure:', Object.keys(rule));
        console.log('🔍 Detector type:', typeof rule.detector);

        // Validate rule structure
        if (typeof rule.detector === 'function') {
          const acceptsUrl = rule.detector.length >= 2;

          ruleModules.push({
            name: file.replace(/\.(js|cjs)$/, ''), // remove file extension
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