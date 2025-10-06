# 🎨 Aesthetic-Minimalism Detector (aesthetic-minimalistic-detector.js)

Detects overloaded visuals and layout issues that violate **Nielsen Heuristic #8: Aesthetic and Minimalist Design**. It ensures your UI avoids visual noise, maintains clarity, and ensures enough whitespace.

## What the Detector Does
This detector analyzes JSX, inline styles, Tailwind classes, and the rendered DOM (via Puppeteer) to detect:
- Overuse of primary colors (>3)
- Confusing style reuse across clickable/non-clickable elements
- Low whitespace density in the UI layout

## How the Detector Works

### Set Local Dev URL
- Run command `🌐 Set Local Dev URL` and insert your localhost url (e.g., `http://localhost:3000`)
- If you configured the URL already, skip this step

### Main Function: `detectAestheticMinimalism(content, overrideUrl)`
```javascript

function detectAestheticMinimalism(content, overrideUrl) {
  const feedback = [];

    //helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

  // puppeteer headless browser operation
  // DOM-based analyis for whitespace detetcion

 return feedback;
}
```
Parses JSX with Babel and performs AST-based analysis for tailwind, inline color detection, and style reuse across interactive vs non-interactive elements, but in addition includes real DOM-analysis via Puppeteer to measure whitespace.

### Key Detection Methods
| Method | Description |
|--------|-------------|
| Tailwind Class Parsing | Extracts `text-*, bg-*`, and `border-*` classes to track color use |
| Inline Style Extraction | Detects inline `style={{ color: ... }}` and tracks primary colors |
| Style Fingerprinting | Identifies shared styles between clickable and non-clickable elements |
| Puppeteer Layout Capture | Takes a full-page screenshot and marks bounding boxes to calculate whitespace usage |
| Whitespace Ratio Detection | Flags when whitespace ratio is below a percentage of screen layout |

### Detection Logic
1. Color Overload Detection
- Detects more than 3 distinct primary colors used via Tailwind classes or inline styles
2. Confusing Visual Style for Clickability
- Checks if the exact same class/style is used for both clickable and non-clickable elements
3. Whitespace Ratio Detection
- Loads the app in headless Chrome
- Captures DOM bounding boxes of all major elements (`text`, `buttons`, `images`, etc.)
- Marks element areas red and is visualized in debug-screenshot.png (see function in `./draw-element-areas.js`)
- Calculates the ratio of unused space (whitespace) in layout against sapce used by elements
- Flags when layout is visually overcrowded

## Feedback Example
```
{
  Line 31, 
  Visual style p-8|hover:underline|text-color-blue| used for both clickable and non-clickable elements.
  Action: Highlight clickable elements using distinct visual styles from non-clickable ones.
  Why: Make clickable elements clearly recognizable to avoid user confusion or unexpected behavior.
  Heuristic: Nielsen #8: Aesthetic and Minimalist Design (RUX801)
  More info: https://www.nngroup.com/articles/minimalist-design/
}
```

## Why Detector Matters
A Crowded Layouts reduces readability and scannability for users.

- Too Many Colors distract users and destroy visual hierarchy
- Clickability Confusion breaks interaction consistency and hurts usability
- Whitespace is critical to balance, simplicity, and clarity

## Nielsen Heuristic Compliance

**Heuristic #8: Aesthetic and Minimalist Design**
> "Visual design goes beyond making layouts and designs look nice and aesthetically pleasing. When thoughtfully applied, it can increase usability, provoke emotion, and strengthen brand perception." [nngroup/visual-design](https://www.nngroup.com/articles/visual-design-in-ux-study-guide/)

This detector enforces:
- Visual restraint by limiting color chaos (less than 3 primary colors)
- Clean interaction zones with clearer visual affordances
- Whitespace discipline to support focus and legibility

## Technical Details:
- AST Parsing with @babel/parser and @babel/traverse
- Headless rendering  for DOM operations via puppeteer for layout analysis
- Generates screenshots and mask.json data for debug overlays
- Whitespace calculation using bounding box aggregation

## Visual Debugging
You can find debug screenshots and bounding box overlays in:
```
heuristics/8-aesthetic-minimalist-design/utils/
  ├── screenshot.png         // Full-page layout
  ├── mask.json              // Bounding boxes of all detected elements
  └── debug-whitespace.png   // Screenshot with rectangles drawn on content areas
```