/**
 * Control Exit Detector for React UX Analysis
 * 
 * Detects modal/dialog components that lack proper exit mechanisms (Nielsen Heuristic #3: User Control and Freedom)
 * 
 * Features:
 * - Regex-based detection of Modal/Dialog components
 * - Tracks multi-step flows (Step/Next without Back)
 * - Tracks destructive actions (Delete/Remove without Undo)
 * - Button/text detection for Back & Undo
 * - Regex-based fallback checks for Back and Undo
 */

const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

class ControlExitDetector {

  detectControlExits(content) {
    const patterns = [];

    // Reset state flags for this file
    this.hasSteps = false;
    this.hasNextButton = false;
    this.hasBackButton = false;
    this.hasDelete = false;
    this.hasUndo = false;

    // Für Multi-Step-Flow: speichere alle Next-Button-Zeilen
    const nextButtonLines = [];

    // Parse JSX file into AST
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      JSXElement: (path) => {
        const nameNode = path.node.openingElement.name;
        const elementName =
          nameNode && nameNode.type === "JSXIdentifier"
            ? nameNode.name
            : null;

        // --- Modal/Dialog checks ---
        if (["Modal", "Dialog", "SimpleDialog"].includes(elementName)) {
          const attrs = path.node.openingElement.attributes;

          // 1. Missing onClose prop
          const hasOnClose = attrs.some(
            (a) => a.type === "JSXAttribute" && a.name.name === "onClose"
          );

          if (!hasOnClose) {
            patterns.push({
              type: "missing-control",
              line: path.node.loc.start.line,
              message:
                "Modal/Dialog detected without onClose handler. Users may be trapped.",
              severity: "warning",
            });
          }

          // 2. Missing visible close button
          const hasCloseButton = this.containsCloseButton(path.node);
          if (!hasCloseButton) {
            patterns.push({
              type: "missing-control",
              line: path.node.loc.start.line,
              message:
                "Modal/Dialog has no visible close button. Add a clear exit mechanism (X or Close).",
              severity: "warning",
            });
          }
        }

        // --- Button checks (navigation & destructive actions) ---
        if (elementName === "button") {
          const buttonText = (path.node.children || [])
            .map((c) => (c.type === "JSXText" ? c.value : ""))
            .join("")
            .trim()
            .toLowerCase();

          if (buttonText.includes("next") || buttonText.includes("finish")) {
            this.hasNextButton = true;
            nextButtonLines.push(path.node.loc.start.line);
          }
          if (buttonText.includes("back") || buttonText.includes("previous")) this.hasBackButton = true;

          if (buttonText.includes("delete") || buttonText.includes("remove")) {
            this.hasDelete = true;
          }
          if (
            buttonText.includes("undo") ||
            buttonText.includes("cancel") ||
            buttonText.includes("restore")
          ) {
            this.hasUndo = true;
          }
        }
      },

      // --- Step flow checks ---
      JSXText: (path) => {
        if (/step\s*\d*/i.test(path.node.value)) {
          this.hasSteps = true;
        }
      },
    });

    // Multi-Step-Flow: Für jeden Next-Button ein Issue, wenn Step erkannt und kein Back vorhanden
    if (this.hasSteps && this.hasNextButton && !this.hasBackButton) {
      for (const line of nextButtonLines) {
        patterns.push({
          type: "missing-control",
          line,
          message:
            "Multi-step flow detected with Next but no Back button. Provide a way to reverse steps.",
          severity: "warning",
        });
      }
    }

    if (this.hasDelete && !this.hasUndo) {
      patterns.push({
        type: "missing-control",
        line: this._findLineNumber(content, "delete") || this._findLineNumber(content, "remove"),
        message:
          "Destructive action detected without Undo. Allow users to revert mistakes.",
        severity: "warning",
      });
    }

    // Kein Regex-Check für Back/Previous/Undo mehr

    return patterns;
  }

  // --- Helpers ---
  // Checks if a close button exists in the modal/dialog's children
  containsCloseButton(node) {
    if (!node.children) return false;

    for (const child of node.children) {
      if (child.type === "JSXElement") {
        const elName =
          child.openingElement.name.type === "JSXIdentifier"
            ? child.openingElement.name.name
            : "";

        // Typical close UI elements
        if (
          elName === "CloseButton" ||
          (elName === "Icon" &&
            child.openingElement.attributes.some(
              (a) =>
                a.type === "JSXAttribute" &&
                a.name.name === "name" &&
                a.value.value === "close"
            ))
        ) {
          return true;
        }

        // Recursively check nested elements
        if (this.containsCloseButton(child)) return true;
      }

      if (child.type === "JSXText" && /close/i.test(child.value)) {
        return true;
      }
    }
    return false;
  }

  // Helper to find the first line number containing a given keyword
  _findLineNumber(content, keyword) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
        return i + 1;
      }
    }
    return null;
  }

}

module.exports = ControlExitDetector;