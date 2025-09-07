/**
 * FeedbackHandler - Centralized feedback management for React UX Analyzer
 * 
 * This class provides consistent output formatting and VS Code integration
 * for all UX heuristic detectors. It standardizes how issues are displayed
 * to users and ensures uniform feedback across different analysis types.
 * 
 * Features:
 * - Consistent output channel formatting
 * - Unified severity handling (warnings, suggestions, info)
 * - Standardized user notifications
 * - Extensible for future detector types
 */

const vscode = require('vscode');

class FeedbackHandler {
    constructor() {
        this.outputChannel = null;
    }

    /**
     * Show analysis results in VS Code output panel
     * @param {Object} options - Analysis configuration
     * @param {string} options.analysisType - Type of analysis (e.g., 'BREADCRUMB', 'LOADING')
     * @param {string} options.fileName - Name of analyzed file
     * @param {Array} options.issues - Array of detected issues
     * @param {string} options.issueLabel - Label for issues section (e.g., 'MISSING BREADCRUMBS', 'LOADING ISSUES')
     */
    showResults(options) {
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
            this._displayIssues(issues);
        }
        
        this.outputChannel.show();
        this._showUserNotification(analysisType, issues.length);
    }

    /**
     * Display individual issues with consistent formatting
     * @param {Array} issues - Array of issue objects
     */
    _displayIssues(issues) {
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
            'FEEDBACK': '💬',
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
            'FEEDBACK': 'Feedback issues',
            'ERROR': 'Error handling issues'
        };
        return labels[analysisType.toUpperCase()] || 'Issues found';
    }

    /**
     * Show appropriate user notification
     * @param {string} analysisType - Type of analysis
     * @param {number} issueCount - Number of issues found
     */
    _showUserNotification(analysisType, issueCount) {
        const analysisName = analysisType.toLowerCase();
        
        if (issueCount > 0) {
            vscode.window.showWarningMessage(
                `Found ${issueCount} ${analysisName} issues! Check output panel.`
            );
        } else {
            vscode.window.showInformationMessage(
                `No ${analysisName} issues found!`
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
    }
}

module.exports = FeedbackHandler;
