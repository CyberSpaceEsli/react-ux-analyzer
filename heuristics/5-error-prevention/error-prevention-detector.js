const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectErrorPrevention - Scans React code for usability issues based on
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
            message: `Destructive button "${buttonText}" found without an undo or restore action nearby. Consider providing an undo or revert option for safety.`,
            severity: "warning",
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
            message: `<${tag}> field is missing contextual help. Consider using 'aria-label', 'title', or helper text.`,
            severity: "warning",
          });
        }
      }

    },
    });

  return feedback;
}

module.exports = { detectErrorPrevention };