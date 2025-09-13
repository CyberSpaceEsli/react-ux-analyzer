/**
 * React UX Analyzer Extension
 * - Separate commands per detector
 * - Project-wide usability scan for JSX files in `src`
 */
const vscode = require('vscode');
const { detectBreadcrumbs, detectLoadingPatterns, detectControlExits, detectPageConsistency, FeedbackHandler } = require('./heuristics');

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

  // Project-wide command: Analyze all React files in src folder
  const analyzeProjectCommand = vscode.commands.registerCommand('react-ux-analyzer.usabilityAnalyzeReactFiles', usabilityAnalyzeReactFiles);

  // Register all commands
  context.subscriptions.push(analyzeBreadcrumbCommand);
  context.subscriptions.push(analyzeLoadingCommand);
  context.subscriptions.push(analyzeControlExitCommand);
  context.subscriptions.push(analyzeProjectCommand);
  context.subscriptions.push(analyzePageConsistencyCommand);

  console.log('✅ React UX Analyzer commands registered!');
}

function deactivate() {}

module.exports = { activate, deactivate };