🧠 Recognition Cues Detector (recognition-detector.js)

Detects UI elements that rely too much on memory instead of visible hints — including missing placeholders for critical input types, overloaded navigation menus, and missing dropdown arrows — to support **Nielsen Heuristic #6: Recognition Rather Than Recall**.

## What the Detector Does
The Recognition Cues Detector analyzes JSX code and flags patterns that require users to recall information instead of supporting recognition, such as:

- Forms missing placeholders (e.g. phone, date)
- Navigation components with too many choices
- Footers missing navigation menus
- Submenus that do not visually (with arrow icon) indicate they can expand

## How the Detector Works

### Main Function: `detectRecognitionCues(content)`
```javascript
function detectRecognitionCues(content) {
  const feedback = [];

   // helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
 });

 return feedback;
}
```
Parses JSX using Babel, then traverses the AST to identify overloaded navs, missing cues in menus, and unhelpful input fields.

### Key Detection Methods
| Method | Description |
|--------|-------------|
| Missing Placeholders | Detects `<input type="email">`, `<input type="date">`, etc. that lack placeholder props |
| Overloaded Nav Menus | Finds `<nav>`, `<menu>`, or `<routes>` with more than 7 menu items (based on Miller’s Law) |
| Custom Inputs | Fields like `<Select>` or `<Upload>` must include contextual hints (`aria-label`, `title`, etc.) |
| Footer Navigation Missing | Flags `<footer>` without embedded `<nav>` or `<menu>` |
| Submenus Without Visual Cue | Detects `<li>` elements containing nested menus but no icon like `<ArrowIcon />` or `<Caret />` |

### Detection Logic
1. Critical Input Fields
- Input field types [e.g tel, date, number, email, url, password, phone] should have placeholder attributes
2. Overloaded Navigation Menus
- Counts menu items in `<nav>` and `<menu>` or `<routes>` and if exceed 7 items it pushes feedback
- Accoring to Miller’s Law users can hold ~7 items in working memory
3. Footer Missing Navigation
- Checks if `<footer>` contains `<nav>` or `<menu>`
4. Submenus Missing Icons
- Detects `<li>` tags with nested `<ul>` or `<menu>`
- Looks for sibling elements like `<CaretIcon>`, `<ArrowDown>`, etc.

## Feedback Example
```
{
  Line 7, 
  <nav> contains 11 items.
  Action: Reduce items in <nav> or group into submenus.
  Why: Users can only remember 7 items in short-term memory.
  Heuristic: Nielsen #6:  Recognition Rather Than Recall (RUX601)
  More info: https://www.nngroup.com/articles/recognition-vs-recall/
}
```

## Why Detector Matters

"Information required to use the design (e.g. field labels or menu items) should be visible or easily retrievable when needed." [source](https://www.nngroup.com/articles/ten-usability-heuristics/)

- Supports User Memory: Avoids forcing users to recall what to enter or where to click
- Reinforces Discoverability: Clearly communicates what’s clickable or expandable
- Enhances Accessibility: Users with cognitive or learning challenges benefit from visible cues
- Improves Scannability: Placeholder hints and icons help users navigate faster

## Nielsen Heuristic Compliance

**Heuristic #6: Recognition Rather Than Recall**
> "Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another." [nngroup/recognition-vs-recall](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector ensures:
- Field expectations are made clear with placeholders
- Navigational paths don’t overwhelm short-term memory
- Expandable options are recognizable without requiring exploration

## Technical Details
- Uses Babel’s @babel/parser with jsx plugin and error recovery
- Recursively traverses JSX elements
- Matches input types, navigation structures, and component patterns