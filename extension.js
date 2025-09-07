/**
 * React UX Analyzer Extension - SIMPLE VERSION
 */
const vscode = require('vscode');
const { BreadcrumbDetector, LoadingDetector, FeedbackHandler } = require('./heuristics');

function activate(context) {
    console.log('🚀 React UX Analyzer extension is active!');
    vscode.window.showInformationMessage('✅ React UX Analyzer loaded!');

    const breadcrumbDetector = new BreadcrumbDetector();
    const loadingDetector = new LoadingDetector();
    const feedbackHandler = new FeedbackHandler();

    // Hello World command
    const helloCommand = vscode.commands.registerCommand('react-ux-analyzer.helloWorld', () => {
        vscode.window.showInformationMessage('🎉 Hello from React UX Analyzer!');
    });

    // Analyze Breadcrumbs command
    const analyzeCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeBreadcrumbs', () => {
        try {
            console.log('🔍 Starting analysis...');
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('❌ Please open a file first!');
                return;
            }

            const document = editor.document;
            const content = document.getText();
            const fileName = document.fileName;
            
            console.log('📄 Analyzing:', fileName);
            
            const patterns = breadcrumbDetector.detectBreadcrumbs(content);
            
            // Filter only missing breadcrumbs for clear output
            const missingBreadcrumbs = patterns.filter(p => p.type === 'missing-breadcrumb');
            
            console.log('✅ Found:', patterns.length, 'patterns');
            console.log('❌ Missing breadcrumbs:', missingBreadcrumbs.length);
            
            feedbackHandler.showResults({
                analysisType: 'BREADCRUMB',
                fileName: fileName,
                issues: missingBreadcrumbs,
                issueLabel: 'MISSING BREADCRUMBS'
            });
            
        } catch (error) {
            console.error('❌ Error:', error);
            vscode.window.showErrorMessage('Analysis failed: ' + error.message);
        }
    });

    // Analyze Loading command
    const analyzeLoadingCommand = vscode.commands.registerCommand('react-ux-analyzer.analyzeLoading', () => {
        try {
            console.log('⏳ Starting loading analysis...');
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('❌ Please open a file first!');
                return;
            }

            const document = editor.document;
            const content = document.getText();
            const fileName = document.fileName;
            
            console.log('📄 Analyzing loading patterns:', fileName);
            
            const patterns = loadingDetector.detectLoadingPatterns(content);
            
            // Filter only problems (warnings and suggestions) for clear output
            const loadingIssues = FeedbackHandler.filterIssues(patterns);
            
            console.log('✅ Found:', patterns.length, 'patterns');
            console.log('⚠️  Loading issues:', loadingIssues.length);
            
            feedbackHandler.showResults({
                analysisType: 'LOADING',
                fileName: fileName,
                issues: loadingIssues,
                issueLabel: 'LOADING ISSUES'
            });
            
        } catch (error) {
            console.error('❌ Error:', error);
            vscode.window.showErrorMessage('Loading analysis failed: ' + error.message);
        }
    });

    context.subscriptions.push(helloCommand);
    context.subscriptions.push(analyzeCommand);
    context.subscriptions.push(analyzeLoadingCommand);
    context.subscriptions.push(feedbackHandler); // Add feedbackHandler for proper cleanup
    
    console.log('✅ Commands registered!');
}

function deactivate() {}

module.exports = { activate, deactivate };
