# 🌍 Language Detector (`match-system-world-detector.js`)

Detects technical or internal jargon in visible text nodes to support **Nielsen Heuristic #2: Match Between System and the Real World**. It ensures UI language matches user words, phrases and familiar concepts.

## What the Detector Does
This detector analyzes all visible text in your JSX/HTML files and flags any terms that are overly technical, domain-specific, or unclear to average users.

Its purpose is to replace internal or technical language with terms that resonate with real-world understanding.

## How the Detector Works

### Main Function: `detectMatchSystemwithRealWorld(visibleText, apiKey, domain = 'general')`
```javascript

function detectMatchSystemwithRealWorld(visibleText, apiKey, domain = 'general') {
  const feedback = [];

  //check extracted text lines for jargon detection
  
  // detector needs LLM processing function
  const result = await checkForJargon(textLine, apiKey, domain);
  //feedback.push

 return feedback;
}
```

### Key Detection Methods
| Method | Description |
|--------|-------------|
| `checkForJargon(text, apiKey)` | Uses LLM API to detect technical terms, acronyms, or domain-specific phrases |
| `!seenJargon.has(match)` | Avoids repeating warnings for the same jargon |
| `(textLine.length < 3)` | Skips overly short or invalid lines |
| Error Handling | Gracefully skips lines if API request fails |

### Detection Logic
1. Uses visible text entries from the UI (e.g., paragraphs, titles) (see function `heuristics/utils/extractVisibleText.js`)
2. Call LLM via OpenRouter
- Uses LLM Free Tier Model from Meta: Llama 4 Maverick
- Takes API Key for requests (see Using OpenRouter API Features 🔐)
- Determines business domain and language jargon (see function `heuristics/2-match-system-with-real-world/language-analyzer.js`)
3. Sends each text line to a language model (LLM) [meta-llama/llama-4-maverick:free] via the OpenRouter API
4. Receives and parses any matches of jargon terms
5. All matched terms are added to the feedback array with explanation and action

> Note: Each time the language model (LLM) is triggered, it may produce different results and detect a varying number of jargon terms.

### Using OpenRouter API Features 🔐

To use language-based features, you need a free OpenRouter API key:

1. Go to [https://openrouter.ai](https://openrouter.ai/settings/keys)
2. Log in and go to your dashboard
3. Click on Button `Create API Key`
4. Copy your API key (starts with `sk-`)
5. In VS Code, press `Cmd+Shift+P` → `🔑 Set OpenRouter API Key`
6. Paste your key and you're done ✅

Now you can use the command `React UX Analyzer: Analyze Match System with Real World (Nielsen #2: Match Between System & Real World)` to detect internal or technical jargon in React projects.

## Feedback Example
```
Line 14: Jargon detected: locus - instead use key place
Action: Use words, phrases, and concepts familiar to the user, see LLM answer.
Why: Users should understand meaning without needing to look it up.
Heuristic: Nielsen #2: Match Between System and Real World (RUX201)
More info: https://www.nngroup.com/articles/match-between-system-and-the-real-world/
```

## Why Detector Matters
Jargon hurts usability by:
- Creating confusion for non-technical users
- Decreasing accessibility and comprehension

When the phrasing of the system follows real-world conventions and achieve desireed outcomes (achieve natural mapping), users better learn and remember how interface works. 

## Nielsen Heuristic Compliance

**Heuristic #2: Match Between System and the Real World**
> "The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon." [nngroup/jargon](https://www.nngroup.com/articles/ten-usability-heuristics/)

This detector supports that by:
- Recommending plain language
- Avoiding developer- or business-internal terminology
- Reducing barriers between interface and user

## Technical Details
- Based on LLM analysis via OpenRouter
- Deduplicates identical jargon matches
- Recognizes certain domains via context input (health, legal, finance, e-commerce, information technology, and education) 