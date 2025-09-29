const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectErrorPrevention - Detects meaningful user feedback and error prevention for fetch/axios calls
 * Nielsen's Heuristic #5: Error Prevention
 */
function detectErrorPrevention(content) {
  const feedback = [];

  const destructiveWords = /\b(delete|remove|clear all|clear|discard|erase|trash|reset)\b/i;
  const confirmationWords = /\b(are you sure|permanently|cannot be undone|irreversible)\b/i;
  const cancelWords = /\b(cancel|no|dismiss|exit|return|back|go back)\b/i;
  const undoWords = /\b(undo|restore|revert|recover|unarchive|undelete|cancel)\b/i;
  const modalLikeTags = ["modal", "dialog", "confirmdialog", "alertdialog"];
  const contextualFields = ["select", "dropdown", "checkboxgroup", "radiogroup", "upload", "filepicker"];
  const userErrorFeedback = /(set|show|get)?(Error|Toast|Alert|Message|Snackbar)/i;

  // helper to extract text from JSX nodes
  function getTextFromJSX(node) {
    if (node.type === "JSXText") return node.value.toLowerCase().trim();
    if (node.type === "JSXElement" && node.children) {
        return node.children.map(getTextFromJSX).join(" ");
    }
    return "";
  }

  // helper to check if an undo option exists among siblings (like "Undo" button or text)
  function hasUndoSibling(path) {
    const parent = path.parentPath;
    if (!parent || !parent.node || !parent.node.children) return false;
    return parent.node.children.some(child => {
        if (child === path.node) return false; // skip self
        if (child.type === "JSXElement") {
        const text = getTextFromJSX(child);
        return undoWords.test(text);
        }
        if (child.type === "JSXText") {
        return undoWords.test(child.value);
        }
        return false;
    });
    }

    // helper determines if a node is a fetch or axios call
    function isNetworkCall(node) {
    if (!node || node.type !== "CallExpression") return false;

    const callee = node.callee;

    // fetch(...)
    if (callee.type === "Identifier" && callee.name === "fetch") return true;

    // axios.get/post/put/delete(...)
    if (
        callee.type === "MemberExpression" &&
        callee.object?.name === "axios" &&
        ["get", "post", "put", "delete"].includes(callee.property?.name)
    ) {
        return true;
    }

    return false;
    }

    // helper checks if node is inside a try-catch
    function isInsideTryCatch(path) {
    return path.findParent(p => 
        p &&
        typeof p === "object" &&
        //checks for try parent
        p.isTryStatement());
    }

    // helper to detects if a path is followed by a `.catch(...)`
    function findCatchHandler(path) {
    let current = path;

    while (current) {
        const node = current.node;

        // Looks for: .catch(...)
        if (
        node?.type === "CallExpression" &&
        node.callee?.type === "MemberExpression" &&
        node.callee.property?.type === "Identifier" &&
        node.callee.property.name === "catch"
        ) {
        return current;
        }

        current = current.parentPath;
    }

    return null;
    }

    // helper determines if the code block only contains dev feedback (console.log/error)
    function isDevOnlyFeedback(node) {
    if (!node || node.type !== "ExpressionStatement") return false;

    const expr = node.expression;
    if (!expr || expr.type !== "CallExpression") return false;

    const callee = expr.callee;

    if (
        callee?.type === "MemberExpression" &&
        callee.object?.type === "Identifier" &&
        callee.object.name === "console" &&
        callee.property?.type === "Identifier"
    ) {
        //only detects console.log, not console.error?!
        return callee.property.name === "log" || callee.property.name === "error"
    }

    return false;
    }

    // helper checks if the code has meaningful user-facing feedback
    function isUserFeedback(node) {
    if (!node) return false;

    // Statement like setError("...") or showToast(...)
    if (
        node.type === "ExpressionStatement" &&
        node.expression?.type === "CallExpression"
    ) {
        const callee = node.expression.callee;

        if (callee.type === "Identifier" && userErrorFeedback.test(callee.name)) {
        return true;
        }

        if (callee.type === "MemberExpression" && userErrorFeedback.test(callee.property?.name)) {
        return true;
        }
    }

    // JSX return like: return <Error />
    if (
        node.type === "ReturnStatement" &&
        node.argument?.type === "JSXElement"
    ) {
        const tag = node.argument.openingElement?.name?.name;
        return /error|toast|errormessage|errorboundary|alert|message/i.test(tag.toLowerCase());
    }

    return false;
    }

    // helper extracts feedback for catch blocks or .catch handlers
    function analyzeErrorHandlerCatchStatements(statements, line, feedback) {
    const onlyDevLogs = statements.length > 0 && statements.every(isDevOnlyFeedback);
    const hasUserFeedback = statements.some(isUserFeedback);

    if (onlyDevLogs && !hasUserFeedback) {
        feedback.push({
        type: "dev-only-error-handling",
        line,
        message: `Error handler contains only console logs.`,
        severity: "warning",
        why: "This provides no feedback to users when an error occurs.",
        action: "Consider displaying user feedback (e.g. setError, <Error />)",
        });
    }
    }


  let ast;
  try {
    ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });
  } catch (err) {
    throw new Error("Could not parse JSX content: " + err.message);
  }

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const tagNode = path.node.openingElement?.name;
      if (!tagNode || tagNode.type !== "JSXIdentifier") return;

      const tag = tagNode.name.toLowerCase();
      const children = Array.isArray(node.children) ? node.children : [];
      const line = node.loc?.start?.line ?? null;
    
    // Check for destructive buttons missing undo
    if (tag === "button") {
      const buttonText = getTextFromJSX(node);

      if (destructiveWords.test(buttonText)) {
        // Check for undo/restore nearby
        if (!hasUndoSibling(path)) {
          feedback.push({
            type: "missing-undo-option",
            line: node.loc?.start?.line,
            message: `Destructive button "${buttonText}" found without an undo or restore action nearby.`,
            severity: "warning",
            why: "Users may accidentally trigger destructive actions and need a way to recover.",
            action: "Add an 'Undo' button or option near the destructive action.",
          });
        }
      }
    }

      // 1. Detect confirmation dialog with destructive language
      if (modalLikeTags.includes(tag.toLowerCase())) {
        if (confirmationWords.test(content)) {

          const hasCancelOption = children.some(
            (c) =>
              c.type === "JSXElement" &&
              c.openingElement?.name?.type === "JSXIdentifier" &&
              cancelWords.test(
                c.children
                  ?.filter((cc) => cc.type === "JSXText")
                  .map((cc) => cc.value.toLowerCase())
                  .join(" ")
              )
          );

          if (!hasCancelOption) {
            feedback.push({
              type: "missing-cancel-option",
              line,
              message: `Dialog contains destructive language but no cancel or 'go back' option.`,
              severity: "warning",
              why: "Users may feel forced into a destructive action without a way to back out.",
              action: "Add a 'Cancel' or 'Go Back' button to allow users to exit safely.",
            });
          }
        }
      }

      // 2. Detect select or custom fields missing hints
      if (contextualFields.includes(tag.toLowerCase())) {
        const hasTooltipAttr = path.node.openingElement.attributes.some(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name?.type === "JSXIdentifier" &&
            ["title", "aria-label", "aria-describedby"].includes(attr.name.name)
        );

        if (!hasTooltipAttr) {
          feedback.push({
            type: "missing-context-hint",
            line,
            message: `<${tag}> field is missing contextual help.`,
            severity: "warning",
            why: "Users may not understand the purpose of the field without additional context.",
            action: "Add 'aria-label', 'title', or helper text to clarify the field's purpose.",
          });
        }
      }

    },
    
    // 3. Detect fetch/axios calls without proper error handling
    CallExpression(path) {
    const node = path.node;
    if (!isNetworkCall(node)) return;

    const line = node.loc?.start?.line ?? null;
    const feedbackLine = line || path.node.start;

    const insideTry = isInsideTryCatch(path);
    const catchPath = findCatchHandler(path);

    if (!insideTry && !catchPath) {
        feedback.push({
        type: "network-missing-catch",
        line: feedbackLine,
        message: `AJAX call (fetch/axios) is missing error handling.`,
        severity: "warning",
        why: "Network requests can fail, and unhandled errors may lead to poor user experience.",
        action: "Wrap the call in try/catch or add a .catch handler to manage errors.",
        });
        return;
    }

    // Analyze .catch(fn) if present
    if (catchPath?.node?.arguments?.length > 0) {
        const handler = catchPath.node.arguments[0];

        if (
        handler.type === "ArrowFunctionExpression" ||
        handler.type === "FunctionExpression"
        ) {
        if (handler.body.type === "BlockStatement") {
            const statements = handler.body.body;
            analyzeErrorHandlerCatchStatements(statements, handler.loc?.start?.line, feedback);
        } else {
            // One-liner: e => console.log(e)
            analyzeErrorHandlerCatchStatements(
            [{ type: "ExpressionStatement", expression: handler.body }],
            handler.loc?.start?.line,
            feedback
            );
        }
        }
    }
    },

    // Analyze try-catch blocks for dev-only error handling
    CatchClause(path) {
    const catchBody = path.node.body?.body ?? [];
    const line = path.node.loc?.start?.line ?? null;

    const onlyDevLogs = catchBody.length > 0 && catchBody.every(isDevOnlyFeedback);
    const hasUserFeedback = catchBody.some(isUserFeedback);

    if (onlyDevLogs && !hasUserFeedback) {
        feedback.push({
        type: "dev-only-error-handling",
        line,
        message: `Catch block only logs errors using console.log or console.error. Consider providing user-facing feedback.`,
        severity: "warning",
        why: "This provides no feedback to users when an error occurs.",
        action: "Consider displaying user feedback (e.g. setError, <Error />)",
        });
    }
    },

    // Warn if try block is missing a catch handler
    TryStatement(path) {
    const node = path.node;
    const hasCatch = Boolean(node.handler);
    const line = node.loc?.start?.line;

    if (!hasCatch) {
        feedback.push({
        type: "missing-catch-in-try",
        line,
        message: `Try block is missing a catch handler. Errors inside may go unhandled.`,
        severity: "warning",
        why: "Unhandled errors can lead to poor user experience.",
        action: "Add a catch block to try{} to handle potential errors.",
        });
    }
    }
    });


  return feedback;
}

module.exports = { detectErrorPrevention };