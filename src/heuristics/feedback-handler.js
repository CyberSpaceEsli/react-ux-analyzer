const vscode = require('vscode');

/**
 * FeedbackHandler - centralizes feedback display for React UX Analyzer
 */
class FeedbackHandler {
  constructor() {
    this.diagnostics = vscode.languages.createDiagnosticCollection('react-ux-analyzer');
    this.outputChannel = vscode.window.createOutputChannel('React UX Analyzer');
  }

  /**
   * Display detector results in Problems panel and optionally output channel
   * @param {string} filePath - full path of analyzed file
   * @param {Array} issues - array of issue objects with {line, type, severity, content, message, analysisType}
   */
  showResults(filePath, issues) {
    this.diagnostics.clear(); // clear all previous diagnostics
    this.clear(filePath); // clear diagnostics for the file

    const diagnostics = issues.map(issue => {
      const range = new vscode.Range(issue.line - 1, 0, issue.line - 1, 1000); // line range (0-1000 chars)
      const diagnostic = new vscode.Diagnostic(
        range,
        this._formatMessage(issue),
        this._mapSeverity(issue.severity)
      );

      diagnostic.source = 'React UX Analyzer';
      diagnostic.code = {
        value: this._getHeuristicCode(issue.analysisType),
        target: this._getDocumentationLink(issue.analysisType)
      };
      return diagnostic;
    });

    this.diagnostics.set(vscode.Uri.file(filePath), diagnostics);
    this._showNotification(issues);
    this._showOutputChannel(filePath, issues);
  }

  /**
   * Clear previous diagnostics for a file
   */
  clear(filePath) {
    this.diagnostics.delete(vscode.Uri.file(filePath));
  }

  /**
   * Map detector severity to VS Code DiagnosticSeverity
   */
  _mapSeverity(severity) {
    const map = {
      'error': vscode.DiagnosticSeverity.Error,
      'warning': vscode.DiagnosticSeverity.Warning,
      'info': vscode.DiagnosticSeverity.Information,
      'hint': vscode.DiagnosticSeverity.Hint
    };
    return map[severity] || vscode.DiagnosticSeverity.Warning;
  }

  /**
   * Format a single issue message with problem + solution + why + heuristic
   */
  _formatMessage(issue) {
   const heuristic = this._getHeuristicName(issue.analysisType);
  const heuristicCode = this._getHeuristicCode(issue.analysisType);
  const docLink = this._getDocumentationLink(issue.analysisType);

  // Problem description
  const problem = issue.problem || issue.message || "UX issue detected";

  // Actionable advice
  const action = issue.action || "Please review and apply UX best practices.";

  // Why it helps users
  const why = issue.why || "Improves user experience and usability.";

  return `${problem}\nAction: ${action}\nWhy: ${why}\nHeuristic: ${heuristic} (${heuristicCode})\nMore info: ${docLink}`;
  }

  /**
   * Heuristic Overview of their labels assigned to analysis types
   */
  _getHeuristicName(analysisType) {
    const heuristics = {
      'BREADCRUMB': 'Nielsen #1: Visibility of System Status',
      'LOADING': 'Nielsen #1: Visibility of System Status',
      'MATCH_SYSTEM_REAL_WORLD': 'Nielsen #2: Match Between System and the Real World',
      'CONTROL': 'Nielsen #3: User Control and Freedom',
      'CONSISTENCY': 'Nielsen #4: Consistency and Standards',
      'ERROR_PREVENTION': 'Nielsen #5: Error Prevention',
      'RECOGNITION': 'Nielsen #6: Recognition Rather Than Recall',
      'FLEXIBILITY & EFFICIENCY': 'Nielsen #7: Flexibility and Efficiency of Use',
      'ERROR_RECOVERY': 'Nielsen #9: Help Users Recognize, Diagnose, and Recover from Errors',
      'HELP': 'Nielsen #10: Help and Documentation'
    };
    return heuristics[analysisType] || 'Nielsen Heuristic';
  }

  /**
   * Heuristic Codes for quick reference
   */
  _getHeuristicCode(analysisType) {
    const codes = {
      'BREADCRUMB': 'RUX101',
      'LOADING': 'RUX102',
      'MATCH_SYSTEM_REAL_WORLD': 'RUX201',
      'CONTROL': 'RUX301',
      'CONSISTENCY': 'RUX401',
      'ERROR_PREVENTION': 'RUX501',
      'RECOGNITION': 'RUX601',
      'FLEXIBILITY & EFFICIENCY': 'RUX701',
      'ERROR_RECOVERY': 'RUX901',
      'HELP': 'RUX1001'
    };
    return codes[analysisType] || 'RUX000';
  }

  /**
   * Heuristic Learning Material Links
   */
  _getDocumentationLink(analysisType) {
    const links = {
      'BREADCRUMB': 'https://www.nngroup.com/articles/breadcrumbs/',
      'LOADING': 'https://medium.com/design-bootcamp/using-loaders-understanding-their-purpose-types-and-best-practices-a62ca991d472',
      'MATCH_SYSTEM_REAL_WORLD': 'https://www.nngroup.com/articles/match-between-system-and-the-real-world/',
      'CONTROL': 'https://www.nngroup.com/articles/user-control-and-freedom/',
      'CONSISTENCY': 'https://www.nngroup.com/articles/consistency-and-standards/',
      'ERROR_PREVENTION': 'https://www.nngroup.com/articles/error-prevention/',
      'RECOGNITION': 'https://www.nngroup.com/articles/recognition-vs-recall/',
      'FLEXIBILITY & EFFICIENCY': 'https://www.nngroup.com/articles/ui-copy/#toc-guidelines-for-command-shortcuts-3',
      'ERROR_RECOVERY': 'https://www.nngroup.com/articles/help-users-recognize-diagnose-and-recover-from-errors/',
      'HELP': 'https://www.nngroup.com/articles/help-and-documentation/'
    };
    return vscode.Uri.parse(links[analysisType] || 'https://www.nngroup.com/articles/ten-usability-heuristics/');
  }

  _showNotification(issues) {
    if (issues.length > 0) {
      vscode.window.showWarningMessage(`React UX Analyzer found ${issues.length} issue(s).`);
    } else {
      vscode.window.showInformationMessage(`✅ No UI/UX issues found !`);
    }
  }

  _showOutputChannel(filePath, issues) {
    if (issues.length === 0) return;

    this.outputChannel.clear();
    this.outputChannel.appendLine(`=== React UX Analyzer Report ===`);
    this.outputChannel.appendLine(`File: ${filePath}`);
    this.outputChannel.appendLine(`Issues: ${issues.length}`);
    this.outputChannel.appendLine('');

    issues.forEach((issue, i) => {
      const icon = issue.severity === 'error' ? '🚨' : issue.severity === 'info' ? 'ℹ️' : '⚠️';
      this.outputChannel.appendLine(`${i + 1}. ${icon} Line ${issue.line}: ${issue.message}`);
      if (issue.content) this.outputChannel.appendLine(`   Code: ${issue.content}`);
      this.outputChannel.appendLine(`   Heuristic: ${this._getHeuristicName(issue.analysisType)} (${this._getHeuristicCode(issue.analysisType)})`);
      this.outputChannel.appendLine(`   More info: ${this._getDocumentationLink(issue.analysisType)}`);
      this.outputChannel.appendLine('');
    });

    this.outputChannel.show(true);
  }
}

module.exports = FeedbackHandler;