const { checkForJargon } = require("./language-analyzer.js");

/**
 * detectMatchSystemwithRealWorld - Detects internal or technical jargon in UI text elements with LLM.
 * Heuristic: Nielsen #2 - Match between system and the real world
 */

async function detectMatchSystemwithRealWorld(visibleText, apiKey, domain = 'general') {
    const feedback = [];
    // tracks actual jargon matches from extractVisibleText
    const seenJargon = new Set();

    for (const { text, line } of visibleText) {
        if (typeof text !== 'string') continue;
        const textLine = text.trim();
        if (textLine.length < 3) continue;

        try {
            // call LLM to check for jargon words/phrases
            const result = await checkForJargon(textLine, apiKey, domain);
            if (result) {
                const matches = result.split('\n').filter(Boolean);
                for (const match of matches) {
                    if (!seenJargon.has(match)) {
                        seenJargon.add(match);
                        feedback.push({
                            type: 'jargon-detected',
                            line,
                            message: match, // e.g. "Jargon detected: Cloud Instance – technical cloud computing term, replace with "Cloud Server"
                            severity: 'warning',
                            why: 'Users should understand meaning without needing to look it up.',
                            action: 'Use words, phrases, and concepts familiar to the user, see LLM answer.',
                        });
                    }
                }
            }
        } catch (err) {
            console.error(`❌ Jargon detection failed on line ${line}:`, err.message);
        }
    }

    return feedback;
}

module.exports = { detectMatchSystemwithRealWorld };