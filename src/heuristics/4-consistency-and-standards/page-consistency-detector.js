const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * detectPageConsistency - Detects inconsistencies in page structure and too many font styles
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

  const fontsUsed = new Map();

  // Helper: checks CSS font
  if (fileType === "css" || fileType === "scss") {
    // Check all @font-face blocks
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

  // Helper: check each @font-face block for number of font-family declarations
  fontFaceBlocks.forEach(block => {
        const fontFamilyMatches = [...block[1].matchAll(/font-family\s*:\s*['"]?([^;'"]+)['"]?/gi)];
        if (fontFamilyMatches.length > 2) {
        fontFamilyMatches.forEach(match => {
            const lineNumber = content.slice(0, block.index + match.index).split("\n").length;
            feedback.push({
            type: "too-many-fonts",
            line: lineNumber,
            message: `More than 2 font-family declarations found in project.`,
            severity: "warning",
            why: "Maintaining font consistency improves readability and UI consistency.",
            action: `Found '${match[1]}' fonts, use maximum 2 fonts in the project for consistency.`,
            });
        });
        }
  });

  // Helper: check @import url(...) fonts
  const importMatches = [...content.matchAll(/@import\s+url\(["']?([^"')]+)["']?\)/gi)];
    if (importMatches.length > 2) {
        importMatches.forEach(match => {
        const lineNumber = content.slice(0, match.index).split("\n").length;
        feedback.push({
            type: "too-many-fonts",
            line: lineNumber,
            message: "More than 2 fonts imported via @import url(...). Maintain font consistency.",
            severity: "warning",
            why: "Maintaining font consistency improves readability and UI consistency.",
            action: `Found '${match[1]}' fonts, use maximum 2 fonts in the project for consistency.`,
        });
        });
  }

    return feedback;
    }

  // Helper: check parents for a or link tag
   function isWrappedInLink(path) {
      let currentPath = path;

      while (currentPath) {
        const node = currentPath.node;

        if (node.type === "JSXElement") {
          const openingName = node.openingElement.name;
          if (openingName?.type === "JSXIdentifier") {
            const tagName = openingName.name.toLowerCase();
            if (tagName === "a" || tagName === "link") {
              return true;
            }
          }
        }

        currentPath = currentPath.parentPath;
      }

      return false;
    }

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
      let elementName = null;
        if (nameNode) {
        if (nameNode.type === "JSXIdentifier") elementName = nameNode.name;
        else if (nameNode.type === "JSXMemberExpression") elementName = "[member expression]"; 
        }

      // Page regions have no aria roles
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
              action: `Add role='${region.allowedRoles[0]}' to <${region.element}>.`,
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
                why: `Accessibility requires a role to be defined for screen readers.`,
                action: `Change role='${roleValue}' to role='${region.allowedRoles[0]}' on <${region.element}>.`,
              });
            }
          }
        }
      });

      // Logo not wrapped in link 
     for (const child of node.children || []) {
     if (child.type === "JSXElement") {
       const childName =
        child.openingElement.name && child.openingElement.name.type === "JSXIdentifier"
            ? child.openingElement.name.name
            : null;

        const isLikelyLogo = childName && childName.toLowerCase().includes("logo");

        if (isLikelyLogo) {
          // use helper to check if wrapped in <a> or <Link> parent or direct
          const wrappedInLink = isWrappedInLink(path);

        if (!wrappedInLink) {
            feedback.push({
            type: "missing-logo-link",
            line: child.loc.start.line,
            message: "Logo misses link to homepage.",
            severity: "warning",
            action: "Wrap the logo component in <a href='/'> or <Link to='/'> to link back to homepage.",
            why: "Users expect clicking the logo to return to the homepage."
            });
        }
        }
     }
    }

    // TailwindCSS font-[] detection
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
        if (fontsUsed.size > 2) { // only trigger feedback if more than 2 fonts used
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