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

## NIMA SetUp
0. **Set Local Dev URL**
- Run command `🌐 Set Local Dev URL` and insert your localhost url (e.g., `http://localhost:3000`)
- If you configured the URL already, skip this step

1. **Install Python 3**
- Ensure Python 3 is installed, check your Python version
```bash
   python3 --version
```

2. **Create a virtual environment**
```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install required Python packages**
```bash
   pip install -r dist/python/requirements.txt
```

## Run NIMA 
You can run the NIMA visual quality check directly from VS Code using the built-in command palette:

1. Press `Cmd + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux)
2. Select or Type `React Ux Analyzer: Analyze Visual Quality (NIMA)`
3. The extension will:
- Take a screenshot of your current app (from your defined URL at`🌐 Set Local Dev URL`)
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
- Python Dependencies: TensorFlow, Pillow, numpy
- For Python to function it needs a `venv/` with `python3`
- Node Dependencies: puppeteer (for screenshots)
- Output: Mean score, standard deviation