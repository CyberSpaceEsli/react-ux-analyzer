
# CONTROL-EXIT-DETECTION.md

## Purpose
The `ControlExitDetector` class analyzes React components for usability issues related to user control and freedom (Nielsen Heuristic #3). It helps find common problems where users might lose control in dialogs, multi-step flows, or destructive actions.

## What does it detect?

### 1. Modals/Dialogs without exit options
- **Missing `onClose` handler:** Finds `<Modal>`, `<Dialog>`, or `<SimpleDialog>` components that do not have an `onClose` prop. Without this, users may not be able to close the dialog.
- **No visible close button:** Checks if the modal/dialog contains a visible close button (like `<CloseButton>`, an icon named "close", or the text "close"). If not, a warning is reported.

### 2. Multi-step flows without a way back
- If a multi-step flow is detected (for example, text like "Step 1" and a "Next" button), but there is no "Back" button, a warning is reported for every "Next" button in the flow. This helps ensure users can always go back in a process.

### 3. Destructive actions without Undo
- Finds buttons with text like "Delete" or "Remove" but no "Undo", "Cancel", or "Restore" button. This warns if users cannot undo destructive actions.


## How does it work? (Main functions and detection logic)

### AST-based checks (using @babel/parser and @babel/traverse):

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

### No global regex search for navigation
- There is **no** global regex search for "Back", "Previous", etc. Only explicit button elements are checked for these texts.

## Main functions (simple explanation)

- **detectControlExits(content):**
	- Parses the JSX code to an AST and runs all checks described above.
	- Returns a list of all detected issues, each with a line number and message.

- **containsCloseButton(node):**
	- Recursively checks if a modal/dialog contains a close button (see above for details).

- **_findLineNumber(content, keyword):**
	- Finds the first line number where a keyword (like "delete") appears, for reporting destructive actions.

## Goal
This class helps you find and fix specific usability problems in React apps, so users always have control and can undo mistakes. The detection is precise: it checks JSX structure and button texts, not just raw text or comments.

## Goal
This class helps you find and fix common usability problems in React apps, so users always have control and can undo mistakes.
