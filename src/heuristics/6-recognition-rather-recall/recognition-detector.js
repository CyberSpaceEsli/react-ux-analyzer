const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
/*
    * detectRecognitionCues - Detects nav overload and missing placeholders for form input types
    * Based on Nielsen Heuristic #6: Recognition Rather Than Recall
*/
function detectRecognitionCues(content) {
  const feedback = [];

  const criticalInputTypes = ["tel", "date", "number", "email", "url", "password", "phone"];

  // helper to count menu items li, a, button recursively
  function countMenuItemsRecursively(children) {
  let count = 0;

  // Iterate through children nodes
  for (const child of children) {
    if (!child || child.type !== "JSXElement") continue;

    // Get the tag name of the child element
    const tag = child.openingElement?.name?.type === "JSXIdentifier"
      ? child.openingElement.name.name.toLowerCase()
      : "";

    // Count a, li, button as menu items
    if (["a", "button", "link", "route"].includes(tag)) {
      count++;
    }

    // Recurse into child elements
    if (Array.isArray(child.children)) {
      count += countMenuItemsRecursively(child.children);
    }
  }

  return count;
  }

  let ast;
  try {
    ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });
  } catch (err) {
    console.error("AST Parse error:", err.message);
    throw new Error("Could not parse JSX content: " + err.message);
  }

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const opening = node.openingElement;
      if (!opening || opening.type !== "JSXOpeningElement") return;

      const tagName = opening.type === "JSXOpeningElement" && opening.name?.type === "JSXIdentifier" && opening.name?.name;
      if (!tagName || typeof tagName !== "string") return;

      const tag = tagName.toLowerCase();
      const children = Array.isArray(node.children) ? node.children : [];
      const line = node.loc?.start?.line ?? null;

      // 1. Input types that need placeholders
      if (tag === "input") {
        const typeAttr = opening.attributes.find(
          (attr) =>
            attr?.type === "JSXAttribute" &&
            attr.name?.name === "type" &&
            attr.value?.type === "StringLiteral"
        );

        const typeValue = typeAttr?.type === "JSXAttribute" && typeAttr?.value?.type === "StringLiteral" && typeAttr?.value?.value;

        const needsPlaceholder = criticalInputTypes.includes(typeValue);

        const hasPlaceholder = opening.attributes.some(
          (attr) =>
            attr?.type === "JSXAttribute" &&
            attr.name?.name === "placeholder"
        );

        if (needsPlaceholder && !hasPlaceholder) {
          feedback.push({
            type: "missing-placeholder",
            line,
            message: `<input type='${typeValue}'> is missing a placeholder attribute.`,
            severity: "warning",
            why: `Placeholders help users recognize the expected input format.`,
            action: `Add a descriptive placeholder, e.g. <input type='${typeValue}' placeholder='Enter your ${typeValue}'>`,
          });
        }
      }

      // 2. nav/menu overloaded
      if (["nav", "menu", "routes"].includes(tag)) {
        // Counts how many direct child elements inside are also <nav> or <menu>
        const itemCount = countMenuItemsRecursively(children);

        // More than 7 items is considered overloaded
        if (itemCount > 7) {
          feedback.push({
            type: "nav-overloaded",
            line,
            message: `<${tag}> contains ${itemCount} items.`,
            severity: "warning",
            why: "Users can only remember 7 items in short-term memory.",
            action: `Reduce items in <${tag}> or group into submenus.`,
          });
        }
      }

      // 3. nav/menu inside footer
      if (tag === "footer") {
        const hasNav = children.some(
          (c) => {
            if (c?.type !== "JSXElement") return false;

            const childOpeningName = c.openingElement?.name;
            const childTag =
            childOpeningName?.type === "JSXIdentifier"
                ? childOpeningName.name.toLowerCase()
                : null;

            return ["nav", "menu"].includes(childTag);
        });

        if (!hasNav) {
          feedback.push({
            type: "footer-nav",
            line,
            message: `Footer elements should include a <nav> or <menu> for quick navigation.`,
            severity: "warning",
          });
        }
      }

      // 4. submenus without caret icon
      if (tag === "li") {
        const hasNested = children.some(
          (c) =>
            c?.type === "JSXElement" && c?.openingElement?.name?.type === "JSXIdentifier" &&
            ["ul", "menu"].includes(c.openingElement?.name?.name)
        );

        const hasIcon = children.some(
          (c) =>
            c?.type === "JSXElement" && c?.openingElement?.name?.type === "JSXIdentifier" &&
            /arrow|caret|expand|icon/i.test(c.openingElement?.name?.name || "")
        );

        if (hasNested && !hasIcon) {
          feedback.push({
            type: "missing-caret",
            line,
            message: `<li> contains submenu but no icon to signify dropdown.`,
            severity: "warning",
          });
        }
      }
    },
  });

  return feedback;
}

module.exports = { detectRecognitionCues };
