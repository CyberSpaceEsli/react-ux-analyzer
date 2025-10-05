/**
 * React UX Analyzer Extension
 * - One unified command for heuristic detectors (except #2 and #8)
 * - Separate commands per detector
 * - Push collected issues to feedback-handler
 */
const vscode = require('vscode');
const http = require('http');
const { detectBreadcrumbs, detectLoadingPatterns, detectMatchSystemwithRealWorld, detectControlExits, detectPageConsistency, detectErrorPrevention, detectRecognitionCues, detectShortcuts, detectAestheticMinimalism, detectHelpErrorRecognition, detectHelpFeatures, FeedbackHandler } = require('./src/heuristics');
const { detectBusinessDomain } = require('./src/heuristics/2-match-system-with-real-world/language-analyzer.js');
const { extractVisibleTextFromCode } = require('./src/heuristics/utils/extractVisibleText');
const { runVisualQualityCheck } = require('./src/visual-quality-analysis');
const { loadCustomRules } = require('./src/heuristics/utils/load-custom-rules');

let feedbackHandler;
let detectors;

async function usabilityAnalyzeReactFiles() {
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Scanning React files for UX issues...",
    cancellable: false
  }, async () => {
    feedbackHandler.clearAll();
    let totalIssues = 0;
    const files = await vscode.workspace.findFiles('**/*.jsx', '**/node_modules/**');
    for (const file of files) {
      const document = await vscode.workspace.openTextDocument(file);
      const content = document.getText();
      const fileName = document.fileName;
      try {
        let fileIssues = [];
        for (const detector of detectors) {
          let issues = [];
          try {
            issues = await detector.fn(content);
          } catch (err) {
            console.error(`❌ Detector "${detector.type}" failed:`, err);
          }
          if (issues.length > 0) {
            totalIssues += issues.length;
            fileIssues.push(...issues.map(issue => ({
              ...issue,
              analysisType: detector.type
            })));
          }
        }
        feedbackHandler.showResults(fileName, fileIssues);
      } catch (err) {
        console.error(`❌ General analysis error for ${fileName}:`, err);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    vscode.window.showWarningMessage(` React UX Analyzer found ${totalIssues} issue(s).`);
  });
}

