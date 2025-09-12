const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectControlExits - Detects missing exit mechanisms in React components
 * Nielsen Heuristic #3: User Control and Freedom
 */
function detectControlExits(content) {
  const feedback = [];
  const nextButtonLines = [];

  let hasNextButton = false;
  let hasBackButton = false;

  const destructiveButtons = [];
  const undoButtons = [];

  const ast = parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const nameNode = node.openingElement.name;
      const elementName = nameNode?.type === "JSXIdentifier" ? nameNode.name : null;

      // --- Modal/Dialog/Drawer/Popover checks ---
      if (["Modal", "Dialog", "Drawer", "Popover"].includes(elementName)) {
        // 1️⃣ Must have onClose prop
        const hasOnClose = node.openingElement.attributes.some(
          a => a.type === "JSXAttribute" && a.name.name === "onClose"
        );
        if (!hasOnClose) {
          feedback.push({
            type: "missing-control",
            line: node.loc.start.line,
            message: `${elementName} missing onClose handler. Users may be trapped.`,
            severity: "warning",
          });
        }

        // 2️⃣ Check for buttons with "close" or "cancel" text inside
        const closeButtonExists = node.children.some(child => {
          if (child.type === "JSXElement" && child.openingElement.name.type === "JSXIdentifier") {
            if (child.openingElement.name.name === "button") {
              const text = (child.children || [])
                .map(c => (c.type === "JSXText" ? c.value : ""))
                .join("")
                .trim()
                .toLowerCase();
              return /close|exit|x|cancel/i.test(text);
            }
          }
          return false;
        });

        if (!closeButtonExists) {
          // Push feedback at the location of the parent modal/dialog
          feedback.push({
            type: "missing-control",
            line: node.loc.start.line,
            message: `${elementName} has no visible Close or Cancel button. Add a clear exit mechanism.`,
            severity: "warning",
          });
        }
      }

      // --- Button checks for multi-step forms and destructive actions ---
      if (elementName === "button") {
        const buttonText = (node.children || [])
          .map(c => (c.type === "JSXText" ? c.value : ""))
          .join("")
          .trim()
          .toLowerCase();

        // Multi-step form navigation
        if (buttonText.includes("next") || buttonText.includes("finish")) {
          hasNextButton = true;
          nextButtonLines.push(node.loc.start.line);
        }
        if (buttonText.includes("back") || buttonText.includes("previous")) hasBackButton = true;

        // Destructive actions
        if (buttonText.includes("delete") || buttonText.includes("remove")) destructiveButtons.push(node);
        if (buttonText.includes("undo") || buttonText.includes("cancel") || buttonText.includes("restore"))
          undoButtons.push(node);
      }
    },
  });

  // --- Multi-step forms: Next without Back ---
  if (hasNextButton && !hasBackButton) {
    for (const line of nextButtonLines) {
      feedback.push({
        type: "missing-control",
        line,
        message: "Multi-step flow has Next/Finish button but no Back/Previous button. Provide a way to reverse steps.",
        severity: "warning",
      });
    }
  }

  // --- Destructive actions without Undo ---
  if (destructiveButtons.length > 0 && undoButtons.length === 0) {
    for (const btn of destructiveButtons) {
      feedback.push({
        type: "missing-control",
        line: btn.loc.start.line,
        message: "Destructive action detected without Undo/Cancel/Restore. Allow users to revert mistakes.",
        severity: "warning",
      });
    }
  }

  return feedback;
}

module.exports = { detectControlExits };