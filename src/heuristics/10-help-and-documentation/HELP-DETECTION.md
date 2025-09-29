# 🆘 Help Detector (help-recognize-detector.js)

Detects missing help features like onboarding guides, accessible tooltips, and icon-only buttons without labels.

Based on **Nielsen’s Heuristic #10: Help and Documentation**.

## What the Detector Does
This detector scans JSX files to find:
- Onboarding modals with no start or continue button
- Navigation menus missing help/support/docs links
- Input fields and buttons missing tooltips or accessible labels
- Icon-only buttons without any aria-label, title, or Tooltip wrapper

## How the Detector Works

### Main Function: `detectHelpFeatures(content)`
```javascript

function detectHelpFeatures(content) {
  const feedback = [];

    //helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

 return feedback;
}
```
It uses Babel to parse JSX and detects key UI elements that should provide help or guidance for users.

### Key Detection Methods
| Feature | Description |
|-----------|-------------|
| Onboarding modals missing action | Checks for dialogs mentioning onboarding but lacking “Start”, “Next”, etc. |
| Nav/Menu missing help links | Flags `<nav>` or `<menu>` with no “Help”, “Support”, or “Docs” links |
| Missing help on input fields/buttons | Flags critical fields missing `aria-label`, `title`, or `data-tooltip` |
| Icon-only buttons without accessibility | Flags buttons that only contain an icon but no `label` or `tooltip` |

### Detection Logic
1. Onboarding Modals Missing Action
- `<Modals>` and `<Dialogs>` using text that suggest onboarding should need buttons "Start", "Next", ect.
2. Navigation Missing Help Link
- `<nav>` elements should offer a link to a "Help", "FAQ", "Documentation", etc.page
3. Missing Tooltip or Accessible Label
- Form input elements need one of the following attributes: `aria-label`, `title`, or `data-tooltip`
4. Icon-Only Button Missing Label
- When icons are used as buttons they need a tooltip or hover element with some description

## Feedback Example
```
{
  Line 61, 
  <modal> contains onboarding content but lacks an action button
  Action: Add a button or link with text like "Start", "Begin", or "Show Me".
  Why: Users need guidance to proceed with onboarding.
  Heuristic: Nielsen #10: Help and Documentation (RUX1001)
  More info: https://www.nngroup.com/articles/help-and-documentation/
}
```

## Why Detector Matters

## Nielsen Heuristic Compliance

**Heuristic #10: Help and Documentation**
> "Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation." [nngroup/help-and-documentation](https://www.nngroup.com/articles/help-and-documentation/)

This detector help with:
- Encouraging visible and accessible support options
- Detecting missing tooltips or help attributes
- Flagging unlabelled icon-only controls

## Technical Details
- Uses AST traversal via @babel/parser and @babel/traverse
- Has formulated Regex texts to match onboarding and button texts 