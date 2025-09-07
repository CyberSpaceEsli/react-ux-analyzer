/**
 * Standalone Feedback Helper - For testing outside VS Code
 * 
 * This helper provides the same formatting logic as FeedbackHandler
 * but works without the VS Code API for testing purposes.
 */

class StandaloneFeedbackHelper {
    /**
     * Display analysis results in console format
     * @param {Object} options - Analysis configuration
     * @param {string} options.analysisType - Type of analysis
     * @param {string} options.fileName - Name of analyzed file
     * @param {Array} options.issues - Array of detected issues
     * @param {string} options.issueLabel - Label for issues section
     */
    static showResults(options) {
        const { analysisType, fileName, issues, issueLabel } = options;
        
        console.log(`=== ${analysisType.toUpperCase()} ANALYSIS ===`);
        console.log(`File: ${fileName}`);
        console.log(`${StandaloneFeedbackHelper._getIssueCountLabel(analysisType)}: ${issues.length}`);
        console.log('');
        
        if (issues.length > 0) {
            console.log(`${StandaloneFeedbackHelper._getIssueIcon(analysisType)} ${issueLabel.toUpperCase()}:`);
            StandaloneFeedbackHelper._displayIssues(issues);
        }
    }

    /**
     * Display individual issues with consistent formatting
     * @param {Array} issues - Array of issue objects
     */
    static _displayIssues(issues) {
        issues.forEach((issue, index) => {
            const severityIcon = StandaloneFeedbackHelper._getSeverityIcon(issue.severity);
            console.log(`${index + 1}. ${severityIcon} Line ${issue.line}: ${issue.type}`);
            console.log(`   Content: ${issue.content}`);
            console.log(`   Message: ${issue.message}`);
            console.log('');
        });
    }

    /**
     * Get severity icon based on issue severity
     * @param {string} severity - Issue severity level
     * @returns {string} Appropriate icon
     */
    static _getSeverityIcon(severity) {
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
    static _getIssueIcon(analysisType) {
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
    static _getIssueCountLabel(analysisType) {
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
     * Filter issues by severity for consistent reporting
     * @param {Array} patterns - All detected patterns
     * @param {Array} severities - Severities to include (default: ['warning', 'suggestion'])
     * @returns {Array} Filtered issues
     */
    static filterIssues(patterns, severities = ['warning', 'suggestion']) {
        return patterns.filter(pattern => severities.includes(pattern.severity));
    }
}

module.exports = StandaloneFeedbackHelper;
