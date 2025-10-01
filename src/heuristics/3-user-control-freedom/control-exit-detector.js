const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectControlExits - Detects missing exit mechanisms in modals and dialogs, missing Back buttons in multi-step flows, and missing Undo options for destructive actions.
 * Nielsen Heuristic #3: User Control and Freedom
 */
function detectControlExits(content) {
  const feedback = [];
  const nextButtonLines = [];

  let hasNextButton = false;
  let hasBackButton = false;

  const destructiveButtons = [];
  const undoButtons = [];

  let ast;
  try {
    ast = parse(content, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  } catch (err) {
    throw new Error("JSX code could not be parsed: " + err.message);
  }

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const nameNode = node.openingElement.name;
      const elementName = nameNode?.type === "JSXIdentifier" ? nameNode.name : null;

      // Do Modal/Dialog/Drawer/Popover components have onClose prop and visible close button
      if (["Modal", "Dialog", "Drawer", "Popover", "modal", "dialog", "drawer", "popover"].includes(elementName)) {
        // must have onClose prop
        const hasOnClose = node.openingElement.attributes.some(
          a => a.type === "JSXAttribute" && a.name.name === "onClose"
        );
        if (!hasOnClose) {
          feedback.push({
            type: "missing-control",
            line: node.loc.start.line,
            message: `${elementName} is missing a close option for users.`,
            severity: "warning",
            action: "Add `onClose` prop to allow users to exit the modal/dialog.",
            why: "Users need to close modals or dialogs to regain control of the interface."
          });
        }

        // check for buttons with "close" or "cancel" text inside
        const closeButtonExists = node.children.some(function check(child) {
          if (child.type === "JSXElement" && child.openingElement.name.type === "JSXIdentifier") {
            if (child.openingElement.name.name === "button") {
              const text = (child.children || [])
                .map(c => (c.type === "JSXText" ? c.value : ""))
                .join("")
                .trim()
                .toLowerCase();
              if (/close|exit|x|cancel/i.test(text)) return true;
            }
            if (child.children && child.children.some(check)) return true;
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
            why: "Make sure the exit in the modal/dialog is clearly labeled and discoverable.",
            action: "Add a Close or Cancel button inside the modal/dialog."
          });
        }
      }

      // Checks multi-step forms if back/previous exists whith next/finish and buttons for destructive actions
      if (elementName === "button") {
        const buttonText = (node.children || [])
          .map(c => (c.type === "JSXText" ? c.value : ""))
          .join("")
          .trim()
          .toLowerCase();

        // multi-step form navigation
        if (buttonText.includes("next") || buttonText.includes("finish")) {
          hasNextButton = true;
          nextButtonLines.push(node.loc.start.line);
        }
        if (buttonText.includes("back") || buttonText.includes("previous")) hasBackButton = true;

        // destructive actions
        if (buttonText.includes("delete") || buttonText.includes("remove")) destructiveButtons.push(node);
        if (buttonText.includes("undo") || buttonText.includes("cancel") || buttonText.includes("restore"))
          undoButtons.push(node);
      }
    },
  });

  // multi-step forms next without back
  if (hasNextButton && !hasBackButton) {
    for (const line of nextButtonLines) {
      feedback.push({
        type: "missing-control",
        line,
        message: "Multi-step flow has Next/Finish button but no Back/Previous button. Provide a way to reverse steps.",
        severity: "warning",
        why: "Users may want to go back to previous steps in a multi-step process.",
        action: "Add a Back or Previous button to allow users to navigate backwards.",
      });
    }
  }

  // destructive actions without undo
  if (destructiveButtons.length > 0 && undoButtons.length === 0) {
    for (const btn of destructiveButtons) {
      feedback.push({
        type: "missing-control",
        line: btn.loc.start.line,
        message: "Destructive action detected without Undo/Cancel/Restore.",
        severity: "warning",
        why: "Users may accidentally trigger destructive actions and need a way to recover.",
        action: "Add an Undo, Cancel, or Restore option after destructive actions.",
      });
    }
  }

  return feedback;
}

module.exports = { detectControlExits };