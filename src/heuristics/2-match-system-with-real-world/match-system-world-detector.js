const { checkForJargon } = require("./language-analyzer.js");

/* Mock LLM function for jargon detection
async function checkForJargon(textLine, domain, apiKey) {
    // Return sample outputs for matching test cases
     let output = [];
    if (textLine.includes("frameworks")) {
        output.push(`Jargon detected: comprehensive educational frameworks – Detailed plans for education covering various subjects; use "well-rounded education"`);
    }
    if (textLine.includes("talent")) {
        output.push(`Jargon detected: talent cultivation – Nurturing someone's abilities; use "helping students develop their skills"`);
    }
    // Add more terms as needed
    return output.join('\n');
  }*/

/**
 * detectMatchSystemwithRealWorld - Detects internal or technical jargon in UI text elements with LLM.
 * Heuristic: Nielsen #2 - Match between system and the real world
 */
async function detectMatchSystemwithRealWorld(visibleText, domain = 'general', apiKey) {
  const feedback = [];
  // tracks jargon matches to avoid duplicates
  const seenJargon = new Set();

  for (const { text, line } of visibleText) {
    if (typeof text !== 'string') continue;
    const textLine = text.trim();
    if (textLine.length < 3) continue;

    try {
      // call LLM to check for jargon words/phrases
      const result = await checkForJargon(textLine, domain, apiKey);
      console.log(`🔍 DEBUG: LLM result for "${textLine}":`, result);
      if (result) {
        const matches = result.split('\n').filter(Boolean);
        console.log(`🔍 DEBUG: Matches found:`, matches);
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