const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectHelpErrorRecognition - Detects technical jargon in user-facing errors and lack of visual error cues
 * Nielsen's Heuristic #9: Help Users Recognize, Diagnose, and Recover from Errors
 */
function detectHelpErrorRecognition(content) {
  const feedback = [];

  const technicalErrorRegex = /\b(error\s*\d{3,4}|api error|err_?[a-z0-9_]+|code\s*\d+|network error|request failed|failed to fetch)\b/i;

  function extractJSXText(node) {
    if (node.type === "JSXText") return node.value;
    if (node.type === "JSXElement" && node.children) {
      return node.children.map(extractJSXText).join(" ");
    }
    return "";
  }

  // Recursive function to check if element or any children have red or bold styles
  function hasVisualStyle(node) {
    if (!node) return false;

    // Check current node styles and classes
    if (node.type === "JSXElement") {
      const attrs = node.openingElement.attributes || [];

      // Check classes for error-like keywords
      const classAttr = attrs.find(a => a.type === "JSXAttribute" && a.name.name === "className" && a.value?.type === "StringLiteral");
      const classNameVal = classAttr?.value?.value || "";
      const isErrorClass = /(error|danger|fail|warning)[-_]?/i.test(classNameVal);

      // Check inline styles
      const styleAttr = attrs.find(a => a.type === "JSXAttribute" && a.name.name === "style" && a.value.type === "JSXExpressionContainer");
      let hasRed = false;
      let hasBold = false;
      if (styleAttr && styleAttr.value.expression.type === "ObjectExpression") {
        hasRed = styleAttr.value.expression.properties.some(p =>
          ((p.key.type === "Identifier" && p.key.name === "color") || (p.key.type === "StringLiteral" && p.key.value === "color")) &&
          p.value.type === "StringLiteral" &&
          /red/i.test(p.value.value)
        );
        hasBold = styleAttr.value.expression.properties.some(p =>
          ((p.key.type === "Identifier" && p.key.name === "fontWeight") || (p.key.type === "StringLiteral" && p.key.value === "fontWeight")) &&
          p.value.type === "StringLiteral" &&
          /(semibold|bold|extrabold|font|700|800|900)/i.test(p.value.value)
        );
      }

      if (isErrorClass || hasRed || hasBold) return true;

      // Recursively check children
      return node.children.some(child => hasVisualStyle(child));
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
      const opening = node.openingElement;
      const tagNode = opening?.name;
      if (!tagNode || tagNode.type !== "JSXIdentifier") return;

      const tagName = tagNode.name.toLowerCase();
      const line = node.loc?.start?.line ?? null;

      const attrs = opening?.attributes ?? [];

      const isErrorComponent = ["error", "alert", "message", "notification", "errormessage", "formerror"].includes(tagName);

      const classAttr = attrs.find(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name?.name === "className" &&
          attr.value?.type === "StringLiteral"
      );
      const classNameVal = classAttr?.type === "JSXAttribute" && classAttr?.value?.type === "StringLiteral" ? classAttr?.value?.value : "";
      const isErrorClass = /(error|alert|danger|fail|invalid|warning|notice|msg|feedback)[-_]?/i.test(classNameVal);

      const text = extractJSXText(node);
      const matchesTechnical = technicalErrorRegex.test(text);

      // Only proceed if this is error component or has error class
      if (!isErrorComponent && !isErrorClass) return;

      // 1. Warn if technical jargon used (both error component or error class)
      if (matchesTechnical) {
        feedback.push({
          type: "technical-error-message",
          line,
          message: `User-facing error contains technical jargon or error code ("${text.trim()}"). Express errors in plain language and offer a constructive suggestion.`,
          severity: "warning",
          why: "Technical error messages can confuse users and hinder their ability to recover from errors.",
          action: "Replace technical terms with user-friendly language and provide actionable next steps.",
        });
      }

      // 2. Warn if no visual style found on element or its children
      if (!hasVisualStyle(node)) {
        feedback.push({
          type: "error-lacks-visual-style",
          line,
          message: "Error message detected but lacks visual cues like red color and bold font.",
          severity: "warning",
          why: "Errors should be visually distinct to help users quickly recognize them.",
          action: "Add visual styles (e.g., red text, bold font) to make the error message stand out.",
        });
      }
    }
  });

  return feedback;
}

module.exports = { detectHelpErrorRecognition };