# 🧭 Breadcrumb Detector (`breadcrumb-detector.js`)

Detects missing breadcrumb navigation in key layout or page components to support **Nielsen Heuristic #1: Visibility of System Status**. It ensures users always know where they are in the application hierarchy.

## What the Detector Does

The Breadcrumb Detector analyzes React/JSX code to identify whether core structural components like `<Page>`, `<Main>`, or `<Layout>` include breadcrumb navigation.

Its goal is to ensure users are always aware of their location within the application’s hierarchy.

## How the Detector Works

### Main Function: `detectBreadcrumbs(content)`
```javascript
function detectBreadcrumbs(content) {
  const feedback = [];

  // helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
 });

 return feedback;
}
```

The detector performs a full **AST traversal** of the JSX using **Babel parser** and looks for:

### Key Detection Methods
| Features | Description |
|----------|-------------|
| JSXElement visitor | Traverses all JSX tags and looks for layout-level components (`<Page>`, `<Main>` etc.) |
| `hasBreadcrumb()` | Helper function checks whether a component (or its children) contains a known breadcrumb structure |
| Attribute inspection | Recognizes attributes like `aria-label="breadcrumb"` or `class="breadcrumb-list"`|
| Recursive scan | Inspects deeply nested children inside the JSX tree for breadcrumb-related elements |

### Detection Logic
The detector applies the following checks:

1. Breadcrumb Component Matching
Searches for `<Breadcrumb>`, `<Breadcrumbs>` or similar custom components inside the layout components.

2. AST traversal for JSX elements
Detects JSX elements to find `<Page>`, `<Layout>`, or `<Main>`, and check for children.

3.	Semantic & Accessibility Attributes
Inspects for:
- `aria-label="breadcrumb"`
-	`class="breadcrumb-list"`

4.	Recursive Search
Ensures breadcrumb elements are present even if nested deeply within the component’s children.

5.	Warning Only If Missing
Breadcrumbs are only flagged as an issue if none of the above are found in relevant page-level components.


## Feedback Example
Here’s how a detector warning looks when a `<Page>` component is missing a breadcrumb:
```
{
  Line 20, 
  Page component <Main> has no breadcrumb. Add one for proper system status visibility.
  Action: Add <Breadcrumb> component or <nav aria-label='breadcrumb'> near the top.
  Why: Users need to know their location in the app hierarchy.
  Heuristic: Nielsen #1: Visibility of System Status (RUX101)
  More info: https://www.nngroup.com/articles/breadcrumbs/
}
```

## Why Detector Matters
Breadcrumbs are vital for:
- User Orientation
Users immediately understand where they are in the app
- Navigation Efficiency
Quick access to parent or sibling pages
- Reduced Friction
Especially helpful in multi-level or nested views
- Accessibility & Cognitive Load
Crucial for users with memory, vision, or attention difficulties

## Nielsen Heuristic Compliance

**Heuristic #1: Visibility of System Status**
> "Breadcrumbs are an important navigational element that supports wayfinding — making users aware of their current location within the hierarchical structure of a website." [nngroup/breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/)

Breadcrumbs fulfill this principle by:
- Providing contextual awareness
- Visually anchoring users in the site hierarchy
- Enabling clear navigation paths

## Technical Details
- Uses Babel’s `@babel/parser` and `@babel/traverse` for JSX parsing
- Applies errorRecovery: true to handle malformed or incomplete files


