# 📐 Page Consistency Detector (page-consistency-detector.js)

Analyzes JSX to detect inconsistencies in layout structure, font overuse, and missing accessibility roles. This aligns with **Nielsen Heuristic #4: Consistency and Standards**, promoting a clean, uniform, and accessible user interface.

## What the Detector Does
The Page Consistency Detector ensures your React application’s layout follows common standards and accessibility guidelines. It detects:
- Missing or misused layout regions (`<main>`, `<header>`, `<footer>`, etc.)
- Missing or invalid WAI-ARIA roles
- Too many font styles or imports in CSS
- Logos not linking back to the homepage (brand consistency)

## How the Detector Works

### Main Function: `detectPageConsistency(content, fileType = "jsx")`
```javascript

function detectPageConsistency(content, fileType = "jsx") // or .css, .scss {
  const feedback = [];

   //helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

 return feedback;
}
```
- JSX: Analyzes structural layout and accessibility semantics
- CSS: Inspects for font-face declarations and imported font overload

### Key Detection Methods
| Method | Description |
|--------|-------------|
| Layout Element Analysis | Verifies presence of `<main>`, `<nav>`, `<header>`, `<footer>` |
| Role Validation | Ensures elements have correct role attributes |
| Font Overload | Flags >2 font declarations in `@font-face`, `@import`, or Tailwind’s `font-[...]` |
| Logo Link Check | Ensures logo is wrapped in `<a href="/">` |
| Tailwind Font Class Scanning | Detects use of `font-[custom]` across JSX classes |

### Detection Logic
1. Layout Region Role Check
- Verifies that key layout components like `<main>` or `<header>` include semantic roles like `role="main"`, `role="banner"`, etc.
- Flags missing or invalid roles for accessibility
2. Font Usage in CSS
- Analyzes `@font-face` blocks and `@import` statements in CSS/SCSS
- Warns if more than 2 different fonts are declared
3. Tailwind `font-[...]` Checks
- Scans JSX className or class props for custom fonts via Tailwind
- Triggers warning if more than 2 different fonts are used
4. Logo Linking
- Identifies Logo components not wrapped in an `<a>` or `<link>` tag
- Suggests wrapping in `<a href="/">` or `<Link to="/">` to reinforce brand navigation

## Feedback Example
```
{
  Line 22, 
  Logo misses link to homepage.
  Action: Wrap the logo in <a href='/'> or <Link to='/'> to link back to homepage.
  Why: Users expect clicking the logo to return to the homepage.
  Heuristic: Nielsen #4: Consistency and Standards (RUX401)
  More info: https://www.nngroup.com/articles/consistency-and-standards/
}
```

## Why Detector Matters
Designing conventions can add to your users’ cognitive load.

- Visual Consistency: Ensures uniform UI structure across pages
- Accessibility: Enforces WAI-ARIA role use for screen readers
- Typography Hygiene: Prevents design clutter by limiting fonts
- Expected Navigation: Keeps logo behavior consistent with user expectations

## Nielsen Heuristic Compliance

**Heuristic #4: Consistency and Standards**
> "When designing your application, focus on helping users reach their goals as efficiently as possible rather than on creating a nonconventional interface that people will need to figure out." [nngroup/consistency-and-standards](https://www.nngroup.com/articles/consistency-and-standards/)

This detector promotes:
- Layout uniformity via semantic elements
- Typography consistency across pages
- Navigation behavior aligned with user expectations
- Better accessibility compliance

## Technical Details
- Parses JSX using @babel/parser and @babel/traverse
- Parses CSS using regex-based pattern matching for font declarations
- Tracks font usage in JSX via Tailwind-style class scanning