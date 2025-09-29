# 🧩 Help-Recognize-Errors Detector (help-recognize-errors-detector.js)

Detects unclear error messages and poor visual styling that prevent users from recognizing, diagnosing, and recovering from errors.

Based on **Nielsen’s Heuristic #9: Help Users Recognize, Diagnose, and Recover from Errors**.

## What the Detector Does
This detector analyzes JSX code to detect:
- Technical jargon or error codes shown to users (e.g., “Error 404” or “Failed to fetch”)
- Missing visual indicators on error messages (e.g., no red color or bold styling)

It encourages clear language and distinct visual styling for all user-facing errors.

## How the Detector Works

### Main Function: `detectHelpErrorRecognition(content)`
```javascript

function detectHelpErrorRecognition(content) {
  const feedback = [];

    //helper functions

  traverse(ast, {
  // detector logic with AST traversal 
  //feedback.push
  });

 return feedback;
}
```
It parses the JSX using Babel, identifies error-like components or classes, and analyzes texts for technical jargon and style attributes for red or bold visual cues.

### Key Detection Methods
| Feature | Description |
|----------|-------------|
| Error Component/Class Detection | Looks for common error-related tag names or class names (e.g., error, alert, feedback, etc.) |
| Inline Style Inspection | Detects red color or bold fontWeight in inline style props |
| Technical Message Regex | Flags messages like `Error 500`, `request failed`, or `ERR_NETWORK` |
| Visual Style Validation | Checks whether error messages have red or bold style indicators |

### Detection Logic
1. Technical Error Messages
- Detects when error messages contain technical jargon, like Error 500: request failed
2. Missing Visual Cues on Error Messages
- Checks if the message is styled to visually indicate it’s an error (via red color or bold text)

## Feedback Example
```
{
  Line 24, 
  Error message detected but lacks visual cues like red color and bold font.
  Action: Add visual styles (e.g., red text, bold font) to make the error message stand out.
  Why: Errors should be visually distinct to help users quickly recognize them.
  Heuristic: Nielsen #9: Help Users Recognize, Diagnose, and Recover from Errors (RUX901)
  More info: https://www.nngroup.com/articles/help-users-recognize-diagnose-and-recover-from-errors/
}
```

## Why Detector Matters
Users can’t recover from problems they can’t understand or see.

- Improves clarity and readability of error messages
- Enhances visual affordance of errors
- Replaces technical jargon with actionable language

## Nielsen Heuristic Compliance

**Heuristic #9: Help Users Recognize, Diagnose, and Recover from Errors**
> "Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution." [nngroup/help-recover-errors](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector enforces that by:
- Rejecting technical error language
- Requiring visible, styled indicators of error states (red, bold)

## Technical Details
- Uses AST traversal via @babel/parser and @babel/traverse
- Searches JSX components for tags, classes, and inline styles related to errors
- Analyzes children text nodes for known technical phrases