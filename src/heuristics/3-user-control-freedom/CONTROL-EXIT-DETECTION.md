# 🔄 Control Exit Detector (control-exit-detector.js)

Detects missing escape, back, or undo mechanisms in dialogs, multi-step flows, and destructive actions. This supports **Nielsen Heuristic #3: User Control and Freedom**, ensuring users can always undo or escape an unwanted action or state.

## What the Detector Does
The Control Exit Detector analyzes React/JSX code to identify user interface patterns that limit user freedom, such as:
- Modals and dialogs that can’t be closed
- Multi-step flows without a Back button
- Destructive buttons (e.g. Delete) without Undo or Cancel

It ensures the user always has a way to exit, revert, or backtrack in the interface.

## How the Detector Works

### Main Function: `detectControlExits(content)`
```javascript

function detectControlExits(content) {
  const feedback = [];

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

 return feedback;
}
```

### Key Detection Methods
| Method | Description |
|--------|-------------|
| Modal/Dialog/Drawer checks | Looks for Modal, Dialog, Drawer, or Popover without `onClose` prop |
| Close button detection | Searches for buttons labeled “close”, “cancel”, “x”, or “exit” |
| Multi-step flows/forms | Detects if a “Next”/“Finish” button is present without a corresponding “Back”/“Previous" |
| Destructive actions | Detects “Delete”/“Remove” buttons without “Undo” or “Cancel” options |

### Detection Logic
1. Modal Close Behavior
- Finds `<Modal>`, `<Dialog>`, or `<SimpleDialog>` components that do not have an `onClose` prop.
- Warns if no Close, Cancel, or X, Exit button is present inside the modal
2. Multi-Step Form Flow
- Warns if a "Next" or "Finish" button is present without a "Back" or "Previous" button
3. Undo for Destructive Actions
- Flags when "Delete" or "Remove" buttons are present but no "Undo", "Restore", or "Cancel" is available

## Feedback Example
```
{
  Line 39, 
  Modal is missing a close option for users.
  Action: Add `onClose` prop to allow users to exit the modal/dialog.
  Why: Users need to close modals or dialogs to regain control of the interface.
  Heuristic: Nielsen #3: User Control and Freedom (RUX301)
  More info: https://www.nngroup.com/articles/user-control-and-freedom/
}
```

## Why Detector Matters
Exits should be clearly labeled and discoverable.

- User Freedom: Ensures users always have a way out or can undo actions
-  Error Prevention: Helps avoid irreversible mistakes
- UX Consistency: Encourages consistent modal and form behavior
- Accessibility: Crucial for keyboard and assistive tech users


## Nielsen Heuristic Compliance

**Heuristic #3: User Control and Freedom**
> "Users often perform actions by mistake. They need a clearly marked "emergency exit" to leave the unwanted action without having to go through an extended process." [nngroup/exit](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector supports that by:
- Encouraging undo actions
- Ensuring exit mechanisms for modals
- Supporting navigational freedom in flows and dialogs


## Technical Details

- AST-based checks (using @babel/parser and @babel/traverse):

- **Modal/Dialog exit detection:**
	- The AST is traversed to find JSX elements with the names `Modal`, `Dialog`, or `SimpleDialog`.
	- For each such element, it checks:
		- If the `onClose` prop is missing (direct prop check, not regex).
		- If there is a visible close button inside the modal/dialog. This is done by recursively searching the children for:
			- A `<CloseButton>` element
			- An `<Icon name="close" />` element
			- Any JSX text node containing the word "close" (case-insensitive, checked with regex `/close/i`).

- **Multi-step flow detection:**
	- The AST is traversed for JSX text nodes matching `/step\s*\d*/i` (regex), to detect step indicators like "Step 1".
	- All button elements are checked:
		- If the button text includes "next" or "finish" (case-insensitive, checked with `.includes()`), it is marked as a Next button and its line is saved.
		- If the button text includes "back" or "previous" (case-insensitive), it is marked as a Back button.
	- If a step is detected and there is at least one Next button but no Back button, a warning is reported for every Next button line.

- **Destructive action detection:**
	- All button elements are checked:
		- If the button text includes "delete" or "remove" (case-insensitive), it is marked as a destructive action.
		- If the button text includes "undo", "cancel", or "restore", it is marked as an undo action.
	- If a destructive action is found but no undo action, a warning is reported. The line number is determined by searching for the first occurrence of "delete" or "remove" in the code (using a simple string search, not AST).

### Regex usage
- Regex is used for:
	- Detecting step indicators in text nodes: `/step\s*\d*/i`
	- Detecting the word "close" in JSX text nodes: `/close/i`
	- Finding the first line number of keywords like "delete" or "remove" in the code (for reporting): uses `String.prototype.includes()` in a helper, not a full regex.

- Searches both props and textual button labels
