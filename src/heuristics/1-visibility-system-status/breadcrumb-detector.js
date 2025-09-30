// breadcrumb-detector.js
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectBreadcrumbs - Detects missing breadcrumbs in critical page components <Page>, <Layout>, <Main>.
 * Heuristic: Nielsen #1 - Visibility of system status
 */
function detectBreadcrumbs(content) {
  const pageComponents = ["page", "layout", "main"];
  const breadcrumbComponents = ["breadcrumb", "breadcrumbs"];
  const htmlBreadcrumbPatterns = [
    /aria-label\s*=\s*["']breadcrumb["']/i,
    /class(Name)?\s*=\s*["'][^"']*breadcrumb-list[^"']*["']/i
  ];

  const feedback = [];

  let ast;
  try {
    ast = parse(content, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  } catch (err) {
    throw new Error("JSX code could not be parsed: " + err.message);
  }

  // Helper: recursive check for any breadcrumb
  function hasBreadcrumb(node) {
    if (!node) return false;

    // check if element or its children is a breadcrumb component
    if (node.type === "JSXElement") {
      const name = node.openingElement.name;
      if (name.type === "JSXIdentifier" && breadcrumbComponents.includes(name.name.toLowerCase())) {
        return true;
      }

      // check for HTML-like breadcrumb patterns in attributes
      for (const attr of node.openingElement.attributes || []) {
        if (attr.type === "JSXAttribute" && attr.name && attr.value) {
          const str = attr.value.type === "StringLiteral"
            ? attr.value.value
            : attr.value.type === "JSXExpressionContainer"
              ? "{...}"
              : "";
          if (htmlBreadcrumbPatterns.some(p => p.test(str))) return true;
        }
      }

      // recursively check children
      return (node.children || []).some(hasBreadcrumb);
    }

    return false;
  }

  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name;
      if (name.type === "JSXIdentifier" && pageComponents.includes(name.name.toLowerCase())) {
        // when breadcrumb is missing push feedback
        if (!hasBreadcrumb(path.node)) {
          feedback.push({
            type: "missing-breadcrumb",
            line: path.node.loc.start.line,
            message: `Page component <${name.name}> has no breadcrumb. Add one for proper system status visibility. (Nielsen #1)`,
            severity: "warning",
            analysisType: "BREADCRUMB",
            problem: "Missing navigation breadcrumbs in <Page>, <Main> or <Layout> component.",
            action: "Add <Breadcrumb> component or <nav aria-label='breadcrumb'> near the top.",
            why: "Users need to know their location in the app hierarchy."
          });
        }
      }
    }
  });

  return feedback;
}

module.exports = { detectBreadcrumbs };