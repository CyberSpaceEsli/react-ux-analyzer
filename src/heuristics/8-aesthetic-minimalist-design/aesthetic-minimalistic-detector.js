// aesthetic-minimalistic-detector.js
require('dotenv').config();
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { drawElementAreas } = require('./draw-element-areas');

/**
 * Detects minimalist aesthetic violations in React JSX code.
 * Heuristic: Nielsen #8 - Aesthetic and Minimalist Design
 * - More than 3 primary colors used (tailwind or inline styles)
 * - Clickable vs non-clickable elements sharing the same visual style
 */
async function detectAestheticMinimalism(content, overrideUrl) {
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

  // DOM-based analysis for whitespace
  const url = overrideUrl || process.env.REACT_APP_URL || 'http://localhost:3000';

  const utilsDir = path.resolve(__dirname, 'utils');
  if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });

  const screenshotPathVar = 'src/heuristics/8-aesthetic-minimalist-design/utils/screenshot.png';
  //const screenshotPath = path.join(utilsDir, screenshotPathVar);
  const maskPath = path.join(utilsDir, 'mask.json');
  const debugImagePath = path.join(utilsDir, 'debug-whitespace.png');

  /*const screenshotPath = './screenshot.png';
  const maskPath = path.resolve('./masks.json');
  const debugImagePath = path.resolve('./debug-whitespace.png');*/

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  //eslint-disable-next-line
  const layoutHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewport({ width: 1280, height: layoutHeight });

  // 🧠 Analyze DOM layout and whitespace
  const { boxes, layoutWidth, layoutHeight: measuredHeight } = await page.evaluate(() => {
    const selectors = [
      'img', 'video', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'label', 'li', 'p', 'a', 'button', 'span'
    ];
    const elements = selectors.flatMap(selector =>
      //eslint-disable-next-line
      Array.from(document.querySelectorAll(selector))
    );

    const rects = elements.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.floor(rect.left),
        //eslint-disable-next-line
        y: Math.floor(rect.top + window.scrollY),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height)
      };
    });

    return {
      boxes: rects,
      //eslint-disable-next-line
      layoutWidth: document.documentElement.scrollWidth,
      //eslint-disable-next-line
      layoutHeight: document.documentElement.scrollHeight
    };
  });

  // 📸 Screenshot after viewport adjustment
  await page.screenshot({ path: screenshotPathVar });
  await browser.close();

  // 💾 Save for debug
  fs.writeFileSync(maskPath, JSON.stringify({ boxes, layoutHeight: measuredHeight }, null, 2));
  await drawElementAreas(screenshotPathVar, maskPath, debugImagePath);

  const layoutArea = layoutWidth * measuredHeight;
  const elementArea = boxes.reduce((sum, box) => {
    const area = box.width * box.height;
    return sum + (area > 5 ? area : 0);
  }, 0);

  const whitespaceRatio = 1 - (elementArea / layoutArea);
  console.log(`[🧪 DEBUG] whitespaceRatio = ${(whitespaceRatio * 100).toFixed(1)}%`);

  if (whitespaceRatio < 0.99) {
    feedback.push({
      type: 'low-whitespace',
      line: 0,
      message: `Low whitespace detected in layout: ${(whitespaceRatio * 100).toFixed(1)}%. Layout may feel crowded.`,
      severity: 'warning'
    });
  }

  return feedback;
}

module.exports = { detectAestheticMinimalism };