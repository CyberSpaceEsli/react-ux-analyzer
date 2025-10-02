const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectErrorPrevention - Detects meaningful user feedback and error prevention for fetch/axios calls
 * Nielsen's Heuristic #5: Error Prevention
 */
function detectErrorPrevention(content) {
  const feedback = [];

  const destructiveWords = /\b(delete|remove|clear|discard|trash|reset)\b/i;
  const confirmationWords = /\b(are you sure|permanently|cannot be undone|irreversible|undone|reset|clear all)\b/i;
  const cancelWords = /\b(cancel|no|exit|return|back|undo)\b/i;
  const modalLikeTags = ["modal", "dialog", "confirmdialog", "popup", "alertdialog"];
  const contextualFields = ["select", "dropdown", "checkboxgroup", "radiogroup", "upload", "filepicker"];
  const userErrorFeedback = /(set|show|get)?(Error|Toast|Alert|Message|Snackbar)/i;

    // Helper: recursively extract text from JSX nodes
    function getTextFromJSX(node) {
      if (node.type === "JSXText") return node.value.toLowerCase().trim();
      if (node.type === "JSXElement" && node.children) {
          return node.children.map(getTextFromJSX).join(" ");
      }
      return "";
    }
  
    // Helper: recursively check if any child contains destructive words
    function hasDestructiveOrConfirmationText(children) {
      for (const child of children) {
        if (child.type === "JSXElement") {
          const text = getTextFromJSX(child);
          if (destructiveWords.test(text) || confirmationWords.test(text)) {
            return true;
          }
          if (Array.isArray(child.children) && hasDestructiveOrConfirmationText(child.children)) {
            return true;
          }
        } else if (child.type === "JSXText" && (destructiveWords.test(child.value) || confirmationWords.test(child.value))) {
          return true;
        }
      }
      return false;
    }

    // Helper: determine if a node is a fetch or axios call
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

    // Helper: check if node is inside a try-catch
    function isInsideTryCatch(path) {
    return path.findParent(p => 
        p &&
        typeof p === "object" &&
        //checks for try parent
        p.isTryStatement());
    }

    // Helper: detects if a path is followed by a `.catch(...)`
    function findCatchHandler(path) {
    let current = path;

    while (current) {
        const node = current.node;

        // looks for: .catch(...)
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

    // Helper: if code block only contains dev feedback (console.log/error)
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

    // Helper: check if the code error feedback by error handling is given (setError, <Error />, etc)
    function isUserFeedback(node) {
    if (!node) return false;

    // statements like setError("...") or showToast(...) should be present
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

    // Detect <Error />, <Toast />, <Alert /> components
    if (
        node.type === "ReturnStatement" &&
        node.argument?.type === "JSXElement"
    ) {
        const tag = node.argument.openingElement?.name?.name;
        return /error|toast|errormessage|errorboundary|alert|message/i.test(tag.toLowerCase());
    }

    return false;
    }

    // Helper: extract feedback for catch blocks or .catch handlers
    function analyzeErrorHandlerCatchStatements(statements, line, feedback) {
    const onlyDevLogs = statements.length > 0 && statements.every(isDevOnlyFeedback);
    const hasUserFeedback = statements.some(isUserFeedback);

    if (onlyDevLogs && !hasUserFeedback) {
        feedback.push({
        type: "dev-only-error-handling",
        line,
        message: `Error handler contains only console log.`,
        severity: "warning",
        why: "This provides no feedback to users when an error occurs.",
        action: "Consider displaying user feedback (e.g. setError, <Error />)",
        });
    }
    }

    // Helper: Search cancelWords recursively in children
    function hasCancelWordsRecursively(children) {
    for (const c of children) {
      if (c.type === "JSXElement") {
        // Prüfe, ob das Element ein Cancel-Button ist
        const tag = c.openingElement?.name?.name?.toLowerCase();
        const text = getTextFromJSX(c);
        if (
          tag === "button" &&
          cancelWords.test(text)
        ) {
          return true;
        }
        // Rekursiv in die Kinder gehen
        if (Array.isArray(c.children) && hasCancelWordsRecursively(c.children)) {
          return true;
        }
      }
      // Prüfe auch direktes JSXText
      if (c.type === "JSXText" && cancelWords.test(c.value)) {
        return true;
      }
    }
    return false;
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
    
    // Check for destructive text in modals missing cancel option
    if (modalLikeTags.includes(tag)) {
      if (hasDestructiveOrConfirmationText(children)) {
        const cancelExists = hasCancelWordsRecursively(children);
        if (!cancelExists) {
          feedback.push({
            type: "missing-cancel-option",
            line,
            message: `Dialog contains destructive action text.`,
            severity: "warning",
            why: "Users need second chance to confirm if they want to continue with destructive operations.",
            action: "Try the best in offering an cancel or undo option for backing out.",
          });
        }
      }
    }

      // Detect dialog with destructive language but no cancel option
      /*if (modalLikeTags.includes(tag.toLowerCase())) {
        if (confirmationWords.test(content)) {

          // check if cancel option exists in children
          const hasCancelOption = hasCancelWordsRecursively(children);

          if (!hasCancelOption) {
            feedback.push({
              type: "missing-cancel-option",
              line,
              message: `Dialog contains destructive language but no 'cancel' or 'go back' option.`,
              severity: "warning",
              why: "Users may feel forced into a destructive action without a way to back out.",
              action: "Add a 'Cancel' or 'Go Back' button to allow users to exit safely.",
            });
          }
        }
      }*/

      // Select or custom fields missing hints
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
    
    // Detects fetch/axios calls without proper error handling missing catch or try-catch
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

    // analyze .catch(fn) if present
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
            // e => console.log(e)
            analyzeErrorHandlerCatchStatements(
            [{ type: "ExpressionStatement", expression: handler.body }],
            handler.loc?.start?.line,
            feedback
            );
        }
        }
    }
    },

    // Analyze try-catch blocks for dev-only error handling usign console.logs
    CatchClause(path) {
    const catchBody = path.node.body?.body ?? [];
    const line = path.node.loc?.start?.line ?? null;

    const onlyDevLogs = catchBody.length > 0 && catchBody.every(isDevOnlyFeedback);
    const hasUserFeedback = catchBody.some(isUserFeedback);

    if (onlyDevLogs && !hasUserFeedback) {
        feedback.push({
        type: "dev-only-error-handling",
        line,
        message: `Catch block only logs errors using console.log. Consider providing user-facing feedback.`,
        severity: "warning",
        why: "This provides no feedback to users when an error occurs.",
        action: "Consider displaying user feedback (e.g. setError, <Error />)",
        });
    }
    },

    // Warns if try block is missing a catch handler
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