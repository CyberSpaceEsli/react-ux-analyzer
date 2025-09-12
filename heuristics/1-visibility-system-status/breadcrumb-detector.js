// breadcrumb-detector.js
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Detects missing breadcrumbs in critical page components.
 * Heuristic: Nielsen #1 - Visibility of system status
 * Breadcrumbs help users understand where they are in the application.
 */
function detectBreadcrumbs(content) {
  const pageComponents = ["Page", "Layout", "Main"];
  const breadcrumbComponents = ["Breadcrumb", "BreadCrumb", "Breadcrumbs", "BreadCrumbs"];
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

    // JSX Component check
    if (node.type === "JSXElement") {
      const name = node.openingElement.name;
      if (name.type === "JSXIdentifier" && breadcrumbComponents.includes(name.name)) {
        return true;
      }

      // HTML attribute check
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

      // Recursively check children
      return (node.children || []).some(hasBreadcrumb);
    }

    return false;
  }

  // Traverse AST
  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name;
      if (name.type === "JSXIdentifier" && pageComponents.includes(name.name)) {
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