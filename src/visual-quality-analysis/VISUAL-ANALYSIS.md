# Visual Quality Analysis (NIMA)

Performs a quantitative aesthetic evaluation of the application using a **Neural Image Assessment** (NIMA) model. 
This module uses a pretrained NIMA model to **score UI screenshots based on human-like aesthetic judgment**.

## What It Does
The NIMA Visual Quality Checker runs a deep learning-based assessment to evaluate the prjects visual appeal, using:
- A screenshot of the current app view (defined localhost url)
- A pretrained MobileNet-based NIMA model (`mobilenet_weights.h5`)
- A Python backend that returns a mean aesthetic score (0–10) and a standard deviation thereof

## Why It Matters
While heuristics measure usability, this tool estimates aesthetic quality — the first impression users get from your projects layout, and visual balance.

Visual appeal has measurable effects:
- Increases trust and credibility
- Boosts perceived usability
- Improves retention and user satisfaction

## 📂 File Structure
```
📦 visual-quality
 ┣ 📜 run-nima-check.js         // JS orchestrator for the check
 ┣ 📁 screenshot/
 ┃ ┗ 📸 screenshot.png          // Temporary image used for analysis
 ┣ 📁 python/
 ┃ ┣ 📜 run_nima.py             // Python script for running model
 ┃ ┗ 📁 model/
 ┃   ┗ 📦 mobilenet_weights.h5  // Pretrained model weights
 ┣ 📁 venv/                     // Python virtual environment
 ┗ 📜 .env                      // Define REACT_APP_URL here
```

## How Visual Quality Detection Works
1. Take Screenshot of Your App
The tool opens your app (defined by `REACT_APP_URL`) in a headless browser and captures a full-page screenshot.
2. Run NIMA Model in Python
It then calls a Python script (`python/run_nima.py`) that:
- Loads the pretrained MobileNet model
- Evaluates the screenshot
- Outputs:
	•	mean: overall visual quality (0 = bad, 10 = excellent)
	•	std: variation in perceived score
3. Return Result to Node.js
Output is parsed and returned to the calling JS environment for integration into feedback dashboards or logs. (`run-nima-checks.js`)

## Supported Localhost URL's
Only works for react projects made with Vite and defaults to create react app. (CRA)
```
{
  REACT_APP_URL=http://localhost:5173 || http://localhost:3000
}
```

## Run NIMA 
You can run the NIMA visual quality check directly from VS Code using the built-in command palette:

1. Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
2. Select or Type 
Analyze Visual Quality (NIMA)
3. The extension will:
- Take a screenshot of your current app (from `REACT_APP_URL`)
- Analyze it using the NIMA deep learning model
- Return a score indicating visual aesthetics

## Output Example
✅ NIMA Score: 6.84 (±1.07)

Score Interpretation:
| Mean Score | Aesthetic Quality |
|----------|-------------|
| 0.0 - 3.0 | Poor |
| 3.0 - 5.0 | Below Average |
| 5.0 - 7.0 | Acceptable |
| 7.0 - 8.5 | Good |
| 8.5 - 10.0 | Excellent |

Higher standard deviation (std) indicates more variation in the aesthetic judgment — i.e., your UI may appeal to some but not all users.

## Technical Notes
- Model: MobileNet (pretrained on AVA dataset)
- Source: [titu1994/neural-image-assessment](https://github.com/titu1994/neural-image-assessment)
- Python Dependencies: TensorFlow / Keras, Pillow, numpy
- For Python to function it needs a correctly configured executable path (`./venv/bin/python3` in default)
- Node Dependencies: puppeteer (for screenshots), dotenv (for .env config)
- Output: Mean score from 1–10, standard deviation