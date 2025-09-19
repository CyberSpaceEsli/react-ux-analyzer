/**
 * React UX Analyzer Extension
 * - Separate commands per detector
 * - Project-wide usability scan for JSX files in `src`
 */
const vscode = require('vscode');
const { detectBreadcrumbs, detectLoadingPatterns, detectMatchSystemwithRealWorld, detectControlExits, detectPageConsistency, detectErrorPrevention, detectRecognitionCues, detectShortcuts, detectHelpErrorRecognition, detectHelpFeatures, FeedbackHandler } = require('./src/heuristics');
const { detectBusinessDomain } = require('./src/heuristics/2-match-system-with-real-world/languageAnalyzer.js');
const { extractVisibleTextFromCode } = require('./src/heuristics/utils/extractVisibleText');

async function usabilityAnalyzeReactFiles() {
  const feedbackHandler = new FeedbackHandler();

  // Only scan src folder for JS/TS/JSX/TSX files
  const files = await vscode.workspace.findFiles('src/**/*.{jsx}');

  if (files.length === 0) {
    vscode.window.showInformationMessage('No React source files found in the src folder.');
    return;
  }

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const content = document.getText();
    const fileName = document.fileName;

    try {
      // --- Breadcrumb detector ---
      const issues = detectBreadcrumbs(content);

      if (issues.length > 0) {
        feedbackHandler.showResults(fileName, issues.map(issue => ({
          ...issue,
          analysisType: 'BREADCRUMB'
        })));
      }

    // --- Loading detector ---
    const loadingIssues = detectLoadingPatterns(content);
    if (loadingIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        loadingIssues.map(issue => ({ ...issue, analysisType: 'LOADING' }))
      );
    }

    // --- Match System with Real World detector ---
    const matchSystemIssues = await detectMatchSystemwithRealWorld(content);
    if (matchSystemIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        matchSystemIssues.map(issue => ({ ...issue, analysisType: 'MATCH_SYSTEM_REAL_WORLD' }))
      );
    }
    
    // --- Control Exit detector ---
    const controlExitIssues = detectControlExits(content);
    if (controlExitIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        controlExitIssues.map(issue => ({ ...issue, analysisType: 'CONTROL' }))
      );
    }
    // --- Page Consistency detector ---
    const consistencyIssues = detectPageConsistency(content);
    if (consistencyIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        consistencyIssues.map(issue => ({ ...issue, analysisType: 'CONSISTENCY' }))
      );
    }

    // --- Error Prevention detector ---
    const errorPreventionIssues = detectErrorPrevention(content);
    if (errorPreventionIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        errorPreventionIssues.map(issue => ({ ...issue, analysisType: 'ERROR_PREVENTION' }))
      );
    }

    // --- Recognition Cues detector ---  
    const recognitionIssues = detectRecognitionCues(content); 
    if (recognitionIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        recognitionIssues.map(issue => ({ ...issue, analysisType: 'RECOGNITION' }))
      );
    }

    // --- Shortcuts detector ---
    const  shortcutIssues = detectShortcuts(content);
    if (shortcutIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        shortcutIssues.map(issue => ({ ...issue, analysisType: 'FLEXIBILITY & EFFICIENCY' }))
      );
    }

    // --- Help Error Recognition detector ---
    const helpErrorIssues = detectHelpErrorRecognition(content);
    if (helpErrorIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        helpErrorIssues.map(issue => ({ ...issue, analysisType: 'ERROR_RECOVERY' }))
      );
    }

    // --- Help Features detector ---
    const helpIssues = detectHelpFeatures(content);
    if (helpIssues.length > 0) {
      feedbackHandler.showResults(
        fileName,
        helpIssues.map(issue => ({ ...issue, analysisType: 'HELP' }))
      );
    }

    // Add more Detectors here...

    } catch (err) {
      console.error(`Error running Breadcrumb detector on ${fileName}:`, err);
    }
  }

  vscode.window.showInformationMessage(`✅ React UX Analyzer finished scanning ${files.length} file(s) in src.`);
}

