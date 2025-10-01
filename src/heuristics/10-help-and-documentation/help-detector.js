const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/*
    * detectHelpFeatures - Detects missing Help features like onboarding modals, help links, and icon only buttons
    * Based on Nielsen Heuristic #10: Help and Documentation
*/
function detectHelpFeatures(content) {
  const feedback = [];

  const onboardingTextRegex = /\b(welcome|tour|guide|get started|walkthrough|intro|help)\b/i;
  const onboardingButtonRegex = /\b(start|begin|show me|give tour|next|continue)\b/i;
  const helpLinkRegex = /\b(help|documentation|support|docs|faq|guide|get started|q&a)\b/i;
  const modalLikeTags = ["modal", "dialog", "popover", "tooltip"];
  const criticalInputTypes = [
        "email", "password", "file", "number",
        "date", "time", "url", "tel",
      ];
  const iconButtons = ['IconButton', 'button'];
  const iconTags = /icon|svg/i;
  const tooltipTags = ["Tooltip", "Hint", "Help", "Info"];

      // Helper: collect all text from jsx elements recursively
      function collectJSXText(node) {
      let text = '';
      if (node.type === 'JSXText') text += node.value;
      if (node.type === 'JSXElement' && node.children) {
        for (const child of node.children) text += collectJSXText(child);
      }
      return text;
    }

    // Helper: check nav/menu and children recursively for help/support links
    function findHelpLink(node, helpLinkRegex) {
      if (!node) return false;

      // Only check JSXElements
      if (node.type === "JSXElement") {
        const openingName = node.openingElement?.name;
        const tag =
          openingName?.type === "JSXIdentifier"
            ? openingName.name.toLowerCase()
            : null;

        if (["a", "link"].includes(tag)) {
          // check children for text matching helpLinkRegex
          if (
            node.children?.some(
              (c) => c?.type === "JSXText" && helpLinkRegex.test(c.value)
            )
          ) {
            return true;
          }
        }
        // recursively check all children
        return node.children?.some((child) => findHelpLink(child, helpLinkRegex));
      }
      return false;
    }

    // Helper: check if an action button exists in onboarding modals
    function hasActionButton(node) {
      if (node.type === "JSXElement") {
        const childName = node.openingElement?.name;
        if (childName?.type === "JSXIdentifier") {
          const childTag = childName.name.toLowerCase();
          if (["button", "a"].includes(childTag)) {
            const buttonText = node.children
              ?.filter((c) => c?.type === "JSXText")
              .map((t) => t.value.toLowerCase())
              .join(" ");
            // compare against onboarding texts
            if (onboardingButtonRegex.test(buttonText)) return true;
          }
        }
        // recursively check children
        if (node.children) {
          for (const child of node.children) {
            if (hasActionButton(child)) return true;
          }
        }
      }
      return false;
    }

    // Helper: check if child is icon element
    function isIconElement(child) {
    if (child.type !== "JSXElement") return false;
    const name = child.openingElement.name;
    if (name.type === "JSXIdentifier" && iconTags.test(name.name)) return true;

    // check for className containing "icon"
    const attrs = child.openingElement.attributes || [];
    for (const attr of attrs) {
      if (attr.type === "JSXAttribute" && attr.name.name === "className" && attr.value?.type === "StringLiteral") {
        if (iconTags.test(attr.value.value)) return true;
      }
    }
    return false;
  }

  // Helper: check if a button is icon-only
  function isIconOnlyButton(node) {
    if (node.type !== "JSXElement") return false;
    const name = node.openingElement.name;
    if (name.type !== "JSXIdentifier") return false;
    const tag = name.name;

    if (!iconButtons.includes(tag)) return false;

    const children = node.children || [];
    const hasText = children.some(child => child.type === "JSXText" && child.value.trim());
    if (hasText) return false;

    // uses regex/className matching for icon children
    const hasIconChild = children.some(isIconElement);

    return hasIconChild && !hasText;
  }

  // Helper: check if a node has accessible label attributes
  function hasTitleAccessibleLabel(node) {
    // check for aria-label or title attribute
    const attrs = node.openingElement.attributes || [];
    for (const attr of attrs) {
      if (attr.type !== "JSXAttribute" || !attr.name) continue;
      const attrName = attr.name.name;
      if (["aria-label", "title"].includes(attrName)) { 
        if (attr.value && ((attr.value.type === "StringLiteral" && attr.value.value.trim()) ||
            (attr.value.type === "JSXExpressionContainer"))) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper: check if a icon button is wrapped in a tooltip component
  function isWrappedInTooltip(path) {
    let parent = path.parentPath;
    while (parent) {
      if (parent.node.type === "JSXElement") {
        const parentName = parent.node.openingElement.name;
        if (parentName.type === "JSXIdentifier" && tooltipTags.includes(parentName.name)) {
          return true;
        }
      }
      parent = parent.parentPath;
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
      const opening = path.node.openingElement;
      const openingElement = node.openingElement;
      if (!openingElement || openingElement.type !== "JSXOpeningElement") return;

      // Get tag name e.g. 'div', 'Modal', 'button'
      const nameNode = openingElement.name;
      const tag = nameNode?.type === "JSXIdentifier" ? nameNode.name.toLowerCase() : null;
      if (!tag) return;
     
      const line = node.loc?.start?.line ?? null;

      // Modal or Dialog components have onboarding content but no start button
      const isModalComponent = modalLikeTags.includes(tag);

      if (isModalComponent) {
      const innerText = collectJSXText(node);
      if (onboardingTextRegex.test(innerText)) {
        const hasAction = hasActionButton(node);
        if (!hasAction) {
          feedback.push({
            type: "missing-onboarding-action",
            line,
            message: `<${tag}> contains onboarding content but lacks an action button`,
            severity: "warning",
            why: "Users need guidance to proceed with onboarding.",
            action: `Add a button or link with text like "Start", "Begin", or "Show Me".`,
          });
        }
      }
    }

      // Nav and Menu components do not include help/support links
      if (["nav", "menu"].includes(tag)) {
        
        // check recursively for help/support links
        const hasHelpLink = findHelpLink(node, helpLinkRegex);

        // check for aria-label="breadcrumb" to avoid false positives
        const hasBreadcrumbAriaLabel = (node.openingElement.attributes || []).some(attr =>
          attr.type === "JSXAttribute" &&
          attr.name?.name === "aria-label" &&
          attr.value?.type === "StringLiteral" &&
          attr.value.value.trim().toLowerCase() === "breadcrumb"
        );

        // If no help/support link is found in nav/menu, warn
        if (!hasHelpLink && !hasBreadcrumbAriaLabel) {
          feedback.push({
            type: "missing-help-link-in-menu",
            line,
            message: `Navigation block does not contain a link to Help, Support, or Documentation.`,
            severity: "warning",
            why: "Users need help resources from navigation.",
            action: `Add a link with text like "Help", "Support", or "Docs" in the <${tag}>.`,
          });
        }
      }

      // Action elements are missing help attributes (title, aria-label, data-tooltip)
      const attrs = Array.isArray(opening.attributes)
        ? opening.attributes
        : [];

      if (["input", "textarea", "select", "button"].includes(tag)) {
        // extract type="..." attribute if present
        const typeAttr = attrs.find(
          (attr) =>
            attr?.type === "JSXAttribute" &&
            attr.name?.name === "type" &&
            attr.value?.type === "StringLiteral"
        );
        const inputType = typeAttr?.type === "JSXAttribute" && typeAttr?.value?.type === "StringLiteral" ? typeAttr?.value?.value : null;

        const needsHelp =
          tag === "textarea" ||
          tag === "select" ||
          (tag === "input" && criticalInputTypes.includes(inputType)) ||
          (tag === "button" && /submit|upload|confirm|send/i.test(path.node.type === "JSXElement" && path.node?.children?.[0]?.type === "JSXText" && path.node.children?.[0]?.value || ""));

        if (!needsHelp) return;

        // check for help attributes
        const hasHelpAttr = attrs.some(
          (attr) =>
            attr?.type === "JSXAttribute" &&
            attr.name?.type === "JSXIdentifier" &&
            ["title", "aria-label", "data-tooltip"].includes(attr.name.name)
        );

        // If critical input/button is missing help attribute, warn
        if (!hasHelpAttr) {
          feedback.push({
            type: "missing-tooltip",
            line: path.node.loc?.start?.line ?? null,
            message: `<${tag}> field of type '${inputType ?? "text"}' is missing help attributes.`,
            severity: "warning",
            why: "Users may need guidance on how to fill out critical form fields.",
            action: `Add a 'title', 'aria-label', or 'data-tooltip' attribute to the <${tag}>.`,
          });
        }
      }

      // Icon-only buttons must have aria-label/title or be wrapped in Tooltip
      if (isIconOnlyButton(node)) {
      const line = node.loc?.start?.line || null;
      if (!hasTitleAccessibleLabel(node) && !isWrappedInTooltip(path)) {
        feedback.push({
          type: "missing-icon-button-label",
          line,
          message: `Icon-only button lacks accessible label or tooltip.`,
          severity: "warning",
          why: "Icon buttons need accessible labels for users and screen readers.",
          action: `Add 'aria-label' or 'title' attribute, or wrap the <${tag}> in a <Tooltip> component.`,
        });
      }
    }
    },
  });

  return feedback;
}

module.exports = { detectHelpFeatures };