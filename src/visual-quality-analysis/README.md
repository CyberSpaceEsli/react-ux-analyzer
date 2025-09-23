# Visual Quality Analysis (NIMA)

This module uses a pretrained Neural Image Assessment (NIMA) model to score UI screenshots based on human-like aesthetic judgment.

- Model: MobileNet (pretrained on AVA dataset)
- Source: [titu1994/neural-image-assessment](https://github.com/titu1994/neural-image-assessment)
- Dependencies: TensorFlow, Pillow
- Output: Mean score from 1–10

> Run via Node: `python3 run_nima.py screenshot.png`