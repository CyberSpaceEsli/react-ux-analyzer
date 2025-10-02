const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectLoadingPatterns - checks React code for missing loading indicators in network calls and buttons
 * Heuristic: Nielsen #1 - Visibility of System Status
 */
function detectLoadingPatterns(content) {
  const feedback = [];

  const actionTextRegex = /\b(upload|login|register|logout|send|save|submit|next|continue|delete|remove|post|create|update)\b/i;
  const loadingComponents = /spinner|loader|loading|circularprogress|progress/i;
  const loadingStates = /setLoading|isLoading|loading|setIsLoading|setIsDataLoading|saving|isSaving|setSave|submitting|isSubmitting|setSubmitting|processing|isProcessing|setProcessing|upload|setUpload/i;
  const loadingTextRegex = /loading|isLoading|submitting|processing|sending|saving|uploading|fetching|working|busy|pending|wait|waiting/i;
  const spinnerTags = ["svg", "span", "div"];

  // Helper: checks for conditional loading indicators like {isLoading ? <Spinner /> : ...} or {loading ? "Sending..." : "Send"}
  function containsConditionalLoading(children) {
    if (!children || !Array.isArray(children)) return false;
    return children.some(child => {
      if (
        child.type === "JSXExpressionContainer" &&
        child.expression.type === "ConditionalExpression"
      ) {
        const test = child.expression.test;
        if (
          test.type === "Identifier" &&
          loadingStates.test(test.name)
        ) {
          const consequent = child.expression.consequent;
          // Spinner or loader component
          if (
            consequent.type === "JSXElement" &&
            consequent.openingElement?.name?.type === "JSXIdentifier" &&
            (loadingComponents.test(consequent.openingElement.name.name) ||
              (spinnerTags.includes(consequent.openingElement.name.name.toLowerCase()) &&
                (consequent.openingElement.attributes || []).some(attr =>
                  attr.type === "JSXAttribute" &&
                  (attr.name.name === "className" || attr.name.name === "class") &&
                  attr.value &&
                  attr.value.type === "StringLiteral" &&
                  /animate-spin/i.test(attr.value.value)
                )
              )
            )
          ) {
            return true;
          }
          // Loading text
          if (
            (consequent.type === "JSXText" && loadingTextRegex.test(consequent.value)) ||
            (consequent.type === "StringLiteral" && loadingTextRegex.test(consequent.value))
          ) {
            return true;
          }
        }
      }
      // Recursively check nested JSXElements
      if (child.type === "JSXElement") {
        return containsConditionalLoading(child.children);
      }
      return false;
    });
  }

  // Helper: checks for {isLoading && <Spinner />} and related patterns (for other feedback)
  function checkLoadingIndicator(children) {
    if (!children || !Array.isArray(children)) return false;
    return children.some(child => {
      // {isLoading && <Spinner />}
      if (
        child.type === "JSXExpressionContainer" &&
        child.expression.type === "LogicalExpression"
      ) {
        if (
          child.expression.left.type === "Identifier" &&
          loadingTextRegex.test(child.expression.left.name)
        ) {
          const right = child.expression.right;
          if (
            right.type === "JSXElement" &&
            right.openingElement?.name?.type === "JSXIdentifier"
          ) {
            const tagName = right.openingElement.name.name;
            if (loadingComponents.test(tagName)) return true;
            if (spinnerTags.includes(tagName.toLowerCase())) {
              const attrs = right.openingElement.attributes || [];
              const hasAnimateSpin = attrs.some(attr =>
                attr.type === "JSXAttribute" &&
                (attr.name.name === "className" || attr.name.name === "class") &&
                attr.value &&
                attr.value.type === "StringLiteral" &&
                /animate-spin/i.test(attr.value.value)
              );
              if (hasAnimateSpin) return true;
            }
          }
        }
      }
      // Recursively check nested JSXElements
      if (child.type === "JSXElement") {
        return checkLoadingIndicator(child.children);
      }
      // Direct text node with loading keywords
      if (child.type === "JSXText" && loadingTextRegex.test(child.value)) {
        return true;
      }
      return false;
    });
  }

  // Collects info about <button type="submit"> elements in the component
  // Only consider buttons with conditional rendering for fetch/axios feedback!
  let hasSubmitButtonWithConditionalLoading = false;

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

  // Collect all submit buttons with conditional loading indicator (ternary only)
  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      if (
        node.openingElement.name.type === "JSXIdentifier" &&
        node.openingElement.name.name === "button"
      ) {
        const typeAttr = node.openingElement.attributes.find(
          a => a.type === "JSXAttribute" && a.name.name === "type"
        );
        const typeValue =
          typeAttr && typeAttr.type === "JSXAttribute" && typeAttr.value && typeAttr.value.type === "StringLiteral"
            ? typeAttr.value.value
            : undefined;
        if (typeValue === "submit") {
          if (containsConditionalLoading(node.children)) {
            hasSubmitButtonWithConditionalLoading = true;
          }
        }
      }
    }
  });

  // Analyze fetch/axios calls and their surrounding context
  traverse(ast, {
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

        if (bodyNode.type === "BlockStatement") {
          bodyStatements = bodyNode.body;
        } else {
          bodyStatements = [bodyNode];
        }

        const hasSetLoadingTrue = bodyStatements.some(stmt => {
          return (
            stmt.type === "ExpressionStatement" &&
            stmt.expression.type === "CallExpression" &&
            stmt.expression.callee.type === "Identifier" &&
            loadingStates.test(stmt.expression.callee.name) &&
            stmt.expression.arguments.length > 0 &&
            stmt.expression.arguments[0].type === "BooleanLiteral" &&
            stmt.expression.arguments[0].value === true
          );
        });

        // Only suppress feedback if there is a submit button with conditional rendering (ternary)
        if (!hasSetLoadingTrue) {
          feedback.push({
            type: "missing-loading-state",
            line: path.node.loc.start.line,
            content: content.slice(path.node.start, path.node.end),
            severity: "warning",
            message: "fetch/axios call detected without loading state.",
            action:
              "Set your loading state to true while the request is in progress, e.g. setLoading(true).",
            why: "Users need feedback that the system is loading."
          });
        }

        if (!hasSetLoadingTrue || !hasSubmitButtonWithConditionalLoading) {
          feedback.push({
            type: "missing-conditional-loading-ui",
            line: path.node.loc.start.line,
            content: content.slice(path.node.start, path.node.end),
            severity: "warning",
            message: "fetch/axios call detected without conditional loading UI in submit button (e.g. {loading ? Sending... : Send}).",
            action: "Show a loading indicator inside a <button type='submit'> while the request is in progress, using {loading ? ... : ...}.",
            why: "Users should see if system is processing."
          });
        }
      }
    },

    // Keep your original button analysis logic for other feedback
    JSXElement(path) {
      const node = path.node;

      const buttonText = (node.children || [])
        .map(child => child.type === "JSXText" ? child.value : "")
        .join(" ")
        .trim();

      if (node.openingElement.name.type === "JSXIdentifier" && node.openingElement.name.name === "button") {
        // check if button has type="submit"
        const typeAttr = node.openingElement.attributes.find(
          a => a.type === "JSXAttribute" && a.name.name === "type"
        );
        const typeValue =
          typeAttr && typeAttr.type === "JSXAttribute" && typeAttr.value && typeAttr.value.type === "StringLiteral"
            ? typeAttr.value.value
            : undefined;

        if (typeValue === "submit" || actionTextRegex.test(buttonText)) {
          // check if button has disabled attribute
          const disabledAttr = node.openingElement.attributes.find(
            a => a.type === "JSXAttribute" && a.name.name === "disabled"
          );

          const childrenHaveLoading =
            checkLoadingIndicator(node.children) ||
            containsConditionalLoading(node.children);

          let hasDisabledIsLoading = false;
          if (disabledAttr && disabledAttr.type === "JSXAttribute" && disabledAttr.value) {
            if (disabledAttr.value.type === "JSXExpressionContainer") {
              // e.g., disabled={isLoading}
              hasDisabledIsLoading = true; // consider any expression as valid
            }
          }

          if (!childrenHaveLoading) {
            feedback.push({
              type: "missing-loading-indicator",
              line: node.loc.start.line,
              content: content.slice(node.start, node.end),
              severity: "warning",
              message: "Button has no logical loading indicator.",
              action: "Add {loading && <Spinner />} or {loading && <svg className='animate-spin' /> } inside the button.",
              why: "Users need to see if system is loading."
            });
          }

          if (!disabledAttr || (!hasDisabledIsLoading && !childrenHaveLoading)) {
            feedback.push({
              type: "missing-loading",
              line: node.loc.start.line,
              content: content.slice(node.start, node.end),
              severity: "warning",
              message: "Button is missing `disabled={isLoading}`.",
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