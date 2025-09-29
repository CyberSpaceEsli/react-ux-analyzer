const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectShortcuts - Detects presence of keyboard shortcut handling in fetch and useEffect
 * Based on Nielsen Heuristic #7: Flexibility & Efficiency of Use
 */
function detectShortcuts(content) {
  const feedback = [];

  let ast;
  try {
    ast = parse(content, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  } catch (err) {
    throw new Error("JSX code could not be parsed: " + err.message);
  }

  // Analysis for keyboard listener
  traverse(ast, {
    CallExpression(path) {
    const callee = path.node.callee;

    // Detect useEffect body
    if (callee &&
      callee.type === "Identifier" &&
      callee.name === "useEffect") {
      const useEffectBody = path.node.arguments?.[0];

      if (
        useEffectBody?.type === "ArrowFunctionExpression" &&
        useEffectBody.body.type === "BlockStatement"
      ) {
        const bodyCode = content.slice(
          useEffectBody.body.start,
          useEffectBody.body.end
        );
        const effectBody = useEffectBody.body.body || [];

        // Heuristic: does the body contain something like keydown handling?
        const intendedShortcut = /key(?:Down)?|keydown|onkeydown|onKey|shortcut/i.test(
          bodyCode
        );

        let hasAddKeyListener = false;
        let hasRemoveKeyListener = false;
        let handlerName = null;

        // Loop through each statement inside the useEffect block
        for (const stmt of effectBody) {
        // Check for: document.addEventListener("keydown", handler)
        if (stmt.type === "ExpressionStatement") {
            const expr = stmt.expression;

            if (
            expr?.type === "CallExpression" &&
            expr.callee?.type === "MemberExpression" &&
            expr.callee.object?.type === "Identifier" &&
            expr.callee.object.name === "document" &&
            expr.callee.property?.type === "Identifier" &&
            expr.callee.property.name === "addEventListener" &&
            expr.arguments?.[0]?.type === "StringLiteral" &&
            expr.arguments?.[0]?.value === "keydown"
            ) {
            hasAddKeyListener = true;
            // Store handler name to match later in removeEventListener
            if (expr.arguments[1]?.type === "Identifier") {
                handlerName = expr.arguments[1].name;
            }
            }
        }

        // Check for: return () => { document.removeEventListener(...) }
        if (stmt.type === "ReturnStatement") {
            const fn = stmt.argument;

            if (fn?.type === "ArrowFunctionExpression" && fn.body.type === "BlockStatement") {
            for (const cleanupStmt of fn.body.body) {
                const expr = cleanupStmt.type === "ExpressionStatement" && cleanupStmt.expression;

                if (
                expr?.type === "CallExpression" &&
                expr.callee?.type === "MemberExpression" &&
                expr.callee.object?.type === "Identifier" &&
                expr.callee.object.name === "document" &&
                expr.callee.property?.type === "Identifier" &&
                expr.callee.property.name === "removeEventListener" &&
                expr.arguments?.[0]?.type === "StringLiteral" &&
                expr.arguments?.[0]?.value === "keydown" &&
                (!handlerName || (
                    expr.arguments[1]?.type === "Identifier" &&
                    expr.arguments[1].name === handlerName
                ))
                ) {
                hasRemoveKeyListener = true;
                }
            }
            }
         }
        }

        const line = path.node.loc?.start.line ?? 1;

        // Keyboard handling in useEffect but no keydown listener event found, warn
        if (intendedShortcut && !hasAddKeyListener) {
          const line = path.node.loc?.start.line ?? 1;
          feedback.push({
            type: "missing-keydown",
            line,
            message:
              "This `useEffect` looks like it handles keyboard input, but no `keydown` event listener was found.",
            severity: "warning",
            action: "Add `document.addEventListener('keydown', handler)` inside the effect.",
            why: "Keyboard shortcuts need a keydown listener to function.",
          });
        }

        if (hasAddKeyListener && !hasRemoveKeyListener) {
        feedback.push({
          type: "missing-remove-keydown",
          line,
          message:
            "`keydown` listener was added via `addEventListener`, but no `removeEventListener` found in cleanup.",
          severity: "warning",
          action: "Add `document.removeEventListener('keydown', handler)` in the cleanup function.",
          why: "Keyboard shortcuts need to be removed when the component unmounts.",
        });
      }

      }
    }
  },
  });

  // === Regex-based menu/nav shortcut hint detection ===

  const shortcutRegex = /\b(Ctrl|Cmd|⌘|Alt|Option|Shift)\s*\+?\s*\w+/i;
  const navOrMenuBlocks = [...content.matchAll(/<(nav|link|menu)[^>]*>([\s\S]*?)<\/\1>/gi)];

  const keywords = ["save", "open", "new", "print", "copy", "paste", "search", "close"];

  navOrMenuBlocks.forEach((block) => {
    const tag = block[1];            // "nav" or "menu"
    const innerContent = block[2];   // the inner text
    const blockStartIndex = block.index;
    const lineNumber = content.slice(0, blockStartIndex).split("\n").length;

    const lower = innerContent.toLowerCase();
    const containsKeyword = keywords.some((word) => lower.includes(word));
    const hasShortcutHint = shortcutRegex.test(innerContent);

    if (containsKeyword && !hasShortcutHint) {
      feedback.push({
        type: "missing-shortcut-hint",
        line: lineNumber,
        message: `No visible shortcut hints found in <${tag}> with action items like "save" or "open".`,
        severity: "warning",
        action: `Add visible shortcut hints (e.g. "Ctrl+S") next to action items.`,
        why: "Visible shortcut hints help users discover keyboard shortcuts for efficiency.",
      });
    }
      });

  return feedback;
}

module.exports = { detectShortcuts };