function activate(context) {
  console.log('🚀 React UX Analyzer extension is active!');
  vscode.window.showInformationMessage('✅ React UX Analyzer loaded!');

  feedbackHandler = new FeedbackHandler();
  const secretStorage = context.secrets;

  detectors = [
    { fn: detectBreadcrumbs, type: 'BREADCRUMB' },
    { fn: detectLoadingPatterns, type: 'LOADING' },
    { fn: detectControlExits, type: 'CONTROL' },
    { fn: detectPageConsistency, type: 'CONSISTENCY' },
    { fn: detectErrorPrevention, type: 'ERROR_PREVENTION' },
    { fn: detectRecognitionCues, type: 'RECOGNITION' },
    { fn: detectShortcuts, type: 'FLEXIBILITY_EFFICIENCY' },
    { fn: detectHelpErrorRecognition, type: 'ERROR_RECOVERY' },
    { fn: detectHelpFeatures, type: 'HELP' }
    // async functions
    /*{fn: detectMatchSystemwithRealWorld, type: 'MATCH_SYSTEM_REAL_WORLD'}*/
    /*{fn: detectAestheticMinimalism, type: 'AESTHETIC_MINIMALISM'}*/
  ];

  // Watch for .jsx file saves and trigger heuristic analysis
  vscode.workspace.onDidSaveTextDocument((document) => {
  if (document.languageId === 'javascriptreact' || document.fileName.endsWith('.jsx')) {
    usabilityAnalyzeReactFiles();
  }
  });

  // Command: Set OpenRouter API Key
  const setKeyCommand = vscode.commands.registerCommand('react-ux-analyzer.setApiKey', async () => {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenRouter API key (sk-...)',
      ignoreFocusOut: true,
      password: true,
    });

    if (apiKey && apiKey.startsWith('sk-')) {
    await secretStorage.store('openrouterApiKey', apiKey);
    vscode.window.showInformationMessage('🔐 Your OpenRouter API key has been saved securely!');
  } else {
    vscode.window.showErrorMessage('❌ Invalid API key. It must start with "sk-".');
  }
  });

  // Command: Clear OpenRouter API Key
  const clearKeyCommand =  vscode.commands.registerCommand('react-ux-analyzer.clearApiKey', async () => {
  await secretStorage.delete('openrouterApiKey');
  vscode.window.showInformationMessage('🗑️ OpenRouter API key deleted from secret storage.');
  });

  // Command: Analyze Breadcrumb in current file
  const analyzeBreadcrumbCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeBreadcrumbs', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectBreadcrumbs(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'BREADCRUMB'
      })));
    } catch (err) {
      console.error(`Error running Breadcrumb detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Breadcrumb analysis failed: ${err.message}`);
    }
  });

  // Command: Analyze Loading Patterns in current file 
  const analyzeLoadingCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeLoading', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectLoadingPatterns(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'LOADING'
      })));
    } catch (err) {
      console.error(`Error running Loading detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Loading analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Match System with Real World
  const analyzeMatchSystemCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeMatchSystem', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    const apiKey = await context.secrets.get('openrouterApiKey');

    if (!apiKey) {
      vscode.window.showErrorMessage('❌ Please set your OpenRouter API key using the command: React UX Analyzer: Set API Key');
      return;
    }

    const availableDomains = ['health', 'legal', 'finance', 'e-commerce', 'information technology', 'education'];
    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing jargon...",
            cancellable: false
        }, async (progress) => {
        try {
            progress.report({ increment: 10, message: "Analyzing current file..." });
            
            progress.report({ increment: 40, message: "Detecting business domain with AI..." });

            const visibleText = extractVisibleTextFromCode(content);
            const visibleTextAsString = visibleText.map(t => t.text).join(' ').trim();
            const domain = await detectBusinessDomain(visibleTextAsString, availableDomains, apiKey);

            console.log('🧠 DEBUG Detected domain from hardcoded input:', domain);
            
            progress.report({ increment: 60, message: `Running UI text analysis (${domain})...` });

            // Run the JSX analyzer with the detected domain
            const issues = await detectMatchSystemwithRealWorld(visibleText, domain, apiKey);

            progress.report({ increment: 100, message: "Jargon analysis complete." });

            feedbackHandler.showResults(
              fileName,
              issues.map((issue) => ({
                ...issue,
                analysisType: 'MATCH_SYSTEM_REAL_WORLD',
              }))
            );

        } catch (err) {
          console.error('Match system error:', err);
          vscode.window.showErrorMessage('❌ Analysis failed: ' + err.message);
        }
      }
    );
  });

  // Command: Analyze Control Exit
  const analyzeControlExitCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeControlExits', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectControlExits(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'CONTROL'
      })));
    } catch (err) {
      console.error(`Error running Control Exit detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Control Exit analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Page Consistency
  const analyzePageConsistencyCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzePageConsistency', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectPageConsistency(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'CONSISTENCY'
      })));
    } catch (err) {
      console.error(`Error running Page Consistency detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Page Consistency analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Error Prevention
  const analyzeErrorPreventionCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeErrorPrevention', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectErrorPrevention(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'ERROR_PREVENTION'
      })));
    } catch (err) {
      console.error(`Error running Error Prevention detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Error Prevention analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Recognition Cues
  const analyzeRecognitionCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeRecognition', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectRecognitionCues(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'RECOGNITION'
      })));
    } catch (err) {
      console.error(`Error running Recognition Cues detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Recognition Cues analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Shortcuts and Efficiency
  const analyzeShortcutsCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeShortcuts', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectShortcuts(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'FLEXIBILITY_EFFICIENCY'
      })));
    } catch (err) {
      console.error(`Error running Shortcuts detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Shortcuts analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Aesthethics and Minimalistic Layouts
  const analyzeMinimalismCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeMinimalism', async () => {
   const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;
    
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Detecting Aesthetic & Minimalism...",
        cancellable: false
      }, async (progress) => {
        try {
          progress.report({ increment: 30, message: "Running minimalism analysis..." });
          const issues = await detectAestheticMinimalism(content);
          progress.report({ increment: 100, message: "Analysis complete." });

          feedbackHandler.showResults(fileName, issues.map(issue => ({
            ...issue,
            analysisType: 'AESTHETIC_MINIMALISM'
          })));
        } catch (err) {
          console.error(`Error running Aesthetic Minimalism detector on ${fileName}:`, err);
          vscode.window.showErrorMessage(`Aesthetic Minimalism analysis failed: ${err.message}`);
        }
      });
  });

  //Command: Analyze Help Error Recognition
  const analyzeHelpErrorCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeHelpError', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectHelpErrorRecognition(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'ERROR_RECOVERY'
      })));
    } catch (err) {
      console.error(`Error running Help Error Recognition detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Help Error Recognition analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Help Features
  const analyzeHelpCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeHelp', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    feedbackHandler.clearAll();

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectHelpFeatures(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'HELP'
      })));
    } catch (err) {
      console.error(`Error running Help Features detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Help Features analysis failed: ${err.message}`);
    }
  });

  /**
   * Checks if the local dev server is running
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  function isServerRunning(url) {
    return new Promise((resolve) => {
      try {
        const { hostname, port, pathname } = new URL(url);
        const options = {
          method: 'GET',
          hostname,
          port,
          path: pathname || '/',
          timeout: 2000,
        };

        const req = http.request(options, (res) => {
          console.log(`📡 Server responded with status: ${res.statusCode}`);
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });

        req.on('error', (err) => {
          console.log('❌ Server not reachable:', err);
          resolve(false);
        });

        req.on('timeout', () => {
          console.log('⏱️ Server check timed out.');
          req.destroy();
          resolve(false);
        });

        req.end();
      } catch (err) {
        console.error('Error checking server status:', err);
        resolve(false);
      }
    });
  }

  // Command: Score visual quality with NIMA
  vscode.commands.registerCommand('react-ux-analyzer.analyzeVisualQuality', async () => {
    // Check if dev server is running
    const url = process.env.REACT_APP_URL || 'http://localhost:5173';
    const isRunning = await isServerRunning(url);
    console.log('✅ isRunning:', isRunning);
    feedbackHandler.clearAll();

    if (!isRunning) {
      vscode.window.showErrorMessage(
        `❌ Cannot run visual analysis — React app not reachable at ${url}. Please start your dev server.`
      );
      return;
    }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Running Visual Quality Analysis...',
          cancellable: false,
        },
        async () => {
          try {
            const { mean, std, error } = await runVisualQualityCheck();
            const issues = [];

            // feedback information for NIMA score
            if (mean && std) {
              issues.push({
                line: 1,
                type: "nima-score",
                severity: "info",
                message: `NIMA Visual Quality Score: ${mean.toFixed(2)} (±${std.toFixed(2)})`,
                analysisType: "NIMA",
                action: "Review the visual quality score for your UI.",
                why: "A higher NIMA score indicates better perceived visual quality.",
                mean,
                std
              });
            }

            feedbackHandler.showResults('Visual Quality Analysis', issues);

            if (error) {
              vscode.window.showErrorMessage(`❌ NIMA Error: ${error}`);
            }
          } catch (err) {
            vscode.window.showErrorMessage(`Unexpected error with NIMA: ${err.message}`);
          }
        }
      );
    });

    // Command: Analyze Custom UX Rules
    const analyzeCustomRulesCommand =  vscode.commands.registerCommand('react-ux-analyzer.analyzeCustomRules', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    // Get preview URL from settings or default
    const url = vscode.workspace.getConfiguration('react-ux-analyzer').get('previewUrl') || 'http://localhost:3000';

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Running custom UX rules...",
      cancellable: false
    }, async (progress) => {
      try {
        progress.report({ increment: 30, message: "Loading custom rules..." });
        const rules = await loadCustomRules();

        const feedback = [];

        for (const rule of rules) {
          progress.report({ increment: 10, message: `Running ${rule.name}` });
          try {
            // If a rule acceptsURL is true, pass url; otherwise just pass content
            const result = rule.acceptsUrl
              ? await rule.run(content, url)
              : await rule.run(content);

            if (Array.isArray(result)) {
              feedback.push(...result.map(issue => ({
                ...issue,
                analysisType: `CUSTOM:${rule.name}`
              })));
            }
          } catch (err) {
            console.warn(`⚠️ Error in custom rule '${rule.name}':`, err.message);
          }
        }

        progress.report({ increment: 100, message: "Custom rule analysis complete." });

        feedbackHandler.showResults(fileName, feedback);

      } catch (err) {
        console.error(`Error running custom rules on ${fileName}:`, err);
        vscode.window.showErrorMessage(`Custom UX rule analysis failed: ${err.message}`);
      }
    });
  });

  // Project-wide command: Analyze all React files
  const analyzeProjectCommand = vscode.commands.registerCommand('react-ux-analyzer.usabilityAnalyzeReactFiles', usabilityAnalyzeReactFiles);

  // Register all commands
  context.subscriptions.push(setKeyCommand);
  context.subscriptions.push(clearKeyCommand);
  context.subscriptions.push(analyzeProjectCommand);
  context.subscriptions.push(analyzeBreadcrumbCommand);
  context.subscriptions.push(analyzeLoadingCommand);
  context.subscriptions.push(analyzeMatchSystemCommand);
  context.subscriptions.push(analyzeControlExitCommand);
  context.subscriptions.push(analyzePageConsistencyCommand);
  context.subscriptions.push(analyzeErrorPreventionCommand);
  context.subscriptions.push(analyzeRecognitionCommand);
  context.subscriptions.push(analyzeShortcutsCommand);
  context.subscriptions.push(analyzeMinimalismCommand);
  context.subscriptions.push(analyzeHelpErrorCommand);
  context.subscriptions.push(analyzeHelpCommand);
  context.subscriptions.push(analyzeCustomRulesCommand);

  console.log('✅ React UX Analyzer commands registered!');
}

function deactivate() {}

module.exports = { activate, deactivate };