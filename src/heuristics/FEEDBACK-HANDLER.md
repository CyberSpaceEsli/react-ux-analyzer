# 🧾 FeedbackHandler Documentation

The `FeedbackHandler` class is the central system for rendering results and UI/UX feedback inside **React UX Analyzer**. It ensures a unified display of issues across all detectors — including built-in heuristics and custom rules.

## Purpose

- Eliminates duplicated output code across heuristic detectors
- 📦 Displays results in the **VS Code Problems panel**
- Automatically maps detected issues to the correct heuristic (or custom rule)
- 🔗 Supports links to documentation for each rule

## Core Responsibilities
Following table lists the core functionalities of the **Feedback Handler** and their responsibility.

| Feature | Description |
|--------|-------------|
| Consistent formatting | Uses a shared layout for all detectors |
| Severity handling | Currently limited to `"warning"` (no other severities) |
| Output Channels | Shows diagnostics + logs with icons per issue |
| Custom rule support | Auto-detects and formats rules defined by users |
| Links | Supports `links` for heuristics and `docs` for custom rules, offers fallback links |

## Usage Example of Feedback Handler (in `extension.js`)
```js
const feedbackHandler = new FeedbackHandler();

const issues = detect....(content);

feedbackHandler.showResults(fileName, issues.map(issue => ({
 ...issue,
 analysisType: '...'
})));
```

1. Create a new instance of the `FeedbackHandler()` class

2. Execute your chosen detector (built-in or custom) and store the returned issue objects in a the constant:  `issues`

3. Pass collected issues to `feedbacjHandler.showResults(...)` with file path which automatically formatts message based on `analysisType` adn displays it in  VS Code’s **Problems Panel**
 
## Diagnostic Example Output (VS Code Problem Channel)
Each feedback issue is rendered as a **diagnostic message** in the VS Code Problems panel.
```
Line 42: <img> tag missing alt attribute.
Action: Add a descriptive alt attribute to all <img> tags.
Why: Alt text is critical for accessibility and screen readers.
Heuristic: Custom UX Rule: missingAlt (CUX-MISSINGALT)
More info: https://www.w3.org/WAI/tutorials/images/decision-tree/
```

> **Note**: Showing feedback in the **Problem Channel** allows for **code highlighting** and **tooltips** on hover, which also show the diagnostics.

## Severity Mapping
⚠️ Only `"warning"` feedback is currently shown to avoid noise and each detection needs to be solved for optimal UI/UX flow.
```js
feedback.push({    
    // other feedback issue types
    severity: 'warning',
    // other feedback issue types        
});
```

## Issue Types
Each issue contains:
| Field | Data type | Description |
|--------|--------|-------------|
| `line`  | `number` | Uses a shared layout for all detectors |
| `message` | `string` | Tells users what got detected  |
| `severity` | `string` | Currently limited to `"warning"` (no other severities) |
| `analysisType` | `string` | Maps to a Nielsen heuristic or custom rule here use `CUSTOM:my-custom-rule.js` |
| `why` | `string` | Why issue matters to users |
| `action` | `string` | How to fix issue |
| `docs` | `string` | Supports `links` for heuristics and `docs` for custom rules, offers fallback links |


## Heuristic Labels
Internally, `analysisType` maps to heuristic names and codes like so:
| analysisType | Heuristic Name | Code |
|------------------|-----------------|-------------|
| `BREADCRUMB`  | Visibility of System Status | RUX101 |
| `LOADING` | Visibility of System Status | RUX102  |
| `MATCH_SYSTEM_REAL_WORLD` | Match System & Real World | RUX201 |
| `CONTROL` | User Control & Freedom | RUX301 |
| `CONSISTENCY` | Consistency & Standards | RUX401 |
| `ERROR_PREVENTION` | Error Prevention | RUX501 |
| `RECOGNITION` | Recognition vs. Recall | RUX601|
| `FLEXIBILITY_EFFICIENCY` | Flexibility & Efficiency | RUX701|
| `AESTHETIC_MINIMALISM` | Aesthetic & Minimalist Design | RUX801|
| `ERROR_RECOVERY` | Help Users Recover from Errors | RUX901|
| `HELP` | Help & Documentation | RUX1001|
| `CUSTOM:*` | Custom UX Rule | CUX-*|

### More Examples
For questions or examples, see:
- [Custom UX Rule Documentation](./utils/CUSTOM-RULES.md)
- [Heuristic Detection Documentation](./HEURISTICS.md)