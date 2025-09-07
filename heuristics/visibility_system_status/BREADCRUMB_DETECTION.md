# React UX Analyzer - Breadcrumb Detection

Diese VS Code Extension implementiert Nielsen's Heuristik #1 "Visibility of System Status" durch automatische Erkennung von Breadcrumb-Patterns in React/JSX Code.

## Installation und Verwendung

### 1. Extension laden
```bash
# Im VS Code: F5 drücken um die Extension im Development Host zu starten
```

### 2. Breadcrumb-Analyse ausführen
1. Öffnen Sie eine JSX/TSX-Datei in VS Code
2. Öffnen Sie die Command Palette (`Cmd+Shift+P` auf macOS)
3. Suchen Sie nach "Analyze Breadcrumbs (Nielsen #1: Visibility & System Status)"
4. Führen Sie den Befehl aus

### 3. Ergebnisse anzeigen
- Die Analyseergebnisse werden im "React UX Analyzer" Output-Channel angezeigt
- Breadcrumb-Patterns werden mit Zeilennummern und Details aufgelistet
- Fehlende Breadcrumbs werden als Warnungen markiert

## Erkannte Breadcrumb-Patterns

### ✅ Positive Patterns (werden erkannt)

1. **Breadcrumb-Komponenten**
   ```jsx
   <Breadcrumb>
     <BreadcrumbItem href="/">Home</BreadcrumbItem>
     <BreadcrumbItem href="/products">Products</BreadcrumbItem>
     <BreadcrumbItem active>Current</BreadcrumbItem>
   </Breadcrumb>
   ```

2. **Navigation mit Breadcrumb-Semantik**
   ```jsx
   <nav aria-label="breadcrumb">
     <ol className="breadcrumb">
       <li><a href="/">Home</a></li>
       <li><a href="/category">Category</a></li>
       <li className="active">Current</li>
     </ol>
   </nav>
   ```

3. **Listen-basierte Breadcrumbs**
   ```jsx
   <ul className="breadcrumb-list">
     <li><a href="/">Dashboard</a></li>
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
