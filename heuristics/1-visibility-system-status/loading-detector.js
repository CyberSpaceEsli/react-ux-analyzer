/**
 * Loading State Detector for React UX Analysis
 * 
 * Detects missing loading feedback in React components (Nielsen Heuristic #1: Visibility of System Status)
 * 
 * Features:
 * - Detects API calls without loading feedback
 * - Finds good loading practices (spinners, progress bars, skeleton screens)
 * - Returns structured pattern data for FeedbackHandler processing
 */

const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

class LoadingDetector {
    constructor() {
    this.loadingComponents = ["Loading", "Spinner", "Skeleton", "Loader"];
    // Regex only used to detect if loading UI exists, but not reported directly
    this.loadingRegex = /<(Loading|Spinner|Skeleton|Loader)/i;
  }
    
    detectLoadingPatterns(content) {
        const patterns = [];

        const ast = parse(content, {
        sourceType: "module",
        plugins: ["jsx", "typescript"]
        });
       
        traverse(ast, {
        CallExpression: (path) => {
        const callee = path.node.callee;

        // Detects any function call that is: fetch or (axios.(get|post|put|delete))
        if (callee.type === "Identifier" && callee.name === "fetch"){
          const parentFunc = path.getFunctionParent();
          const hasLoadingUI = this.checkForLoadingUI(parentFunc);

          //async function without loading UI
          if (!hasLoadingUI) {
            patterns.push({
              type: "loader-missing",
              line: path.node.loc.start.line,
              message:
                "Async operation detected but no loading feedback (spinner, text, or disabled button) found. Add feedback to inform the user.",
              severity: "warning"
            });
          }
        }
      },

      // Form submission detection whithout loading feedback
      JSXElement: (path) => {
        const openingName = path.node.openingElement.name;
        // Detect forms
        if (openingName.type === "JSXIdentifier" && openingName.name === "form") {
          const hasLoading = this.checkFormLoading(path.node);
          if (!hasLoading) {
            patterns.push({
              type: "loader-missing",
              line: path.node.loc.start.line,
              message:
                "Form detected without loading feedback (spinner, 'loading' text, or disabled button). Add feedback for user.",
              severity: "warning"
            });
          }
        }
      }
    });

    return patterns;
  }

  isAxiosCall(callee) {
    return (
      callee.type === "MemberExpression" &&
      callee.object.name === "axios" &&
      ["get", "post", "put", "delete"].includes(callee.property.name)
    );
  }

  // Checks if loading UI components or text exist in the parent function body of the API call
  checkForLoadingUI(funcPath) {
    if (!funcPath) return false;
    let found = false;

    funcPath.traverse({
      JSXElement: (path) => {
        const name = path.node.openingElement.name;
        if (name.type === "JSXIdentifier" && this.loadingComponents.includes(name.name)) {
          found = true;
          path.stop();
        }

        // Also check for literal "Loading..." text
        path.node.children.forEach((child) => {
          if (child.type === "JSXText" && /loading/i.test(child.value)) {
            found = true;
          }
        });
      }
    });

    return found;
  }

  // Checks if a form has loading feedback (disabled button or loading text)
  checkFormLoading(formNode) {
    const children = formNode.children || [];
    for (const child of children) {
      if (child.type === "JSXElement") {
        const name = child.openingElement.name;
        if (name.type === "JSXIdentifier" && name.name === "button") {
          const attrs = child.openingElement.attributes || [];
          for (const attr of attrs) {
            if (attr.type === "JSXAttribute" && attr.name.name === "disabled") {
              return true;
            }
          }
        }
        child.children.forEach((c) => {
          if (c.type === "JSXText" && /loading/i.test(c.value)) {
            return true;
          }
        });
      }
    }
    return false;
  }

}

module.exports = LoadingDetector;
