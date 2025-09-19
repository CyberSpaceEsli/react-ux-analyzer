/**
 * Recursively extracts all JSXText from a JSXElement node.
 * Also handles nested JSXElements and expressions that contain string literals.
 * @param {object} node - A Babel JSXElement node
 * @returns {string} The concatenated visible text
 */
export function getTextFromJSX(node) {
  if (!node || !node.children) return '';

  const textParts = node.children.map(child => {
    if (child.type === 'JSXText') {
      return child.value.trim();
    }

    // Nested JSX element: recurse
    if (child.type === 'JSXElement') {
      return getTextFromJSX(child);
    }

    // String in expression container: {"Save"} or {`Delete`}
    if (
      child.type === 'JSXExpressionContainer' &&
      (child.expression.type === 'StringLiteral' || child.expression.type === 'TemplateLiteral')
    ) {
      if (child.expression.type === 'StringLiteral') {
        return child.expression.value;
      } else if (child.expression.quasis) {
        return child.expression.quasis.map(q => q.value.cooked).join('');
      }
    }

    return '';
  });

  return textParts.join(' ').replace(/\s+/g, ' ').trim();
}