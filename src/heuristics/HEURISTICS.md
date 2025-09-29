# 📊 Heuristics Detection Algorithms

This directory contains detection logic for Nielsen’s 10 Usability Heuristics, implemented as individual modules per heuristic category. Each detector identifies a specific UX anti-pattern or improvement opportunity in your React UI codebase.

## Folder Structure

```
heuristics/
├── 1-visibility-system-status/                # Heuristic #1: Visibility of System Status
│   ├── breadcrumb-detector.js                 # Detector for breadcrumb navigation patterns
│   ├── BREADCRUMB-DETECTION.md                # Breadcrumb detector documentation
│   ├── loading-detector.js                    # Detector for loading states
│   └── LOADING-DETECTION.md                   # Loading detector documentation
├── 2-match-system-with-real-world/            # Heuristic #2: Match Between the System + Real World
│   ├── match-system-world-detector.js         # Detector for internal/technical language jargon
│   ├── language-analyzer.js                   # LLM logic to find business domain and jargon phrases
│   └── LANGUAGE-DETECTION.md                  # Match System with real world documentation
├── 3-user-control-freedom/                    # Heuristic #3: User control and freedom
│   ├── control-exit-detector.js               # Detector for exit control
│   └── CONTROL-EXIT-DETECTION.md              # Control exit documentation
├── 4-consistency-and-standards/               # Heuristic #4: Consistency and standards
│   ├── page-consistency-detector.js           # Detector for consistency and standards
│   └── PAGE-CONSISTENCY-DETECTION.md          # Page Consistency documentation
├── 5-error-prevention/                        # Heuristic #5: Error prevention
│   ├── error-prevention-detector.js           # Detector for error prevention
│   └── ERROR-PREVENTION-DETECTION.md          # Error Prevention documentation
├── 6-recognition-rather-recall/               # Heuristic #6: Recognition rather than recall
│   ├── recognition-detector.js                # Detector for recognition rather than recall
│   └── RECOGNITION-DETECTION.md               # Recognition rather recall documentation
├── 7-flexibility-and-efficiency-of-use/       # Heuristic #7: Flexibility and efficiency of use
│   ├── shortcut-detector.js                   # Detector for shortcuts
│   └── SHORTCUT-DETECTION.md                  # Flexibility and efficiency of use documentation
├── 8-aesthetic-minimalist-design/             # Heuristic #8: Aesthetic and minimalist design
│   ├── aesthetic-minimalistic-detector.js     # Detector for aesthetic and minimalist design
│   ├── draw-element-areas.js                  # Masks element areas red on screenshot
│   ├── utils/                                 # Folder with helper files for whitespace detection
│   └── AESTHETIC-MINIMALSIM-DETECTION.md      # Aesthetic and minimalist design documentation
├── 9-help-recognize-diagnose-recover-errors/  # Heuristic #9: Help users recognize errors
│   ├── help-recognize-errors-detector.js      # Detector for recognizing errors
│   └── HELP-RECOGNIZE-ERRORS-DETECTION.md     # Help users recognize errors documentation
├── 10-help-and-documentation/                 # Heuristic #10: Help and documentation
│   ├── help-detector.js                       # Detector for help and documentation
│   └── HELP-DETECTION.md                      # Help and documentation documentation
├── index.js                                   # Main module for heuristics and feedback export
├── feedback-handler.js                        # Centralized feedback system
├── FEEDBACK-HANDLER.md                        # Documentation of feedback system
└── README.md                                  # README for heuristics folder
```

## Available Detectors of the 10 Heuristics

### Visibility of System Status (Heuristic #1)

**Breadcrumb Detector** (`breadcrumb-detector.js`)
- Detects missing navigation context for breadcrumbs
- [Breadcrumb Documentation](./1-visibility-system-status/BREADCRUMB-DETECTION.md)

**Loading Detector** (`loading-detector.js`)  
- Detects missing loading feedback at loading elements
- [Loading Documentation](./1-visibility-system-status/LOADING-DETECTION.md)

### Match Between the System and the Real World (Heuristic #2)

**Match System World Detector** (`match-system-world-detector.js`)  
- Detects jargon language with help of LLM and utility functionalities
- [Language Documentation](./2-match-system-with-real-world/LANGUAGE-DETECTION.md)

### User Control and Freedom (Heuristic #3)

**Control Exit Detector** (`control-exit-detector.js`)  
- Detects missing exit mechanisms in modals and dialogs, missing Back buttons in multi-step flows, and missing Undo options for destructive actions.
- [Control Exit Documentation](./3-user-control-freedom/CONTROL-EXIT-DETECTION.md)

### Consistency and Standards (Heuristic #4)

**Page Consistency Detector** (`page-consistency-detector.js`)  
- Detects inconsistencies in page structure and too many font styles
- [Page Consistency Documentation](./4-consistency-and-standards/PAGE-CONSISTENCY-DETECTION.md)

### Error Prevention (Heuristic #5)

**Error Prevention Detector** (`error-prevention-detector.js`)  
- Detects meaningful user feedback and error prevention for fetch/axios calls
- [Error Prevention Documentation](./5-error-prevention/ERROR-PREVENTION-DETECTION.md)

### Recognition Rather than Recall (Heuristic #6)

**Recognition Detector** (`recognition-detector.js`)  
- Detects nav overload and missing placeholders for form input types
- [Recognition Documentation](./6-recognition-rather-recall/RECOGNITION-DETECTION.md)

### Flexibility and Efficiency of Use (Heuristic #7)

**Shortcut Detector** (`recognition-detector.js`)  
- Detects presence of keyboard shortcut handling in fetch and useEffect
- [Shortcut Documentation](./7-flexibility-and-efficiency/SHORTCUT-DETECTION.md)

### Aesthetic and Minimalist Design (Heuristic #8)

**Aesthetic Minimalistic Detector** (`aesthetic-minimalistic-detector.js`)  
- Detects color overload, confusing clickable styles, and low whitespace ratio
- [Aestehtic & Minimalistic Documentation](./8-aesthetic-minimalist-design/AESTHETIC-MINIMALSIM-DETECTION.md)

### Help Users Recognize, Diagnose, and Recover from Errors (Heuristic #9)

**Help Recognize Errors Detector** (`help-recognize-errors-detector.js`)  
- Detects technical jargon in user-facing errors and lack of visual error cues
- [Recognize Errors Documentation](./9-help-recognize-diagnose-recover-errors/HELP-RECOGNIZE-ERRORS-DETECTION.md)

### Help and Documentation (Heuristic #10)

**Help Detector** (`help-detector.js`)  
- Detects missing Help features like onboarding modals, help links, and icon only buttons
- [Help Documentation](./10-help-and-documentation/HELP-DETECTION.md)

## 📘 Feedback Mechanism
React-UX-Analyzer uses a centralized feedback system for unified messages
- [Feedback Documentation](./FEEDBACK-HANDLER.md)

## 📝 Add Custom UX Rules
Create your own UX rules with React-UX-Analyzer
- [Custom UX Rule Documentation](./utils/CUSTOM-RULES.md)

## 📎 Main Reference: Nielsen’s 10 Usability Heuristics
Learn more at [nngroup.com](https://www.nngroup.com/articles/ten-usability-heuristics/)