const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectLoadingPatterns - checks React code for missing loading indicators
 * Heuristic: Nielsen #1 - Visibility of System Status
 */
function detectLoadingPatterns(content) {
  const feedback = [];

  let ast;
  try {
    ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "classProperties"],
      errorRecovery: true
    });
  } catch (err) {
    throw new Error("JS/JSX code could not be parsed: " + err.message);
  }

  const spinnerTags = ["svg", "span", "div"];

  /**
   * Helper: checks if a JSX element or its children have valid loading indicators
   */
  function checkLoadingIndicator(node) {
    if (!node || node.type !== "JSXElement") return false;

    const name = node.openingElement.name;

    // 1 Recognize Spinner / CircularProgress
    if (name.type === "JSXIdentifier" && /spinner|circularprogress/i.test(name.name)) return true;

    // 2 Tailwind animate-spin check for svg, span, div
    if (name.type === "JSXIdentifier" && spinnerTags.includes(name.name.toLowerCase())) {
      const attrs = node.openingElement.attributes || [];
      const hasAnimateSpin = attrs.some(
        attr =>
          attr.type === "JSXAttribute" &&
          (attr.name.name === "className" || attr.name.name === "class") &&
          attr.value &&
          ((attr.value.type === "StringLiteral" && /animate-spin/i.test(attr.value.value)) ||
            (attr.value.type === "JSXExpressionContainer" && /animate-spin/i.test("{...}")))
      );

      if (!hasAnimateSpin) {
        feedback.push({
          type: "missing-loading-animation",
          line: node.loc.start.line,
          content: content.slice(node.start, node.end),
          severity: "warning",
          message: `Potential spinner <${node.openingElement.name.name}> is missing 'animate-spin' class.`,
          action: `Add 'animate-spin' to <${node.openingElement.name.name}> to indicate loading.`,
          why: "Users need a visual spinner to know the action is in progress."
        });
        return true;
      }
      return true; // valid spinner
    }

    // 3 Check children recursively for text or JSX expressions
    if (node.children) {
      for (const child of node.children) {
        if (child.type === "JSXText" && /loading|submitting|processing/i.test(child.value)) return true;

        if (child.type === "JSXExpressionContainer" && child.expression) {
          // Conditional expressions {loading ? ... : ...}
          if (child.expression.type === "ConditionalExpression") {
            const { consequent, alternate } = child.expression;
            if (
              (consequent.type === "JSXElement" || consequent.type === "JSXText") ||
              (alternate.type === "JSXElement" || alternate.type === "JSXText")
            )
              return true;
          }
          // Short-circuit {loading && <Spinner />}
          if (child.expression.type === "LogicalExpression") return true;

          if (child.expression.type === "StringLiteral" && /loading|submitting|processing/i.test(child.expression.value))
            return true;
        }

        if (child.type === "JSXElement" && checkLoadingIndicator(child)) return true;
      }
    }

    return false;
  }

  traverse(ast, {
    // Detect fetch / axios calls without loading feedback
    CallExpression(path) {
    const callee = path.node.callee;
    const isFetch =
      (callee.type === "Identifier" && callee.name === "fetch") ||
      (callee.type === "MemberExpression" && callee.object?.type === "Identifier" && callee.object.name === "axios");

    if (isFetch) {
      const parentFunc = path.getFunctionParent();
      if (!parentFunc) return;

      const bodyNode = parentFunc.node.body;
      let bodyStatements = [];

      if (!bodyNode) return; // safety guard

      // Block statement (normal function)
      if (bodyNode.type === "BlockStatement") {
        bodyStatements = bodyNode.body;
      } else {
        // Expression-bodied arrow function
        bodyStatements = [bodyNode];
      }

      const hasLoadingUI = bodyStatements.some(stmt => {
        // Check for if (loading) {...}
        return (
          stmt.type === "IfStatement" &&
          stmt.test &&
          stmt.test.type === "Identifier" &&
          /loading|submitting|uploading|processing/i.test(stmt.test.name)
        );
      });

      if (!hasLoadingUI) {
        feedback.push({
          type: "missing-loading",
          line: path.node.loc.start.line,
          content: content.slice(path.node.start, path.node.end),
          severity: "warning",
          message: "fetch/axios call detected without loading UI.",
          action:
            "Wrap the network call with a loading state and show <Spinner />, <CircularProgress />, animate-spin element, or loading text.",
          why: "Users need feedback that the system is working."
        });
      }
    }
  },

    // Detect buttons missing disabled={loading}
    JSXElement(path) {
    const node = path.node;

    // Only check <button> elements
    if (node.openingElement.name.type === "JSXIdentifier" && node.openingElement.name.name === "button") {
      // Check if button has type="submit"
      const typeAttr = node.openingElement.attributes.find(
        a => a.type === "JSXAttribute" && a.name.name === "type"
      );
      const typeValue =
        typeAttr && typeAttr.type === "JSXAttribute" && typeAttr.value && typeAttr.value.type === "StringLiteral"
          ? typeAttr.value.value
          : undefined;

      if (typeValue === "submit") {
        // Check if button has disabled attribute
        const disabledAttr = node.openingElement.attributes.find(
          a => a.type === "JSXAttribute" && a.name.name === "disabled"
        );

      const childrenHaveLoading = node.children.map(child => checkLoadingIndicator(child)).some(Boolean);

        let hasDisabledIsLoading = false;
        if (disabledAttr && disabledAttr.type === "JSXAttribute" && disabledAttr.value) {
          if (disabledAttr.value.type === "JSXExpressionContainer") {
            // e.g., disabled={isLoading}
            hasDisabledIsLoading = true; // consider any expression as valid
          }
        }

        if (!disabledAttr || !hasDisabledIsLoading && !childrenHaveLoading) {
          feedback.push({
            type: "missing-loading",
            line: node.loc.start.line,
            content: content.slice(node.start, node.end),
            severity: "warning",
            message: "Submit button with type='submit' is missing `disabled={isLoading}`.",
            action: "Add `disabled={isLoading}` and show a spinner or loading text inside the button.",
            why: "Users need feedback that the action is in progress."
          });
        }
      }
    }
  }
  });

  return feedback;
}

module.exports = { detectLoadingPatterns };