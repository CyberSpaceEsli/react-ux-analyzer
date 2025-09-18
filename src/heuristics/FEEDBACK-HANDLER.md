# FeedbackHandler Documentation

Der `FeedbackHandler` ist eine zentrale Komponente für die einheitliche Ausgabe und Benachrichtigung von UX-Analyseergebnissen in der React UX Analyzer Extension.

## Zweck

Der FeedbackHandler eliminiert Code-Duplikation und stellt sicher, dass alle Detektoren (BreadcrumbDetector, LoadingDetector, etc.) eine konsistente Ausgabe verwenden.

## Hauptmerkmale

### ✅ Einheitliche Ausgabe
- Konsistente Formatierung für alle Analysetypen
- Standardisierte Icons und Schweregrade
- Einheitliche VS Code Output Channel Integration

### ⚠️ Schweregrad-Behandlung
- `warning` (❌): Kritische Probleme
- `suggestion` (💡): Verbesserungsvorschläge  
- `error` (🚨): Schwere Fehler
- `info` (ℹ️): Informationen

### 🔧 Erweiterbarkeit
Einfach neue Analysetypen hinzufügbar durch Erweiterung der Icon- und Label-Maps.

## Verwendung in VS Code Extension

```javascript
const feedbackHandler = new FeedbackHandler();

// Für Breadcrumb-Analyse
feedbackHandler.showResults({
    analysisType: 'BREADCRUMB',
    fileName: fileName,
    issues: missingBreadcrumbs,
    issueLabel: 'MISSING BREADCRUMBS'
});

// Für Loading-Analyse  
feedbackHandler.showResults({
    analysisType: 'LOADING',
    fileName: fileName,
    issues: loadingIssues,
    issueLabel: 'LOADING ISSUES'
});
```

## Unterstützte Analysetypen

| Typ | Icon | Beschreibung |
|-----|------|--------------|
| BREADCRUMB | ❌ | Navigation/Breadcrumb-Analyse |
| LOADING | ⚠️ | Loading-State-Analyse |
| NAVIGATION | 🧭 | Allgemeine Navigation |
| FEEDBACK | 💬 | User-Feedback-Analyse |
| ERROR | 🚨 | Fehlerbehandlung |

## Hilfsfunktionen

### `FeedbackHandler.filterIssues(patterns, severities)`
Filtert Patterns nach Schweregrad für konsistente Ausgabe.

```javascript
const issues = FeedbackHandler.filterIssues(patterns, ['warning', 'suggestion']);
```

## Integration mit neuen Detektoren

1. Detektor entwickeln und Pattern mit `severity` zurückgeben
2. Analysetyp in FeedbackHandler-Maps hinzufügen (optional)
3. In Extension mit `feedbackHandler.showResults()` verwenden
4. Fertig! Einheitliche Ausgabe garantiert.

## Testing

Für Tests außerhalb von VS Code steht `test-feedback-helper.js` zur Verfügung, der die gleiche Formatierung ohne VS Code API bietet.
