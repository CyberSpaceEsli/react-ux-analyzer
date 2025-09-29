# ⚡ Shortcut Detector (shortcut-detector.js)

Detects missing or incomplete implementations of keyboard shortcut handling and visible shortcut hints in navigation elements, supporting **Nielsen Heuristic #7: Flexibility and Efficiency of Use**.

## What the Detector Does
The Shortcut Detector analyzes React JSX and JavaScript logic for:
- Missing keyboard event listeners in useEffect blocks
- Missing cleanup of event listeners (removeEventListener)
- Menus and navigation links that reference commands (e.g. “Save”, “Open”) but lack visible shortcut hints like “Ctrl+S”

## How the Detector Works

### Main Function: `detectShortcuts(content)`
```javascript

function detectShortcuts(content) {
  const feedback = [];

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

 return feedback;
}
```
Parses JSX with Babel and performs both AST-based and regex-based analysis to find missing keyboard interaction logic and surface shortcut hint issues.

### Key Detection Methods
| Method | Description |
|--------|-------------|
| Keyboard Handling in useEffect | Looks for `document.addEventListener('keydown')` and matching `removeEventListener` inside `useEffect` |
| Missing Cleanup Function | Detects when a shortcut listener is added but not removed in component unmount |
| Shortcut Hint in UI | Checks for visible text hints like `Ctrl+S` in menus or navs next to common actions ("Save", "Open", etc.) |

### Detection Logic
1. UseEffect Keyboard Listener
- Detects if useEffect contains text suggesting keyboard logic [e.g `/key(?:Down)?|keydown|onkeydown|shortcut/i`]
- Then checks if it cleans up eventListener, like `document.removeEventListener('keydown', handler)`
2. Menu/Navigation Shortcut Hints
- Detects <menu>, <nav>, or <Link> blocks with action words [like "Save", "Open", "New", "Copy", "Paste", "Search", "Close"]
- these words are needed in addition to any visible shortcut string like `Ctrl+S` or `⌘+P`

## Feedback Example
```
{
  Line 51, 
  This `useEffect` looks like it handles keyboard input, but no `keydown` event listener was found.
  Action: Add `document.addEventListener('keydown', handler)` inside the effect.
  Why: Keyboard shortcuts need a keydown listener to function.
  Heuristic: Nielsen #7: Flexibility and Efficiency of Use (RUX701)
  More info: https://www.nngroup.com/articles/ui-copy/#toc-guidelines-for-command-shortcuts-3
}
```

## Why Detector Matters
For more experienced users keyboard shortcuts are efficient way to perfrom tasks faster.

- Improves Power-User Efficiency: Keyboard shortcuts enable advanced users to perform actions faster
- Increases Discoverability: Visual shortcut hints help beginners learn faster
- Ensures Cleanup: Prevents memory leaks or buggy behavior by enforcing removeEventListener
- Supports Cognitive Load: Shortcut UI hints reinforce memory through recognition

## Nielsen Heuristic Compliance

**Heuristic #7: Flexibility and Efficiency of Use**
> "Shortcuts — hidden from novice users — may speed up the interaction for the expert user so that the design can cater to both inexperienced and experienced users." [nngroup/flexibility-efficiency](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector ensures:
- Kkeyboard shortcuts are present in logic
- Hints (keyboard combinations) are visible in the interface for discoverability
- Cleanup logic is included for robust interaction management

## Technical Details
- Parses code using @babel/parser and @babel/traverse
- Analyzes useEffect() blocks and extracts event logic
- Applies regex to identify inline UI menu hints