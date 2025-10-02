# ⏳ Loading Detector (`loading-detector.js`)

Detects missing loading indicators, animations, and submit-button feedback in asynchronous operations.

Supports **Nielsen Heuristic #1: Visibility of System Status** — making sure users are informed about the current state of the system during delays or network activity.

## What the Detector Does

The Loading Detector analyzes React/JSX files and checks whether user-triggered actions or async operations (e.g. fetch, axios, form submits) are accompanied by visual loading indicators.

Its primary goal is to ensure users are always aware that something is happening behind the scenes.

## How the Detector Works

### Main Function: `detectLoadingPatterns(content)`
```javascript
function detectLoadingPatterns(content) {
  const feedback = [];

  // helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
 });

 return feedback;
}
```
The detector uses Babel to parse and traverse the JSX AST to find patterns related to asynchronous activity and submission states.

### Key Detection Methods
| Features | Description |
|----------|-------------|
| CallExpression | Detects `fetch()` or axios calls without loading state set to true (e.g., setLoading(true)) |
| JSXElement | Inspects `<button type="submit">` elements for missing `disabled={isLoading}` or visual loading cues inside the button element |
| Spinner detection | Flags missing visual indicators like `<Spinner />`, `<CircularProgress />`, or Tailwind’s animate-spin in `<svg>`, `<span>` and `<div>`|
| Conditional feedback | Recognizes loading state usage with ternary operators `{loading ? ... : ...}`, logical expressions `{loading && <Spinner />}`, and loading text |

### Detection Logic
1. Missing Loading for Fetch/Axios
- Checks if network calls lack a loading state (e.g., `setLoading(true)`) during the async operation, warn this.
- Flags if loading conditions for UI loading rendering are missing (e.g,  `{loading ? ... : ...}`)
2. Buttons Without Disabled State
- Scans `<button type="submit">` elements or buttons with action-related text ("upload", "save", "submit", etc.)
- Flags if they lack `disabled={loading}` or or visible loading indicators (spinner, loading text).
3. Missing Spinner Animation
- Detects spinners (`<svg>`, `<div>`, etc.) that don’t include the animate-spin class
- Prompts to include the animation of tailwind CSS for extra clarity

## Feedback Example
```
{
  Line 73,
  Fetch/axios call detected without loading state.
  Action: Set your loading state to true while the request is in progress, e.g. `setLoading(true)`
  Why: Users need feedback that the system is loading
  Heuristic: Nielsen #1: Visibility of System Status (RUX101)
  More info: https://medium.com/design-bootcamp-using-loaders-understanding-their-purpose-types-and-best-practices-a62ca991d472
}
```

## Why the Detector Matters
- Transparency: Users shouldn’t be left wondering if something is broken or just slow.
- Perceived Performance: Even a slow app feels faster when users can see that something is happening.
- Action Feedback: Especially critical for forms and submissions, where users need confirmation that their action is being processed.

## Nieslen Heuristic Complience

**Heuristic #1: Visibility of System Status**
> "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time." [nngroup/breadcrumbs](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector ensures that:
- Network actions set and reflect loading states visually
- Buttons visually reflect loading state through disabling and loading indicators
- Spinners have proper animation and intuitive appearance


## Technical Notes
- Uses @babel/parser and @babel/traverse
- Supports both fetch and axios
- Checks for both visual spinners and disabled states inside buttons
- Handles both conditional JSX (loading ? ...) and logical expressions (loading && ...)