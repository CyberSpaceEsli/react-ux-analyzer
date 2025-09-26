// aesthetic-minimalistic-detector.js
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Detects minimalist aesthetic violations in React JSX code.
 * Heuristic: Nielsen #8 - Aesthetic and Minimalist Design
 * - More than 3 primary colors used (tailwind or inline styles)
 * - Clickable vs non-clickable elements sharing the same visual style
 */
function detectAestheticMinimalism(content) {
  const feedback = [];

  const colorRegex = /(?:text|bg|border|fill|stroke)-(red|blue|green|yellow|purple|pink|orange|teal|cyan|indigo|amber|lime|emerald|fuchsia|violet|rose|sky|slate|gray|zinc|neutral|stone)-(\d{2,3})/gi;
  const tailwindColorSet = new Set();
  const inlineColorSet = new Set();

  const styleMap = new Map();
  let primaryColorLine = null;

  function extractVisualStyles(attributes) {
    const styles = { classes: [], inlineColors: [] };

    for (const attr of attributes) {
      if (attr.type !== "JSXAttribute") continue;

      if (attr.name.name === "className") {
        if (attr.value?.type === "StringLiteral") {
          styles.classes = attr.value.value.split(/\s+/);
        }
      }

      if (attr.name.name === "style") {
        const expr = attr.value?.expression;
        if (expr?.type === "ObjectExpression") {
          for (const prop of expr.properties) {
            if (
              prop.type === "ObjectProperty" &&
              ((prop.key.type === "Identifier" && prop.key.name === "color") ||
               (prop.key.type === "StringLiteral" && prop.key.value === "color")) &&
              prop.value.type === "StringLiteral"
            ) {
              styles.inlineColors.push(prop.value.value.toLowerCase());
            }
          }
        }
      }
    }
    return styles;
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
      const attributes = node.openingElement.attributes ?? [];
      const tagNode = node.openingElement?.name;
      if (!tagNode || tagNode.type !== "JSXIdentifier") return;
      const tagName = tagNode.name;

      const line = node.loc?.start?.line ?? null;

      let className = '';
      let styleKey = '';
      let isClickable = false;

      const styles = extractVisualStyles(attributes);

      styles.classes.forEach((cls) => {
        const match = cls.match(colorRegex);
        if (match) match.forEach((m) => {
          if (!primaryColorLine) primaryColorLine = line;
          tailwindColorSet.add(m);
        });
      });

      styles.inlineColors.forEach((color) => {
        if (!primaryColorLine) primaryColorLine = line;
        inlineColorSet.add(color);
      });

      for (const attr of attributes) {
        if (attr.type === 'JSXAttribute') {
          if (attr.name.name === 'className' && attr.value?.type === 'StringLiteral') {
            const classes = attr.value.value.split(/\s+/).filter(Boolean).sort();
            className = 'tw:' + classes.join('|');
          }

          if (attr.name.name === 'style' && attr.value?.type === 'JSXExpressionContainer') {
            const expr = attr.value.expression;
            if (expr.type === 'ObjectExpression') {
              const props = expr.properties.map(p => {
                if (p.type === 'ObjectProperty') {
                  // Type-safe extraction for key
                  let key = '';
                  if (p.key && p.key.type === 'Identifier' && typeof p.key.name === 'string') key = p.key.name;
                  else if (p.key && p.key.type === 'StringLiteral' && typeof p.key.value === 'string') key = p.key.value;

                  // Type-safe extraction for value
                  let value = '';
                  if (p.value && p.value.type === 'StringLiteral' && typeof p.value.value === 'string') value = p.value.value;

                  return `${key}:${value}`;
                }
                return '';
              }).filter(Boolean).sort();
              styleKey = 'style:' + props.join(';');
            }
          }

          if (attr.name.name === 'onClick' || attr.name.name === 'href') {
            isClickable = true;
          }
        }
      }

      const tag = tagName.toLowerCase();
      if (["a", "button"].includes(tag)) {
        isClickable = true;
      }

      const visualKey = className || styleKey;
      if (!visualKey) return;

      if (!styleMap.has(visualKey)) styleMap.set(visualKey, []);
      styleMap.get(visualKey).push({ isClickable, line });
    },
  });

  const totalColorsUsed = new Set([...tailwindColorSet, ...inlineColorSet]);
  if (totalColorsUsed.size > 3 && primaryColorLine) {
    feedback.push({
      type: "too-many-colors",
      line: primaryColorLine,
      message: `Detected ${totalColorsUsed.size} distinct primary color styles.`,
      severity: "warning",
      why: `Using too many primary colors can overwhelm users as colors do compete for attention.`,
      action: `Aim to limit primary colors to 2-3 in the design.`,
    });
  }

  for (const [visualKey, elements] of styleMap.entries()) {
    const hasClickable = elements.some(e => e.isClickable);
    const hasNonClickable = elements.some(e => !e.isClickable);

    if (hasClickable && hasNonClickable) {
      const line = elements.find(e => !e.isClickable)?.line ?? 1;
      feedback.push({
        type: 'confusing-style',
        line,
        message: `Visual style "${visualKey}" used for both clickable and non-clickable elements.`,
        severity: 'warning',
        why: 'Make clickable elements clearly recognizable to avoid user confusion or unexpected behavior.',
        action: 'Highlight clickable elements using distinct visual styles from non-clickable ones.',
      });
    }
  }

  return feedback;
}

module.exports = { detectAestheticMinimalism };