const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
/*
    * detectRecognitionCues - Detects nav overload and missing placeholders for form input types
    * Based on Nielsen Heuristic #6: Recognition Rather Than Recall
*/
function detectRecognitionCues(content) {
  const feedback = [];

  const criticalInputTypes = ["tel", "date", "email", "url", "password", "phone"];

  // Helper: to count menu items li, a, button recursively
  function countMenuItemsRecursively(children) {
  let count = 0;

  // iterate through children nodes
  for (const child of children) {
    if (!child || child.type !== "JSXElement") continue;

    // get the tag name of the child element
    const tag = child.openingElement?.name?.type === "JSXIdentifier"
      ? child.openingElement.name.name.toLowerCase()
      : "";

    // count a, li, button as menu items
    if (["a", "button", "link", "route"].includes(tag)) {
      count++;
    }

    // recurse into child elements
    if (Array.isArray(child.children)) {
      count += countMenuItemsRecursively(child.children);
    }
  }

  return count;
  }

  // Helper: check if nav or menu exists recursively in footer
  function hasNavOrMenuRecursively(children) {
    for (const c of children) {
      if (c?.type !== "JSXElement") continue;

      const childOpeningName = c.openingElement?.name;
      const childTag =
        childOpeningName?.type === "JSXIdentifier"
          ? childOpeningName.name
          : null;

      if (["nav", "menu"].includes(childTag)) return true;

      // recursive check children
      if (Array.isArray(c.children) && hasNavOrMenuRecursively(c.children)) {
        return true;
      }
    }
    return false;
  }

  // Helper: check if li has submenu and arrow/caret icon
  function containsIconComponent(node) {
    if (!node) return false;

    // Check if current node is a JSXElement and its name matches icon keywords
    if (
      node.type === "JSXElement" &&
      node.openingElement.name?.type === "JSXIdentifier" &&
      /arrow|caret|expand|icon/i.test(node.openingElement.name.name)
    ) {
      return true;
    }

    // Check children recursively
    if (node.children && node.children.length > 0) {
      return node.children.some(child => containsIconComponent(child));
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

      const tag = tagName;
      const tagLower = tagName.toLowerCase();
      const children = Array.isArray(node.children) ? node.children : [];
      const line = node.loc?.start?.line ?? null;

      // Critical input types need placeholders
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

      // More than 7 items in nav/menu is considered overloaded
      if (["nav", "menu", "routes"].includes(tag)) {
        // counts how many direct child elements inside are also <nav> or <menu>
        const itemCount = countMenuItemsRecursively(children);

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

      // is either <nav> or <menu> inside <footer>
      if (tagLower === "footer" && tag[0] === tag[0].toLowerCase()) {
        const hasNav = hasNavOrMenuRecursively(children);

        if (!hasNav) {
          feedback.push({
            type: "footer-nav",
            line,
            message: `Footer elements should include a <nav> or <menu> for quick navigation.`,
            severity: "warning",
            why: "Footers are expected to provide navigation options to users.",
            action: "Add a <nav> or <menu> element inside the footer."
          });
        }
      }

      // Submenus with missing caret or arrow icons
      if (tag === "li") {
        // check if <li> has nested <ul> or <menu>
        const hasNested = children.some(
          (c) =>
            c?.type === "JSXElement" && c?.openingElement?.name?.type === "JSXIdentifier" &&
            ["ul", "menu"].includes(c.openingElement?.name?.name)
        );

        // check li for icon recursively
        const hasIcon = containsIconComponent(node);

        if (hasNested && !hasIcon) {
          feedback.push({
            type: "missing-caret",
            line,
            message: `<li> contains submenu but no icon to signify dropdown is present.`,
            severity: "warning",
            why: "Users may not recognize that a submenu exists without visual cues.",
            action: "Add a <Arrow /> or <Caret /> icon to the <li> element."
          });
        }
      }
    },
  });

  return feedback;
}

module.exports = { detectRecognitionCues };
