/**
 * React UX Analyzer Extension - SIMPLE VERSION
 */
const vscode = require('vscode');
const { BreadcrumbDetector } = require('./heuristics');

function activate(context) {
    console.log('🚀 React UX Analyzer extension is active!');
    vscode.window.showInformationMessage('✅ React UX Analyzer loaded!');

    const detector = new BreadcrumbDetector();

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
            
            const patterns = detector.detectBreadcrumbs(content);
            
            // Filter only missing breadcrumbs for clear output
            const missingBreadcrumbs = patterns.filter(p => p.type === 'missing-breadcrumb');
            
            console.log('✅ Found:', patterns.length, 'patterns');
            console.log('❌ Missing breadcrumbs:', missingBreadcrumbs.length);
            
            showResults(fileName, missingBreadcrumbs);
            
        } catch (error) {
            console.error('❌ Error:', error);
            vscode.window.showErrorMessage('Analysis failed: ' + error.message);
        }
    });

    context.subscriptions.push(helloCommand);
    context.subscriptions.push(analyzeCommand);
    
    console.log('✅ Commands registered!');
}

function showResults(fileName, missingBreadcrumbs) {
    const outputChannel = vscode.window.createOutputChannel('React UX Analyzer');
    outputChannel.clear();
    
    outputChannel.appendLine('=== BREADCRUMB ANALYSIS ===');
    outputChannel.appendLine(`File: ${fileName}`);
    outputChannel.appendLine(`Missing breadcrumbs: ${missingBreadcrumbs.length}`);
    outputChannel.appendLine('');
    
    if (missingBreadcrumbs.length > 0) {
        outputChannel.appendLine('❌ MISSING BREADCRUMBS:');
        missingBreadcrumbs.forEach((pattern, index) => {
            outputChannel.appendLine(`${index + 1}. Line ${pattern.line}: ${pattern.type}`);
            outputChannel.appendLine(`   Content: ${pattern.content}`);
            outputChannel.appendLine(`   Message: ${pattern.message}`);
            outputChannel.appendLine('');
        });
    }
    
    outputChannel.show();
    
    if (missingBreadcrumbs.length > 0) {
        vscode.window.showWarningMessage(`Found ${missingBreadcrumbs.length} breadcrumb issues! Check output panel.`);
    } else {
        vscode.window.showInformationMessage('No breadcrumb issues found!');
    }
}

function deactivate() {}

module.exports = { activate, deactivate };
