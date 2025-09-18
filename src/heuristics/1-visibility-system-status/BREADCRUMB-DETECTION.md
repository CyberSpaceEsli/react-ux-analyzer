# Breadcrumb Detector (`breadcrumb-detector.js`)

This detector analyzes React/JSX code to find breadcrumb navigation patterns, ensuring users always know where they are in the application hierarchy (Nielsen Heuristic #1: Visibility of System Status).

## What the Detector Does

The `BreadcrumbDetector` class scans through JSX code line by line and identifies:
- ✅ **Good practices**: Proper breadcrumb components and navigation
- ❌ **Missing breadcrumbs**: Page-level components without navigation context

## How It Works

### Main Function: `detectBreadcrumbs(content)`
```javascript
const detector = new BreadcrumbDetector();
const patterns = detector.detectBreadcrumbs(jsxContent);
```

The detector uses these methods:

1. **`checkForBreadcrumbComponents()`** - Finds breadcrumb components
2. **`checkForNavigationElements()`** - Detects navigation with breadcrumb attributes  
3. **`checkForMissingBreadcrumbs()`** - Identifies pages missing breadcrumb navigation

## Detection Patterns

### ✅ Good Breadcrumb Patterns Detected

**1. Breadcrumb Components:**
```jsx
<Breadcrumb />
<BreadCrumb />
<Breadcrumbs />
<Trail />
<PathTrail />
<Navigation />
<NavTrail />
```

**2. Navigation with Breadcrumb Classes:**
```jsx
<nav className="breadcrumb-nav">
<nav className="breadcrumb-container">
```

**3. List-based Breadcrumbs:**
```jsx
<ol className="breadcrumb">
<ul className="breadcrumb-trail">
<div className="breadcrumb-path">
```

**4. Accessibility-focused Breadcrumbs:**
```jsx
<nav aria-label="breadcrumb navigation">
<div aria-label="page breadcrumb">
```

### ❌ Missing Breadcrumb Warnings

The detector warns about page-level components without breadcrumb navigation:

```jsx
// These trigger warnings:
<Page className="settings-page">     // Missing breadcrumb context
<Section className="user-profile">   // No navigation guidance  
<Container className="dashboard">    // Users might get lost
```

**Warning triggers:**
- Components named: `Page`, `Section`, `Container`, `Layout`, `View`, `Screen`
- With class names containing: `page`, `section`, `container`, `layout`, `view`, `screen`

## Example Usage

```javascript
const BreadcrumbDetector = require('./breadcrumb-detector');
const detector = new BreadcrumbDetector();

const jsxCode = `
function ProductPage() {
  return (
    <Page className="product-details">
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem active>Details</BreadcrumbItem>
      </Breadcrumb>
      <ProductInfo />
    </Page>
  );
}
`;

const results = detector.detectBreadcrumbs(jsxCode);
console.log(results);
// Output:
// [
//   {
//     type: 'good-breadcrumb',
//     line: 4,
//     content: '<Breadcrumb>',
//     message: 'Found breadcrumb component - Excellent for navigation!',
//     severity: 'info'
//   }
// ]
```

## Why Breadcrumbs Matter

1. **Navigation Context**: Users know where they are in the site hierarchy
2. **Quick Navigation**: Easy way to jump back to parent pages  
3. **Reduced Cognitive Load**: Clear path reduces mental mapping effort
4. **Mobile UX**: Especially important on small screens with limited navigation
5. **SEO Benefits**: Search engines understand site structure better

## Technical Implementation

### Line-by-Line Analysis
The detector scans through JSX code using a simple but effective approach:

```javascript
detectBreadcrumbs(content) {
  const foundPatterns = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const lineNumber = i + 1;
    
    // Check for different breadcrumb patterns
    this.checkForBreadcrumbComponents(currentLine, lineNumber, foundPatterns);
    this.checkForNavigationElements(currentLine, lineNumber, foundPatterns);
    this.checkForMissingBreadcrumbs(currentLine, lineNumber, foundPatterns, lines, i);
  }
  
  return foundPatterns;
}
```

### Key Detection Methods

#### **`checkForBreadcrumbComponents(line, lineNumber, patterns)`**
Looks for breadcrumb component names using comprehensive pattern matching:
- Component names: `Breadcrumb`, `BreadCrumb`, `Breadcrumbs`, `Trail`, `PathTrail`, etc.
- React components: `<Breadcrumb>`, `<BreadCrumb>`, `<Navigation>`
- Imports and definitions: `import { Breadcrumb }`, `const Breadcrumb =`

#### **`checkForNavigationElements(line, lineNumber, patterns)`**
Detects navigation elements with breadcrumb semantics:
- Accessibility attributes: `aria-label="breadcrumb"`, `role="navigation"`
- CSS classes: `breadcrumb-nav`, `breadcrumb-container`, `breadcrumb-path`
- Structural patterns: `<nav className="breadcrumb">`, `<ol className="breadcrumb">`

#### **`checkForMissingBreadcrumbs(line, lineNumber, patterns, allLines, currentIndex)`**
Identifies page-level components that lack breadcrumb navigation:
- Page components: `<Page>`, `<Section>`, `<Container>`, `<Layout>`, `<View>`, `<Screen>`
- Class-based patterns: `className="page"`, `className="section"`, `className="layout"`
- Contextual analysis: Checks surrounding lines for existing breadcrumb patterns

## Detection Patterns

### ✅ **Breadcrumb Patterns Detected**

**1. Semantic Navigation Elements**
```jsx
<nav aria-label="breadcrumb navigation">
<div aria-label="page breadcrumb">
<nav role="navigation" className="breadcrumb">
```

**2. Structured List Breadcrumbs**
```jsx
<ol className="breadcrumb">
  <li><a href="/">Home</a></li>
  <li><a href="/products">Products</a></li>
  <li>Current Product</li>
</ol>
```

**3. Separator-based Patterns**
```jsx
<div>
  <a href="/">Home</a> &gt; 
  <a href="/products">Products</a> &gt; 
  <span>Current</span>
</div>
```

**4. React Router Breadcrumbs**
```jsx
<BreadCrumbs 
  routes={[
    { path: '/', name: 'Home' },
    { path: '/admin', name: 'Admin' }
  ]} 
/>
```

### ⚠️ **Missing Breadcrumb Warnings**

The detector warns about page-level components without breadcrumb navigation:

```jsx
// WARNING: No breadcrumbs found nearby
<Page className="user-settings">
  <h1>User Settings</h1>
  {/* User doesn't know where they are in the system */}
</Page>
```

## Test Files

In the `test-breadcrumbs/` folder you'll find example files:

- `good-breadcrumbs.jsx` - Examples of proper breadcrumb patterns
- `bad-breadcrumbs.jsx` - Examples of missing breadcrumbs
- `mixed-breadcrumbs.jsx` - Mixed patterns for testing

## UX Principles Analyzed

**Nielsen Heuristic #1: Visibility of System Status**
- Breadcrumbs show users where they are in the system
- Enable easy navigation back to parent pages
- Improve orientation in complex applications
- Reduce cognitive load when navigating

## Detection Logic

The detector uses the following strategies:

1. **Component Name Recognition**: Searches for components with "Breadcrumb", "BreadCrumb", etc.
2. **Semantic Attributes**: Recognizes `aria-label="breadcrumb"` and `role="navigation"`
3. **CSS Classes**: Finds breadcrumb-specific CSS classes
4. **Structural Patterns**: Analyzes navigation lists and structures
5. **Separator Recognition**: Identifies typical breadcrumb separators (&gt;, /, →, etc.)
6. **Context Analysis**: Checks Page/Layout components for missing navigation

## Extending the Logic

The `BreadcrumbDetector` class can be extended to:
- Recognize additional breadcrumb patterns
- Add framework-specific components
- Implement customizable warning rules
- Integrate with other UX heuristics

## Nielsen Heuristic Compliance

**Heuristic #1: Visibility of System Status**
> "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time."

Breadcrumbs provide continuous feedback about:
- Current location in the application
- Available navigation paths
- Site hierarchy and structure
- User's position in the workflow

## Next Steps

1. Implement additional Nielsen heuristics
2. Add configurable rules for different design systems
3. Integrate with VS Code Diagnostics API
4. Create automatic fixes for common breadcrumb patterns
