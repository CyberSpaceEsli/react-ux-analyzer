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

## Nielsen Heuristic Compliance

**Heuristic #1: Visibility of System Status**
> "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time."

Breadcrumbs provide continuous feedback about:
- Current location in the application
- Available navigation paths
- Site hierarchy and structure
     <li><a href="/products">Products</a></li>
     <li>Current Product</li>
   </ul>
   ```

4. **Separatoren-Pattern**
   ```jsx
   <div>
     <a href="/">Home</a> &gt; 
     <a href="/products">Products</a> &gt; 
     <span>Current</span>
   </div>
   ```

5. **React-Router Breadcrumbs**
   ```jsx
   <BreadCrumbs 
     routes={[
       { path: '/', name: 'Home' },
       { path: '/admin', name: 'Admin' }
     ]} 
   />
   ```

### ⚠️ Warnungen (fehlende Breadcrumbs)

Die Extension warnt vor Page-Komponenten ohne Breadcrumb-Navigation:

```jsx
// WARNUNG: Keine Breadcrumbs in der Nähe gefunden
<Page className="user-settings">
  <h1>User Settings</h1>
  {/* Benutzer weiß nicht, wo er sich im System befindet */}
</Page>
```

## Test-Dateien

Im `test-jsx/` Ordner finden Sie Beispieldateien:

- `good-breadcrumbs.jsx` - Beispiele für gute Breadcrumb-Patterns
- `bad-breadcrumbs.jsx` - Beispiele für fehlende Breadcrumbs
- `mixed-breadcrumbs.jsx` - Gemischte Patterns zum Testen

## Analysierte UX-Prinzipien

**Nielsen Heuristik #1: Visibility of System Status**
- Breadcrumbs zeigen dem Benutzer, wo er sich im System befindet
- Ermöglichen einfache Navigation zurück zu übergeordneten Ebenen
- Verbessern die Orientierung in komplexen Anwendungen
- Reduzieren kognitive Belastung beim Navigieren

## Erkennungslogik

Die Extension verwendet folgende Strategien:

1. **Komponentennamen-Erkennung**: Sucht nach Komponenten mit "Breadcrumb", "BreadCrumb", etc.
2. **Semantische Attribute**: Erkennt `aria-label="breadcrumb"` und `role="navigation"`
3. **CSS-Klassen**: Findet breadcrumb-spezifische CSS-Klassen
4. **Strukturelle Patterns**: Analysiert Navigations-Listen und -strukturen
5. **Separator-Erkennung**: Identifiziert typische Breadcrumb-Separatoren (&gt;, /, →, etc.)
6. **Kontext-Analyse**: Prüft Page/Layout-Komponenten auf fehlende Navigation

## Erweiterung der Logik

Die `BreadcrumbDetector`-Klasse kann erweitert werden um:
- Weitere Breadcrumb-Patterns zu erkennen
- Framework-spezifische Komponenten hinzuzufügen
- Anpassbare Warnungsregeln zu implementieren
- Integration mit anderen UX-Heuristiken

## Nächste Schritte

1. Weitere Nielsen-Heuristiken implementieren
2. Konfigurierbare Regeln für verschiedene Design-Systeme
3. Integration mit VS Code Diagnostics API
4. Automatische Fixes für häufige Breadcrumb-Patterns
