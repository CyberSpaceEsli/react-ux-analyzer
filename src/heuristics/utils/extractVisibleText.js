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
      const text = getTextFromJSX(path.node).trim();
      const line = path.node.loc?.start?.line;
      if (text.length >= 3) {
        collected.push({ text, line });
      }
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
