const { checkForJargon } = require("./languageAnalyzer.js");

/**
 * Detects internal or technical jargon in UI text elements.
 * Heuristic: Nielsen #2 - Match between system and the real world
 * Jargon can confuse users and hinder usability.
 */

async function detectMatchSystemwithRealWorld(visibleText, domain = 'general') {
    const feedback = [];

    const seenTexts = new Set();
    // combines all text lines
    const allTextLines = [];

    // Collects all text lines, avoiding duplicates and very short lines
    for (const { text } of visibleText) {
        if (typeof text !== 'string') continue;
        const textLine = text.trim();
        if (textLine.length < 3 || seenTexts.has(textLine)) continue;
        seenTexts.add(textLine);
        allTextLines.push(textLine);
    }

    // Join all text lines
    const combinedText = allTextLines.join(' ').trim();

    // Call the jargon detection function and parse whole text block
    let result;
    try {
        result = await checkForJargon(combinedText, domain);
    } catch (err) {
        console.error("❌ Jargon detection failed:", err.message);
        return feedback;
    }

    // If jargon is detected, show it for the whole block
    if (result) {
        feedback.push({
            type: 'jargon-detected',
            line: visibleText?.[0]?.line || 1, // fallback to line 1
            message: result, // Jargon detected: [jargon term] -> [short explanation + simple alternative] from LLM
            severity: 'warning',
        });
    }

  return feedback;
}

module.exports = { detectMatchSystemwithRealWorld };