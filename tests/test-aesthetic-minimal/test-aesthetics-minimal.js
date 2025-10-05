const path = require("path");
const fs = require("fs");
const { detectAestheticMinimalism } = require("../../src/heuristics/8-aesthetic-minimalist-design/aesthetic-minimalistic-detector");

const filePath = path.join(__dirname, "bad-minimalistics.jsx");
const content = fs.readFileSync(filePath, "utf8");
const feedback = detectAestheticMinimalism(content);

console.log("Feedback from detector:", feedback);