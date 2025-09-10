/**
 * Simple Breadcrumb Pattern Detector
 * 
 * This class analyzes JSX/React code to find missing breadcrumb navigation patterns.
 * Breadcrumbs help users understand where they are in the application (Nielsen Heuristic #1).
 * 
 * What it does:
 * - Scans through each line of JSX code
 * - Looks for missing breadcrumb components and patterns in page components
 * - Returns structured pattern data for FeedbackHandler processing
 */
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

class BreadcrumbDetector {
  constructor() {
    // Typical Page Components
    this.pageComponents = ["Page", "Layout", "Main"];
    // Typical Breadcrumb Components / Structures
    this.breadcrumbComponents = ["Breadcrumb", "BreadCrumb", "Breadcrumbs", "BreadCrumbs"];
    // Regex patterns to detect HTML-style breadcrumbs
    this.htmlBreadcrumbPatterns = [
      /aria-label\s*=\s*["']breadcrumb["']/i,
      /class(Name)?\s*=\s*["'][^"']*breadcrumb-list[^"']*["']/i
    ];
  }

  detectBreadcrumbs(content){
    const patterns = [];

    // AST Parsing
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });

    traverse(ast, {
      JSXElement: (path) => {
        const node = path.node;
        const name = node.openingElement.name;

        // Prüfe, ob es eine Page-Komponente ist
        if (name.type === "JSXIdentifier" && this.pageComponents.includes(name.name)) {
          // Prüfe, ob innerhalb des JSX-Baums ein Breadcrumb existiert
          const hasBreadcrumb =
            this.containsBreadcrumb(node) ||
            this.containsHTMLBreadcrumb(node);

          if (!hasBreadcrumb) {
            patterns.push({
              type: "missing-breadcrumb",
              line: node.loc.start.line,
              message:
                `Page component <${name.name}> has no breadcrumb. Add a breadcrumb inside this component for proper system status visibility. (Nielsen #1)`,
              severity: "warning"
            });
          }
        }
      }
    });

    return patterns;
  }

  // Recursive function: checks all children of a JSX element.
  containsBreadcrumb(node) {
    // check JSXElement
    if (node.type === "JSXElement") {
      const name = node.openingElement.name;
      if (name.type === "JSXIdentifier" && this.breadcrumbComponents.includes(name.name)) {
        return true;
      }
    }

    // check children
    if (node.children) {
      for (const child of node.children) {
        if (this.containsBreadcrumb(child)) return true;
      }
    }

    return false;
  }

  // Check HTML-style breadcrumb hints in attributes (className, aria-label, etc) against regex patterns
  containsHTMLBreadcrumb(node) {
    if (node.type !== "JSXElement") return false;

    // Check attributes of current JSX element (e.g., <nav aria-label="breadcrumb">)
    const attrs = node.openingElement.attributes || [];
    // Loop through each attribute to see if it matches a breadcrumb pattern
    for (const attr of attrs) {
      if (attr.type === "JSXAttribute" && attr.name && attr.value) {
        const attrString = this.getAttributeString(attr);
        // Check if the string matches any HTML breadcrumb pattern
        for (const pattern of this.htmlBreadcrumbPatterns) {
          if (pattern.test(attrString)) return true;
        }
      }
    }

    // Recursively check all child JSX elements
    if (node.children) {
      for (const child of node.children) {
        if (this.containsHTMLBreadcrumb(child)) return true;
      }
    }

    // No breadcrumb found in this element or its children
    return false;
  }

  // Convert attribute to string for regex matching
  getAttributeString(attr) {
    if (!attr.value) return "";
    if (attr.value.type === "StringLiteral") return `${attr.name.name}="${attr.value.value}"`;
    if (attr.value.type === "JSXExpressionContainer") return `${attr.name.name}={...}`;
    return "";
  }

  // Convert JSX tree to string for report
  jsxToString(node) {
    if (node.type === "JSXText") return node.value;
    if (node.type === "JSXElement") {
      let childrenStr = (node.children || []).map((c) => this.jsxToString(c)).join("");
      let name = node.openingElement.name.name || "";
      return `<${name}>${childrenStr}</${name}>`;
    }
    return "";
  }

}

module.exports = BreadcrumbDetector;