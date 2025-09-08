/**
 * FeedbackHandler - Centralized feedback management for React UX Analyzer
 * 
 * This class provides consistent output formatti            'LOADING': {
                'loader-missing-ast': 'Add a spinner, skeleton, or "Loading…" so users see the system is working.',
                'missing-submit-feedback': 'Add a spinner, skeleton, or "Loading…" so users see the system is working.',
                'missing-effect-loading': 'Add a spinner, skeleton, or "Loading…" so users see the system is working.'
            }and VS Code integration
 * for all UX heuristic detectors. It standardizes how issues are displayed
 * to users and ensures uniform feedback across different analysis types.
 * 
 * Features:
 * - VS Code Problems panel integration for developer-friendly workflow
 * - Actionable feedback with clear fix instructions
 * - Frontend-friendly language without UX jargon
 * - Consistent messaging structure across all heuristics
 * - Direct links to file locations and documentation
 * - Nielsen heuristic identification for context
 */

const vscode = require('vscode');

class FeedbackHandler {
    constructor() {
        this.outputChannel = null;
        this.diagnosticsCollection = null;
        
        // Create diagnostics collection for Problems panel
        this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('react-ux-analyzer');
    }

    /**
     * Show analysis results in VS Code Problems panel and output channel
     * @param {Object} options - Analysis configuration
     * @param {string} options.analysisType - Type of analysis (e.g., 'BREADCRUMB', 'LOADING')
     * @param {string} options.fileName - Full path to analyzed file
     * @param {Array} options.issues - Array of detected issues
     * @param {string} options.issueLabel - Label for issues section (e.g., 'MISSING BREADCRUMBS', 'LOADING ISSUES')
     */
    showResults(options) {
        const { analysisType, fileName, issues } = options;
        
        // Clear previous diagnostics for this file
        this.diagnosticsCollection.clear();
        
        // Show in Problems panel
        this._showInProblemsPanel(fileName, issues, analysisType);
        
        // Also show in output channel for detailed view
        this._showInOutputChannel(options);
        
        // Show user notification
        this._showUserNotification(analysisType, issues.length);
    }

