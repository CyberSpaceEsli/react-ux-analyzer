# Heuristics Detection Algorithms

This directory contains detection algorithms for Nielsen's 10 Usability Heuristics, organized by heuristic category.

## Structure

```
heuristics/
├── index.js                              # Main module export
├── feedback-handler.js                   # Centralized feedback system
├── 1-visibility-system-status/             # Heuristic #1: Visibility of System Status
│   ├── breadcrumb-detector.js            # Detects breadcrumb navigation patterns
│   ├── BREADCRUMB-DETECTION.md           # Breadcrumb detector documentation
│   ├── loading-detector.js               # Detects loading states and feedback
│   └── LOADING-DETECTION.md              # Loading detector documentation
├── match-system-real-world/              # Heuristic #2: Match between system and real world
├── user-control-freedom/                 # Heuristic #3: User control and freedom
├── consistency-standards/                # Heuristic #4: Consistency and standards
├── error-prevention/                     # Heuristic #5: Error prevention
├── recognition-recall/                   # Heuristic #6: Recognition rather than recall
├── flexibility-efficiency/               # Heuristic #7: Flexibility and efficiency of use
├── aesthetic-minimalist/                 # Heuristic #8: Aesthetic and minimalist design
├── error-recovery/                       # Heuristic #9: Help users recognize, diagnose, and recover from errors
└── help-documentation/                   # Heuristic #10: Help and documentation
```

## Available Detectors

### 🔍 Visibility of System Status (Heuristic #1)

**Breadcrumb Detector** (`breadcrumb-detector.js`)
- Finds breadcrumb navigation components
- Detects missing navigation context
- [Documentation](./1-visibility-system-status/BREADCRUMB-DETECTION.md)

**Loading Detector** (`loading-detector.js`)  
- Identifies loading states and indicators
- Warns about missing loading feedback
- [Documentation](./1-visibility-system-status/LOADING-DETECTION.md)

## Nielsen's 10 Usability Heuristics

### ✅ Implemented:
1. **Visibility of System Status** - `1-visibility-system-status/`
   - Breadcrumb Detection: Identifies navigation patterns that help users understand their location

### 🔄 Planned:
2. **Match between system and real world** - `match_system_real_world/`
3. **User control and freedom** - `user_control_freedom/`
4. **Consistency and standards** - `consistency_standards/`
5. **Error prevention** - `error_prevention/`
6. **Recognition rather than recall** - `recognition_recall/`
7. **Flexibility and efficiency of use** - `flexibility_efficiency/`
8. **Aesthetic and minimalist design** - `aesthetic_minimalist/`
9. **Help users recognize, diagnose, and recover from errors** - `error_recovery/`
10. **Help and documentation** - `help_documentation/`

## Usage

```javascript
const { BreadcrumbDetector } = require('./heuristics');

const detector = new BreadcrumbDetector();
const patterns = detector.detectBreadcrumbs(jsxContent);
const report = detector.generateReport(patterns);
```

## Adding New Detectors

1. Create a new directory for the heuristic category
2. Add detector classes with consistent API:
   - `detect<Pattern>()` method
   - `generateReport()` method
   - Standard pattern object format
3. Export from `index.js`
4. Update documentation
