## 📝 Creating Custom UX Rules in React-UX-Analyzer

React‑UX‑Analyzer lets you add your own UX heuristics by loading custom rule files from a dedicated folder.  

## 1. Edit VS Code Settings
Create a `.vscode/settings.json` file in your project root with the following content:
```json
{
  "react-ux-analyzer.customRulePath": "public/custom-ux-rules",
  "react-ux-analyzer.targetUrl": "http://localhost:5173" // Your localhost url
}
```


## 2. Custom Rules Folder Structure
Create the folder structure as follows:
<pre lang="text"><code>
my-project/
├── public/
│   └── custom-ux-rules/
│       └── my-rule.cjs
</code></pre>

* Place your custom rule files inside `public/custom-ux-rules`


## 3. File Format for Custom Rules
React-UX-Analyzer loads rules written in **CommonJS format**:
* If your project uses the default Node.js setup (no `"type": "module"` in `package.json`), use `.cjs` files.
* If your project is ESM (`"type": "module"` in `package.json`), use `.js` files so they work with `require(...)`.

✅ All rule files must export a detector function:
```js
module.exports = { detector(...) }
```


## 4. Example: Custom Rule Detector
Here’s a template for your custom rule file:
```js
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default; // babel packages loaded from extension

module.exports = {
  detector(content) {
    const feedback = [];

    // ... your detection logic here (use Babel traverse if needed) ...

    // Example: Detect missing alt attribute in <img> tags
    if (/* detection condition */) {
      feedback.push({
        line: path.node.loc?.start?.line || 1,
        message: `<img> tag missing alt attribute.`,
        severity: 'warning',
        analysisType: 'CUSTOM:missingAlt.js',
        action: 'Add a descriptive alt attribute to all <img> tags.',
        why: 'Alt text is critical for accessibility and screen readers.',
        docs: 'https://www.w3.org/WAI/tutorials/images/decision-tree/',
      });
    }

    // ... more detection logic ...

    return feedback;
  }
};
```

> **Note**: You can use [Babel Traverse](https://babeljs.io/docs/babel-traverse) in your rule logic, as **React‑UX‑Analyzer** has it preinstalled.


## 5. Optional Fields for Custom Rule Feedback
You can refine your feedback objects with these optional fields:
| Field | Type | Description |
|-------|------|-------------|
| `line` | `number` | Line number in the source file where the issue occurs (default: `1`). |
| `message` | `string` | Custom documentation on what the rule has detected. |
| `severity` | `string` | Must be `"warning"` (only supported severity in React‑UX‑Analyzer). |
| `analysisType` | `string` | Identifier for the rule (e.g. `CUSTOM:missingAlt.cjs`). |
| `why` | `string` | Explanation why it’s important and how it serves the user. |
| `action` | `string` | Indicator on how to solve the issue for the user. |
| `docs` | `string` | Documentation URL for the issue (defaults to general custom rule markdown). |


Example:
```js
{
  feedback.push({
    line: path.node.loc?.start?.line || 1,
    message: `<img> tag missing alt attribute.`,
    severity: 'warning',
    analysisType: 'CUSTOM:missingAlt.cjs',
    action: 'Add a descriptive alt attribute to all <img> tags.',
    why: 'Alt text is critical for accessibility and screen readers.',
    docs: 'https://www.w3.org/WAI/tutorials/images/decision-tree/',
   });
}
```


## 6. Summary
* Configure your custom rule path in `.vscode/settings.json`
* Place your rule files in `public/custom-ux-rules`
* Use CommonJS format (file ending `.cjs`) and export a `detector` function

With this setup, React‑UX‑Analyzer will automatically load and apply your custom UX rules!