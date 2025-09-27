// draw-element-areas.js

/**
 * Draws bounding boxes on a screenshot image based on provided masks.
 * @param {string} screenshotPath - Path to the screenshot image file
 * @param {string} maskPath - Path to the JSON file containing bounding boxes
 * @param {string} outputPath - Path to save the output image with drawn boxes
 */
const path = require('path');
const fs = require('fs');

async function drawElementAreas(screenshotPath, maskPath, outputPath = 'debug-whitespace.png') {
  const { read, write } = await import('image-js');
  const image = await read(path.resolve(screenshotPath));
  const { boxes } = JSON.parse(fs.readFileSync(path.resolve(maskPath), 'utf-8'));

  let result = image.clone();

  for (const { x, y, width, height } of boxes) {
    result = result.drawRectangle({
      origin: { row: y, column: x },
      width,
      height,
      strokeColor: [255, 0, 0], // Red color
    });
  }

  await write(path.resolve(outputPath), result);
  console.log(`🖼️ Debug image with boxes saved: ${outputPath}`);
}

module.exports = { drawElementAreas };