    /**
     * Display issues in VS Code Problems panel with actionable feedback
     * @param {string} fileName - Full path to the file
     * @param {Array} issues - Array of issue objects
     * @param {string} analysisType - Type of analysis for context
     */
    _showInProblemsPanel(fileName, issues, analysisType) {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(
                Math.max(0, issue.line - 1), 0,  // line is 0-based in VS Code
                Math.max(0, issue.line - 1), 1000  // extend to end of line
            );
            
            const diagnostic = new vscode.Diagnostic(
                range,
                this._createDeveloperFriendlyMessage(issue, analysisType),
                this._mapSeverityToVSCode(issue.severity)
            );
            
            // Add metadata for enhanced context
            diagnostic.source = 'React UX Analyzer';
            diagnostic.code = {
                value: this._getHeuristicCode(analysisType),
                target: this._getDocumentationLink(analysisType)
            };
            
            return diagnostic;
        });
        
        const uri = vscode.Uri.file(fileName);
        this.diagnosticsCollection.set(uri, diagnostics);
    }

    /**
     * Create developer-friendly, actionable message without UX jargon
     * @param {Object} issue - Issue object with details
     * @param {string} analysisType - Type of analysis for context
     * @returns {string} Developer-friendly message with clear fix instructions
     */
    _createDeveloperFriendlyMessage(issue, analysisType) {
        const heuristic = this._getHeuristicName(analysisType);
        const problem = this._describeProblem(issue, analysisType);
        const solution = this._provideActionableSolution(issue, analysisType);
        const why = this._explainWhy(issue, analysisType);
        
        return `${problem} ${solution} ${why} (${heuristic})`;
    }

    /**
     * Describe what went wrong in frontend-friendly terms
     * @param {Object} issue - Issue details
     * @param {string} analysisType - Analysis context
     * @returns {string} Clear problem description
     */
    _describeProblem(issue, analysisType) {
        const problemTemplates = {
            'BREADCRUMB': {
                'missing-breadcrumb': 'Missing navigation breadcrumbs in component.'
            },
            'LOADING': {
                'loader-missing-ast': 'Missing loading indicator.',
                'missing-submit-feedback': 'Missing loading indicator.',
                'missing-effect-loading': 'Missing loading indicator.'
            }
        };
        
        return problemTemplates[analysisType]?.[issue.type] || 
               `${issue.type.replace(/-/g, ' ')} detected.`;
    }

    /**
     * Provide clear, actionable solution instructions
     * @param {Object} issue - Issue details
     * @param {string} analysisType - Analysis context
     * @returns {string} Step-by-step fix instructions
     */
    _provideActionableSolution(issue, analysisType) {
        const solutionTemplates = {
            'BREADCRUMB': {
                'missing-breadcrumb': 'Add <Breadcrumb> component or <nav aria-label="breadcrumb"> element near the top of this component.'
            },
            'LOADING': {
                'missing-loading': 'Add a spinner, skeleton, progress bar or “Loading…” messages.',
                'loader-missing-ast': 'Add a spinner, skeleton, progress bar or “Loading…” messages.',
                'missing-submit-feedback': 'Add a spinner, skeleton, progress bar or “Loading…” messages.',
                'missing-effect-loading': 'Add a spinner, skeleton, progress bar or “Loading…” messages.'
            }
        };
        
        return solutionTemplates[analysisType]?.[issue.type] || 
               'Review the code pattern and add appropriate feedback mechanism.';
    }

    /**
     * Explain why this matters for user experience
     * @param {Object} issue - Issue details
     * @param {string} analysisType - Analysis context
     * @returns {string} Brief explanation of user impact
     */
    _explainWhy(issue, analysisType) {
        const whyTemplates = {
            'BREADCRUMB': 'Users need to know their location in the app hierarchy.',
            'LOADING': 'Users need visual feedback that the system is working.'
        };
        
        return whyTemplates[analysisType] || 'This improves user experience.';
    }

    /**
     * Get Nielsen heuristic name for consistent reference
     * @param {string} analysisType - Type of analysis
     * @returns {string} Heuristic identifier
     */
    _getHeuristicName(analysisType) {
        const heuristics = {
            'BREADCRUMB': 'Nielsen #1: Visibility of System Status',
            'LOADING': 'Nielsen #1: Visibility of System Status',
            'NAVIGATION': 'Nielsen #2: Match Between System and Real World',
            'ERROR': 'Nielsen #9: Help Users Recognize and Recover from Errors'
        };
        
        return heuristics[analysisType] || 'Nielsen Heuristic';
    }

    /**
     * Get heuristic code for VS Code diagnostic system
     * Format: RUX[Heuristic#][Detector#] - e.g., RUX101 = Heuristic 1, Detector 1
     * @param {string} analysisType - Type of analysis
     * @returns {string} Structured code identifier
     */
    _getHeuristicCode(analysisType) {
        const codes = {
            // Nielsen Heuristic #1: Visibility of System Status (RUX1xx)
            'BREADCRUMB': 'RUX101',  // Heuristic 1, Detector 1
            'LOADING': 'RUX102',     // Heuristic 1, Detector 2
            
            // Nielsen Heuristic #2: Match Between System and Real World (RUX2xx)
            'NAVIGATION': 'RUX201',  // Heuristic 2, Detector 1
            
            // Nielsen Heuristic #9: Help Users Recognize and Recover from Errors (RUX9xx)
            'ERROR': 'RUX901',       // Heuristic 9, Detector 1
        };
        
        return codes[analysisType] || 'RUX000';
    }

    /**
     * Generate documentation link for further explanation
     * @param {string} analysisType - Type of analysis
     * @returns {vscode.Uri} Link to professional UX insights documentation
     */
    _getDocumentationLink(analysisType) {
        const docLinks = {
            'BREADCRUMB': 'https://www.nngroup.com/articles/breadcrumbs/',
            'LOADING': 'https://medium.com/design-bootcamp/using-loaders-understanding-their-purpose-types-and-best-practices-a62ca991d472',
            'NAVIGATION': 'https://www.nngroup.com/articles/navigation-cognitive-load/',
            'ERROR': 'https://www.nngroup.com/articles/error-message-guidelines/'
        };
        
        return vscode.Uri.parse(docLinks[analysisType] || 'https://www.nngroup.com/articles/ten-usability-heuristics/');
    }

    /**
     * Map issue severity to VS Code diagnostic severity
     * @param {string} severity - Issue severity from detector
     * @returns {vscode.DiagnosticSeverity} VS Code severity level
     */
    _mapSeverityToVSCode(severity) {
        const severityMap = {
            'error': vscode.DiagnosticSeverity.Error,
            'warning': vscode.DiagnosticSeverity.Warning,
            'suggestion': vscode.DiagnosticSeverity.Information,
            'info': vscode.DiagnosticSeverity.Hint
        };
        
        return severityMap[severity] || vscode.DiagnosticSeverity.Warning;
    }

    /**
     * Show detailed analysis results in output channel (legacy support)
     * @param {Object} options - Analysis configuration
     */
    _showInOutputChannel(options) {
        const { analysisType, fileName, issues, issueLabel } = options;
        
        // Create or reuse output channel
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('React UX Analyzer');
        }
        this.outputChannel.clear();
        
        // Header section
        this.outputChannel.appendLine(`=== ${analysisType.toUpperCase()} ANALYSIS ===`);
        this.outputChannel.appendLine(`File: ${fileName}`);
        this.outputChannel.appendLine(`${this._getIssueCountLabel(analysisType)}: ${issues.length}`);
        this.outputChannel.appendLine('');
        
        // Issues section
        if (issues.length > 0) {
            this.outputChannel.appendLine(`${this._getIssueIcon(analysisType)} ${issueLabel.toUpperCase()}:`);
            this._displayIssuesInOutputChannel(issues);
        }
        
        this.outputChannel.show();
    }

    /**
     * Display individual issues with consistent formatting in output channel
     * @param {Array} issues - Array of issue objects
     */
    _displayIssuesInOutputChannel(issues) {
        issues.forEach((issue, index) => {
            const severityIcon = this._getSeverityIcon(issue.severity);
            this.outputChannel.appendLine(`${index + 1}. ${severityIcon} Line ${issue.line}: ${issue.type}`);
            this.outputChannel.appendLine(`   Content: ${issue.content}`);
            this.outputChannel.appendLine(`   Message: ${issue.message}`);
            this.outputChannel.appendLine('');
        });
    }

    /**
     * Get severity icon based on issue severity
     * @param {string} severity - Issue severity level
     * @returns {string} Appropriate icon
     */
    _getSeverityIcon(severity) {
        const icons = {
            'warning': '❌',
            'suggestion': '💡',
            'error': '🚨',
            'info': 'ℹ️'
        };
        return icons[severity] || '⚠️';
    }

    /**
     * Get main issue icon for analysis type
     * @param {string} analysisType - Type of analysis
     * @returns {string} Appropriate icon
     */
    _getIssueIcon(analysisType) {
        const icons = {
            'BREADCRUMB': '❌',
            'LOADING': '⚠️',
            'NAVIGATION': '🧭',
            'ERROR': '🚨'
        };
        return icons[analysisType.toUpperCase()] || '⚠️';
    }

    /**
     * Get issue count label for analysis type
     * @param {string} analysisType - Type of analysis
     * @returns {string} Appropriate label
     */
    _getIssueCountLabel(analysisType) {
        const labels = {
            'BREADCRUMB': 'Missing breadcrumbs',
            'LOADING': 'Loading issues',
            'NAVIGATION': 'Navigation issues',
            'ERROR': 'Error handling issues'
        };
        return labels[analysisType.toUpperCase()] || 'Issues found';
    }

    /**
     * Show appropriate user notification about Problems panel integration
     * @param {string} analysisType - Type of analysis
     * @param {number} issueCount - Number of issues found
     */
    _showUserNotification(analysisType, issueCount) {
        const analysisName = analysisType.toLowerCase();
        
        if (issueCount > 0) {
            vscode.window.showWarningMessage(
                `Found ${issueCount} ${analysisName} issues! Check Problems panel for actionable fixes.`
            );
        } else {
            vscode.window.showInformationMessage(
                `✅ No ${analysisName} issues found! Your code follows UX best practices.`
            );
        }
    }

    /**
     * Filter issues by severity for consistent reporting
     * @param {Array} patterns - All detected patterns
     * @param {Array} severities - Severities to include (default: ['warning', 'suggestion'])
     * @returns {Array} Filtered issues
     */
    static filterIssues(patterns, severities = ['warning', 'suggestion']) {
        return patterns.filter(pattern => severities.includes(pattern.severity));
    }

    /**
     * Dispose of resources when extension deactivates
     */
    dispose() {
        if (this.outputChannel) {
            this.outputChannel.dispose();
        }
        if (this.diagnosticsCollection) {
            this.diagnosticsCollection.dispose();
        }
    }
}

module.exports = FeedbackHandler;