function activate(context) {
  console.log('🚀 React UX Analyzer extension is active!');
  vscode.window.showInformationMessage('✅ React UX Analyzer loaded!');

  const feedbackHandler = new FeedbackHandler();

  // Command: Analyze Breadcrumb in current file
  const analyzeBreadcrumbCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeBreadcrumbs', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

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

    const availableDomains = ['health', 'legal', 'finance', 'e-commerce', 'information technology', 'education'];

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

            // Find all relevant files in the workspace
            //const files = await vscode.workspace.findFiles('**/*.{jsx,tsx}');
            //let combinedText = '';

            // Concatenate text from files for analysis
           /*for (const file of files) {
            const code = await vscode.workspace.openTextDocument(file).then(d => d.getText());
            const visibleText = extractVisibleTextFromCode(code); // only human-readable UI strings
            combinedText += visibleText + " ";
          }*/
            
            progress.report({ increment: 40, message: "Detecting business domain with AI..." });

            /*const domain = await detectBusinessDomain(content, availableDomains) || 'general';
            console.log('📤 Sending domain detection prompt...');
            console.log('⛳ text:', content.substring(0, 300).replace(/\s+/g, ' ') + '...');
            vscode.window.showInformationMessage(`✅ Domain: '${domain}'`);*/

            const visibleText = extractVisibleTextFromCode(content);
            const visibleTextAsString = visibleText.map(t => t.text).join(' ').trim();
            const domain = await detectBusinessDomain(visibleTextAsString, availableDomains);
            //const debugText = "As a user, I want to track my order using the SKU code provided in the confirmation email. The fulfillment center should update the status regularly.";

            //const domain = await detectBusinessDomain(debugText, availableDomains);
            console.log('🧠 DEBUG Detected domain from hardcoded input:', domain);

            /*const detectedDomain = await detectBusinessDomain(combinedText, availableDomains);
            const domain = detectedDomain || 'general';*/
            
            progress.report({ increment: 60, message: `Running UI text analysis (${domain})...` });

            // Now run the JSX analyzer with the detected domain
            const issues = await detectMatchSystemwithRealWorld(visibleText, domain);

            progress.report({ increment: 100, message: "Jargon analysis complete." });

            feedbackHandler.showResults(
              fileName,
              issues.map((issue) => ({
                ...issue,
                analysisType: 'MATCH_SYSTEM_REAL_WORLD',
              }))
            );

            /*if (detectedDomain) {
            const config = vscode.workspace.getConfiguration('react-ux-analyzer');
            await config.update('businessField', detectedDomain, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`✅ Domain: '${detectedDomain}'`);
          } else {
            vscode.window.showWarningMessage('⚠️ Could not determine business domain.');
          }*/
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

    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;

    try {
      const issues = detectShortcuts(content);

      feedbackHandler.showResults(fileName, issues.map(issue => ({
        ...issue,
        analysisType: 'FLEXIBILITY & EFFICIENCY'
      })));
    } catch (err) {
      console.error(`Error running Shortcuts detector on ${fileName}:`, err);
      vscode.window.showErrorMessage(`Shortcuts analysis failed: ${err.message}`);
    }
  });

  //Command: Analyze Help Error Recognition
  const analyzeHelpErrorCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeHelpError', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('❌ Please open a file first!');
      return;
    }

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

  // Project-wide command: Analyze all React files in src folder
  const analyzeProjectCommand = vscode.commands.registerCommand('react-ux-analyzer.usabilityAnalyzeReactFiles', usabilityAnalyzeReactFiles);

  // Register all commands
  context.subscriptions.push(analyzeBreadcrumbCommand);
  context.subscriptions.push(analyzeLoadingCommand);
  context.subscriptions.push(analyzeMatchSystemCommand);
  context.subscriptions.push(analyzeControlExitCommand);
  context.subscriptions.push(analyzeProjectCommand);
  context.subscriptions.push(analyzePageConsistencyCommand);
  context.subscriptions.push(analyzeErrorPreventionCommand);
  context.subscriptions.push(analyzeRecognitionCommand);
  context.subscriptions.push(analyzeShortcutsCommand);
  context.subscriptions.push(analyzeHelpErrorCommand);
  context.subscriptions.push(analyzeHelpCommand);

  console.log('✅ React UX Analyzer commands registered!');
}

function deactivate() {}

module.exports = { activate, deactivate };