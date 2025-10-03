const vscode = require('vscode');

/**
 * FeedbackHandler - centralizes feedback display for React UX Analyzer + NIMA
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
    const uri = vscode.Uri.file(filePath);

    const diagnostics = issues.map(issue => {
      const range = new vscode.Range(issue.line - 1, 0, issue.line - 1, 1000); // line range (0-1000 chars)
      let severity = vscode.DiagnosticSeverity.Warning 
      if (issue.severity === "info") severity = vscode.DiagnosticSeverity.Information;

      const diagnostic = new vscode.Diagnostic(
        range,
        this._formatMessage(issue),
        severity
      );

      diagnostic.source = 'React UX Analyzer';
      diagnostic.code = {
        value: this._getHeuristicCode(issue.analysisType),
        target: this._getDocumentationLink(issue.analysisType, issue.docs)
      };
      return diagnostic;
    });

    this.diagnostics.set(uri, diagnostics);
    this._showNotification(issues);
  }

  /**
   * Clear all diagnostics from all files
   */
  clearAll() {
    this.diagnostics.clear();
  }

  /**
 * Map detector severity to VS Code DiagnosticSeverity
 */
  _mapSeverity() {
    return vscode.DiagnosticSeverity.Warning;
  }

  /**
   * Format a single issue message with problem + solution + why + heuristic
   */
  _formatMessage(issue) {
   const heuristic = this._getHeuristicName(issue.analysisType);
  const heuristicCode = this._getHeuristicCode(issue.analysisType);
  const docLink = this._getDocumentationLink(issue.analysisType, issue.docs);

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
      'FLEXIBILITY_EFFICIENCY': 'Nielsen #7: Flexibility and Efficiency of Use',
      'AESTHETIC_MINIMALISM': 'Nielsen #8: Aesthetic and Minimalist Design',
      'ERROR_RECOVERY': 'Nielsen #9: Help Users Recognize, Diagnose, and Recover from Errors',
      'HELP': 'Nielsen #10: Help and Documentation',
      'NIMA': 'NIMA Visual Quality Score'
    };

    if (analysisType?.startsWith('CUSTOM:')) {
      const customName = analysisType.split(':')[1]?.replace('.cjs', '');
      return `Custom UX Rule: ${customName || 'Unnamed Rule'}`;
    }

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
      'FLEXIBILITY_EFFICIENCY': 'RUX701',
      'AESTHETIC_MINIMALISM': 'RUX801',
      'ERROR_RECOVERY': 'RUX901',
      'HELP': 'RUX1001',
      'NIMA': 'VQA001'
    };

    if (analysisType?.startsWith('CUSTOM:')) {
      const customCode = analysisType.split(':')[1]?.replace('.cjs', '').toUpperCase();
      return `CUX-${customCode || 'UNKNOWN'}`;
    }

    return codes[analysisType] || 'RUX000';
  }

  /**
   * Heuristic Learning Material Links
   */
  _getDocumentationLink(analysisType, docsOverride) {

    // custom rule with docs link
  if (docsOverride) {
    return vscode.Uri.parse(docsOverride);
  }

   // custom rule link fallback
  if (analysisType?.startsWith('CUSTOM:')) {
    return vscode.Uri.parse('https://github.com/your-org/react-ux-analyzer#custom-rules');
  }

    // Standard heuristic links
    const links = {
      'BREADCRUMB': 'https://www.nngroup.com/articles/breadcrumbs/',
      'LOADING': 'https://medium.com/design-bootcamp/using-loaders-understanding-their-purpose-types-and-best-practices-a62ca991d472',
      'MATCH_SYSTEM_REAL_WORLD': 'https://www.nngroup.com/articles/match-between-system-and-the-real-world/',
      'CONTROL': 'https://www.nngroup.com/articles/user-control-and-freedom/',
      'CONSISTENCY': 'https://www.nngroup.com/articles/consistency-and-standards/',
      'ERROR_PREVENTION': 'https://www.nngroup.com/articles/error-prevention/',
      'RECOGNITION': 'https://www.nngroup.com/articles/recognition-vs-recall/',
      'FLEXIBILITY_EFFICIENCY': 'https://www.nngroup.com/articles/ui-copy/#toc-guidelines-for-command-shortcuts-3',
      'AESTHETIC_MINIMALISM': 'https://www.nngroup.com/articles/minimalist-design/',
      'ERROR_RECOVERY': 'https://www.nngroup.com/articles/help-users-recognize-diagnose-and-recover-from-errors/',
      'HELP': 'https://www.nngroup.com/articles/help-and-documentation/',
      'NIMA': 'https://arxiv.org/abs/1709.05424'
    };

    return vscode.Uri.parse(links[analysisType] || 'https://www.nngroup.com/articles/ten-usability-heuristics/');
  }

  _showNotification(issues) {

    // no issues found
    if (issues.length === 0) {
      vscode.window.showInformationMessage(`✅ No UI/UX issues found !`);
      return;
    };

      // check if issue has severity warning or info
    const hasWarning = issues.some(issue => issue.severity !== "info");
    const hasInfo = issues.every(issue => issue.severity === "info");

    if (hasWarning && issues.length > 0) {
      vscode.window.showWarningMessage(`React UX Analyzer found ${issues.length} issue(s).`);
    }
    
    if (hasInfo && issues.length > 0) {
      vscode.window.showInformationMessage(`View NIMA results in problem channel.`);
    }
  }

}

module.exports = FeedbackHandler;