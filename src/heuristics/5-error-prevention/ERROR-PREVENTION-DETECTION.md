🛑 Error Prevention Detector (error-prevention-detector.js)

Detects missing undo options, poor error handling, and lack of user-facing feedback in destructive actions and network requests. Supports **Nielsen Heuristic #5: Error Prevention** — preventing problems before they occur.

## What the Detector Does
This detector ensures that:
- Destructive actions like delete or reset include undo mechanisms
- Modals and dialogs with dangerous wording offer a cancel or go back option
- Custom form fields offer context through labels or hints
- fetch() or axios calls are wrapped with proper error handling
- Catch blocks don’t just console.log() — they should help users, not just developers

## How the Detector Works

### Main Function: `detectErrorPrevention(content)`
```javascript
function detectErrorPrevention(content) {
  const feedback = [];

   // helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
 });

 return feedback;
}
```

It parses the JSX or JS content using Babel, and traverses the AST to identify error-prone or dangerous patterns that require better UX safety nets.


###  Key Detection Methods
| Method | Description |
|--------|-------------|
| Destructive Buttons | Flags buttons like "Delete", "Clear", "Remove" if there’s no "Undo" nearby |
| Confirmation Dialogs | Detects modals with dangerous wording but missing cancel/dismiss/exit options |
| Custom Inputs | Fields like `<Select>` or `<Upload>` must include contextual hints (`aria-label`, `title`, etc.) |
| AJAX Calls | Warns if `fetch()` or axios are used without `.catch()` or `try/catch` |
| Error Handling | Warns if error handlers only log to console and don’t show user-facing messages |
| Missing Catch Block | Flags try blocks that do not include a catch clause |

### Detection Logic
1. Destructive Buttons without Undo
- If a button contains text like “Delete”, “Erase”, “Reset”, etc.
- And no sibling contains “Undo”, “Restore”, etc.
- → Warning
2. Dangerous Dialogs without Cancel
- If modal contains words like “permanently”, “irreversible”, etc.
- And no cancel or go-back option is rendered
- → Warning
3. Fields Missing Context
- Flags `<Select>`, `<Dropdown>`, etc., if they have no title, aria-label, or aria-describedby
4. Network Requests
- Finds `fetch()` and `axios.*()` calls
 - Checks for:
	- Presence of `.catch()` block or try/catch
	- Feedback logic beyond console.log (e.g. `setError()`,` <Error />`, etc.)
5. Try/Catch Analysis
- If `try {}` block has no catch → Warning
- If catch only logs errors → Warning
- If `.catch()` arrow function has only `console.log()` → Warning

## Feedback Example
```
{
  Line 18, 
  Error handler contains only console logs.
  Action: Consider displaying user feedback (e.g. setError, <Error />).
  Why: This provides no feedback to users when an error occurs.
  Heuristic: Nielsen #5: Error Prevention (RUX501)
  More info: https://www.nngroup.com/articles/error-prevention/
}
```

## Why Detector Matters

Preventing errors is likely a matter of reducing burdens on users and guiding them.

- Protects Users from destructive actions they can’t undo
- Reduces Anxiety when interacting with irreversible UI decisions
- Improves Accessibility by requiring field-level context
- Ensures Feedback is shown to users, not just developers

## Nielsen Heuristic Compliance

**Heuristic #5: Error Prevention**
> "Users are often distracted from the task at hand, so prevent unconscious errors by offering suggestions, utilizing constraints, and being flexible." [nngroup/error-prevention](https://www.nngroup.com/articles/slips/)

This detector helps:
- Prevent user errors through undo/cancel safety nets
- Enforce good error handling practices
- Catch risky areas before they lead to failure

## Technical Details
- Parses JSX/JS using Babel’s @babel/parser
- Pattern-matches dialog/button and error prone messafe text for destructive or confirmatory language with Regex