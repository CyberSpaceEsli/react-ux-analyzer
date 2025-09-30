const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectHelpErrorRecognition - Detects technical jargon in user-facing errors and lack of visual error cues
 * Nielsen's Heuristic #9: Help Users Recognize, Diagnose, and Recover from Errors
 */
function detectHelpErrorRecognition(content) {
  const feedback = [];

  const technicalErrorRegex = /\b(error\s*\d{3,4}|api error|err_?[a-z0-9_]+|code\s*\d+|network error|request failed|failed to fetch)\b/i;

  // Helper: to extract all text from jsx elements
  function extractJSXText(node) {
    if (node.type === "JSXText") return node.value;
    if (node.type === "JSXElement" && node.children) {
      return node.children.map(extractJSXText).join(" ");
    }
    return "";
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

      // Determine if this is an "error-like" component and styled that way
      const isErrorComponent = ["error", "alert", "message", "notification", "errormessage", "formerror"].includes(tagName.toLowerCase());

      const classAttr = attrs.find(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name?.name === "className" &&
          attr.value?.type === "StringLiteral"
      );

      const classNameVal = classAttr?.type === "JSXAttribute" && classAttr?.value?.type === "StringLiteral" ? classAttr?.value?.value ?? "" : "";

      const isErrorClass = /(error|alert|danger|fail|invalid|warning|notice|msg|feedback)[-_]?/i.test(classNameVal);

      // Search inline style attributes
      const styleAttr = attrs.find(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name?.name === "style" &&
          attr.value?.type === "JSXExpressionContainer"
      );
       
    let hasRedStyle = false;
    let hasBoldStyle = false;

    if (
      styleAttr?.type === "JSXAttribute" &&
      styleAttr.value?.type === "JSXExpressionContainer" &&
      styleAttr.value.expression?.type === "ObjectExpression"
    ) {
    // Check for color: 'red'  
    hasRedStyle = styleAttr.value.expression.properties.some(
    (prop) =>
        prop.type === "ObjectProperty" &&
        (
          (prop.key.type === "Identifier" && prop.key.name === "color") ||
          (prop.key.type === "StringLiteral" && prop.key.value === "color")
        ) &&
        prop.value.type === "StringLiteral" &&
        /red/i.test(prop.value.value)
    );

    // Check for fontWeight: 'bold' or 700, 800, 900
    hasBoldStyle = styleAttr.value.expression.properties.some(
    (prop) =>
        prop.type === "ObjectProperty" &&
        (
          (prop.key.type === "Identifier" && prop.key.name === "fontWeight") ||
          (prop.key.type === "StringLiteral" && prop.key.value === "fontWeight")
        ) &&
        prop.value.type === "StringLiteral" &&
        /(bold|font|700|800|900)/i.test(prop.value.value)
    );
    }

    const text = extractJSXText(node);

    // Compare if text has technical error message
    const matchesTechnical = technicalErrorRegex.test(text);

    if (isErrorComponent || isErrorClass || hasRedStyle || matchesTechnical) {
        // If technical error phrasing is used, warn
        if (matchesTechnical) {
          feedback.push({
            type: "technical-error-message",
            line,
            message: `User-facing error contains technical jargon or error code ("${text.trim()}"). Express errors in plain language and offer a constructive suggestion.`,
            severity: "warning",
            why: `Technical error messages can confuse users and hinder their ability to recover from errors.`,
            action: `Replace technical terms with user-friendly language and provide actionable next steps.`,
          });
        }

    if (isErrorComponent || isErrorClass || hasRedStyle || matchesTechnical) {

      // If there is no visual indication of an error, warn
      const hasVisualIndicator = isErrorClass || hasRedStyle || hasBoldStyle;

      if (!hasVisualIndicator) {
        feedback.push({
          type: "error-lacks-visual-style",
          line,
          message: `Error message detected but lacks visual cues like red color and bold font.`,
          severity: "warning",
          why: `Errors should be visually distinct to help users quickly recognize them.`,
          action: `Add visual styles (e.g., red text, bold font) to make the error message stand out.`,
        });
      }
    }

    }
    },
  });

  return feedback;
}

module.exports = { detectHelpErrorRecognition };