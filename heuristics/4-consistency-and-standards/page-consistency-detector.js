const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectPageConsistency - Checks page consistency and standards
 * Nielsen Heuristic #4: Consistency & Standards
 */
function detectPageConsistency(content, fileType = "jsx") {
  const feedback = [];

  const pageRegions = [
    { element: "header", allowedRoles: ["banner"], found: false },
    { element: "main", allowedRoles: ["main"], found: false },
    { element: "nav", allowedRoles: ["navigation"], found: false },
    { element: "footer", allowedRoles: ["contentinfo"], found: false },
  ];

  let logoWrappedInLink = false;
  const fontsUsed = new Map();

  // --- CSS Font Checks ---
    if (fileType === "css" || fileType === "scss") {
    // 1 Check all @font-face blocks
    const fontFaceBlocks = [...content.matchAll(/@font-face\s*{([\s\S]*?)}/gi)];
    if (fontFaceBlocks.length > 2) {
        fontFaceBlocks.forEach(block => {
        const lineNumber = content.slice(0, block.index).split("\n").length;
        feedback.push({
            type: "too-many-fonts",
            line: lineNumber,
            message: "More than 2 @font-face declarations in CSS. Maintain font consistency.",
            severity: "warning",
        });
        });
    }

    // 2 Check each @font-face block for number of font-family declarations
    fontFaceBlocks.forEach(block => {
        const fontFamilyMatches = [...block[1].matchAll(/font-family\s*:\s*['"]?([^;'"]+)['"]?/gi)];
        if (fontFamilyMatches.length > 2) {
        fontFamilyMatches.forEach(match => {
            const lineNumber = content.slice(0, block.index + match.index).split("\n").length;
            feedback.push({
            type: "too-many-fonts",
            line: lineNumber,
            message: `More than 2 font-family declarations in a single @font-face block. Found '${match[1]}'.`,
            severity: "warning",
            });
        });
        }
    });

    // 3 Check @import url(...) fonts
    const importMatches = [...content.matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/gi)];
    if (importMatches.length > 2) {
        importMatches.forEach(match => {
        const lineNumber = content.slice(0, match.index).split("\n").length;
        feedback.push({
            type: "too-many-fonts",
            line: lineNumber,
            message: "More than 2 fonts imported via @import url(...). Maintain font consistency.",
            severity: "warning",
        });
        });
    }

    return feedback;
    }

  const ast = parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const nameNode = node.openingElement.name;
      let elementName = null;
        if (nameNode) {
        if (nameNode.type === "JSXIdentifier") elementName = nameNode.name;
        else if (nameNode.type === "JSXMemberExpression") elementName = "[member expression]"; 
        }

      // --- Page regions & roles ---
      pageRegions.forEach(region => {
        if (elementName === region.element) {
          region.found = true;
          const roleAttr = node.openingElement.attributes.find(
            a => a.type === "JSXAttribute" && a.name.name === "role"
          );
          if (!roleAttr) {
            feedback.push({
              type: "missing-role",
              line: node.loc.start.line,
              message: `<${region.element}> is missing a WAI-ARIA role. Recommended: ${region.allowedRoles.join(", ")}`,
              severity: "warning",
              action: "Add role='" + region.allowedRoles[0] + "' to <" + region.element + ">.",
              why: "Accessibility requires a role to be defined for screen readers."
            });
          } else {
            const roleValue =
              roleAttr.type === "JSXAttribute" && roleAttr.value?.type === "StringLiteral" ? roleAttr.value.value : "";
            if (!region.allowedRoles.includes(roleValue)) {
              feedback.push({
                type: "invalid-role",
                line: node.loc.start.line,
                message: `<${region.element}> has an invalid role "${roleValue}". Recommended: ${region.allowedRoles.join(", ")}`,
                severity: "warning",
              });
            }
          }
        }
      });

      // --- Logo check ---
     for (const child of node.children || []) {
     if (child.type === "JSXElement") {
       const childName =
        child.openingElement.name && child.openingElement.name.type === "JSXIdentifier"
            ? child.openingElement.name.name
            : null;
        if (["Logo", "img", "svg"].includes(childName)) {
            if (
            path.node.type === "JSXElement" &&
            path.node.openingElement.name?.type === "JSXIdentifier" &&
            path.node.openingElement.name.name === "a"
        ) {
            logoWrappedInLink = true;
        }
        if (!logoWrappedInLink) {
            feedback.push({
            type: "missing-logo-link",
            line: child.loc.start.line,
            message: "Logo misses link to homepage.",
            severity: "warning",
            action: "Wrap the logo in <a href='/'> to link back to homepage.",
            why: "Users expect clicking the logo to return to the homepage."
            });
        }
        }
     }
    }

    // --- TailwindCSS font-[] detection ---
    const classAttr = node.openingElement.attributes.find(
        attr =>
        attr.type === "JSXAttribute" &&
        attr.name &&
        (attr.name.name === "className" || attr.name.name === "class")
    );

    if (classAttr && classAttr.type === "JSXAttribute" && classAttr.value && classAttr.value.type === "StringLiteral") {
    const classNames = classAttr.value.value.split(/\s+/);

    classNames.forEach(cn => {
        // Detect Tailwind font-[...] pattern
        const match = cn.match(/font-\[([^\]]+)\]/);
        if (match) {
         const fontName = match[1];
          if (!fontsUsed.has(fontName)) {
            fontsUsed.set(fontName, node.loc.start.line);
          }
        }
        if (fontsUsed.size > 2) { // only trigger feedback if more than 2 fonts
            feedback.push({
            type: "too-many-fonts",
            line: node.loc.start.line,
            message: `Too many included fonts.`,
            severity: "warning",
            action: "Use maximum 2 fonts in the project for consistency.",
            why: "Maintaining font consistency improves readability and UI consistency."
            });
        }
    });
    }
    }
  });
  return feedback;
}

module.exports = { detectPageConsistency };