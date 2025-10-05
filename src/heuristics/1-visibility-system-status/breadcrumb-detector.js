// breadcrumb-detector.js
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectBreadcrumbs - Detects missing breadcrumbs in critical page components <Page>, <Layout>, <Main>.
 * Heuristic: Nielsen #1 - Visibility of system status
 */
function detectBreadcrumbs(content) {
  const pageComponents = ["page", "layout", "main"];
  //const breadcrumbComponents = ["breadcrumb", "breadcrumbs"];
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

  // Helper: check if a JSXElement is a breadcrumb component case-insensitive
  function isBreadcrumbComponent(nameNode) {
    return (
      nameNode.type === "JSXIdentifier" &&
      /breadcrumb/i.test(nameNode.name)
    );
  }

  // Helper: recursive check for any breadcrumb
  function hasBreadcrumb(node) {
    if (!node) return false;

    // check if element or its children is a breadcrumb component
    if (node.type === "JSXElement") {
      const name = node.openingElement.name;
      if (isBreadcrumbComponent(name)) {
        return true;
      }

        // check for HTML-like breadcrumb patterns in aria-label or className and in combination with nav role
        for (const attr of node.openingElement.attributes || []) {
          if (attr.type === "JSXAttribute" && attr.name && attr.value) {
            // Prüfe auf aria-label="breadcrumb"
            if (
              attr.name.name === "aria-label" &&
              attr.value.type === "StringLiteral" &&
              attr.value.value.toLowerCase() === "breadcrumb"
            ) {
              return true;
            }
            // Prüfe auf role="navigation"
            if (
              attr.name.name === "role" &&
              attr.value.type === "StringLiteral" &&
              attr.value.value.toLowerCase() === "navigation"
            ) {
              // Optional: kann als Breadcrumb gelten, wenn aria-label auch gesetzt ist
              // Prüfe, ob aria-label="breadcrumb" ebenfalls vorhanden ist
              const hasAriaLabel = node.openingElement.attributes.some(a =>
                a.type === "JSXAttribute" &&
                a.name.name === "aria-label" &&
                a.value.type === "StringLiteral" &&
                a.value.value.toLowerCase() === htmlBreadcrumbPatterns[0].source.match(/breadcrumb/)[0]
              );
              if (hasAriaLabel) return true;
            }
            // Prüfe auf className="breadcrumb-list"
            if (
              (attr.name.name === "className" || attr.name.name === "class") &&
              attr.value.type === "StringLiteral" &&
              attr.value.value.toLowerCase().includes(htmlBreadcrumbPatterns[1].source.match(/breadcrumb-list/)[0])
            ) {
              return true;
            }
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