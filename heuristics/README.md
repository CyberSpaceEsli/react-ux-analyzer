# Heuristics Detection Algorithms

This directory contains detection algorithms for Nielsen's 10 Usability Heuristics, organized by heuristic category.

## Structure

```
heuristics/
├── index.js                           # Main export file
├── visibility_system_status/          # Heuristic #1: Visibility of System Status
│   ├── breadcrumb-detector.js         # Breadcrumb pattern detection
│   └── BREADCRUMB_DETECTION.md        # Documentation
├── match_system_real_world/           # Heuristic #2: Match between system and real world
├── user_control_freedom/              # Heuristic #3: User control and freedom
├── consistency_standards/             # Heuristic #4: Consistency and standards
├── error_prevention/                  # Heuristic #5: Error prevention
├── recognition_recall/                # Heuristic #6: Recognition rather than recall
├── flexibility_efficiency/            # Heuristic #7: Flexibility and efficiency of use
├── aesthetic_minimalist/              # Heuristic #8: Aesthetic and minimalist design
├── error_recovery/                    # Heuristic #9: Help users recognize, diagnose, and recover from errors
└── help_documentation/                # Heuristic #10: Help and documentation
```

## Nielsen's 10 Usability Heuristics

### ✅ Implemented:
1. **Visibility of System Status** - `visibility_system_status/`
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
