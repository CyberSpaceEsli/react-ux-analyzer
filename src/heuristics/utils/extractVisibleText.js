/**
 * Extract visible text from JSX code.
 * This function parses the JSX code and collects text from JSX elements,
 * ignoring code, comments, and non-visible elements, like tags or function names.
 */
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { getTextFromJSX } = require('./getTextFromJSX');

function extractVisibleTextFromCode(code) {
  const collected = [];

  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
      errorRecovery: true,
    });
  } catch (err) {
    console.warn('Skipping invalid JSX file during domain detection', err.message);
    return [];
  }

  traverse(ast, {
    JSXElement(path) {
      const node = path.node;
      const line = node.loc?.start?.line;

      // Only process JSX elements with direct visible text children
      const directText = node.children
        .filter(child => child.type === 'JSXText' && child.value.trim().length >= 3)
        .map(child => {
          if (child.type === 'JSXText') return child.value.trim();
          if (child.type === 'JSXElement') return getTextFromJSX(child);
          return '';
        }).join(' ');

      if (directText.length === 0) return;

      const text = directText;
      collected.push({ text, line });
    },
  });

  /** Construct example 
   * [
   * { text: "Initiate RMA due to inventory mismatch", line: 5 },
   * { text: "Backordered from West Coast fulfillment center", line: 6 },
   * ...
   * ]
   */

  return collected;
}

module.exports = { extractVisibleTextFromCode };
