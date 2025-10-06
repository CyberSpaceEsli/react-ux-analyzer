// language-analyzer.js
const analysisCache = new Map();

// Shared fetch logic using Grok4 via OpenRouter
async function getLLMCompletion(text, apiKey, maxTokens = 200, temperature = 0.3) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/CyberSpaceEsli/react-ux-analyzer",  // Optional
                "X-Title": "react-ux-analyzer",           // Optional
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-maverick:free", 
                messages: [{ role: "user", content: text }],
                temperature,
                reasoning: {
                    "effort": "high",
                    "exclude": false,
                    "enabled": true
                },
                max_tokens: maxTokens
            }),
        });

        const raw = await response.json();
        console.log('OpenRouter API response:', raw);

        const data = /** @type {{ choices?: any[], error?: { message?: string } }} */ (raw);

        if (!response.ok) {
            console.error('🛑 OpenRouter Error:', data);
            throw new Error(data.error?.message || 'Unknown LLM error');
        }

        

        return data.choices?.[0]?.message?.content?.trim() || null; //get nested value from chat-based API response

    } catch (error) {
        console.error("❌ Failed to fetch from LLM:", error);
        throw error;
    }
}

// Business Domain with LLM
async function detectBusinessDomain(text, availableDomains = ['health', 'legal', 'finance', 'e-commerce', 'information technology', 'education'], apiKey) {
    if (!text || text.trim().length < 100) return null;

    const prompt = `
You are an expert at identifying the business domain of digital products based on language, terminology, and user context.

Your task is to determine the most appropriate **business domain** of the following text. 
Respond with only **one word** from this list, and **nothing else**: ${availableDomains.join(', ')}.

If you're unsure, choose the **closest** match. Do NOT explain anything.

Text to analyze:
${text.substring(0, 3000)}
    `.trim();

    try {
        const response = await getLLMCompletion(prompt, apiKey, 20, 0.1);
        const domain = response.toLowerCase().replace(/[^a-z\s-]/g, '').trim();

        if (availableDomains.includes(domain)) {
            console.log(`✅ Detected domain: ${domain}`);
            return domain;
        } else {
            console.warn(`⚠️ Detected domain '${domain}' not in expected list.`);
            return null;
        }

    } catch (error) {
        console.error('❌ Error during business domain detection:', error);
        return null;
    }
}

// 3. Technical/Internal Jargon Detection
async function checkForJargon(text, businessDomain = 'general', apiKey) {
    if (!text || text.trim().length < 3) return null;

    const cacheKey = `${businessDomain}:${text}`;
    if (analysisCache.has(cacheKey)) return analysisCache.get(cacheKey);

   /* const examples = {
        health: `
Examples:
- ❌ "Initiate diagnostic imaging"
- ❌ "Discontinue medication protocol"
- ❌ "Adverse reactions include..."
- ✅ "Start scan"
- ✅ "Stop taking your medicine"
- ✅ "Side effects may include..."
        `,
        legal: `
Examples:
- ❌ "Pursuant to clause 3b"
- ❌ "Initiate litigation process"
- ❌ "Statutory obligation required"
- ✅ "Based on the law"
- ✅ "Start legal action"
- ✅ "According to the rule"
        `,
        finance: `
Examples:
- ❌ "Account reconciliation in progress"
- ❌ "Liquidate assets"
- ❌ "Terminate session"
- ✅ "Checking your balance"
- ✅ "Sell your stocks"
- ✅ "We're checking your account balance"
        `,
        "e-commerce": `
Examples:
- ❌ "Initiate RMA"
- ❌ "Fulfillment initiated"
- ❌ "Proceed to checkout"
- ✅ "Return your item"
- ✅ "Your order has shipped"
- ✅ "Go to payment"
        `,
        "information technology": `
Examples:
- ❌ "Authenticate credentials"
- ❌ "Terminate session"
- ❌ "Deprecation warning"
- ✅ "Log in"
- ✅ "Close your session"
- ✅ "This feature will be removed soon"
        `,
        education: `
Examples:
- ❌ "Prerequisite not met"
- ❌ "Course enrollment complete"
- ✅ "You need to take another course first"
- ✅ "You're signed up"
        `
    };*/

    //const domainExamples = examples[businessDomain] || '';

    const prompt = `
You are a UX language expert in education.

Evaluate the following UI text for difficult-to-understand terms.

Instructions (follow EXACTLY):
- "OK" if user-friendly
- If the text contains jargon or technical terms, for each term respond **ONLY**: "Jargon detected: [term] – [short explanation] instead use [simpler alternative]"

Do NOT add any extra explanations or text.

Text to analyze: "${text}"
`.trim();

    try {
        const result = await getLLMCompletion(prompt, apiKey, 150, 0.1); //150 tokens for jargon response with 0.1 for less randomness
        console.log('Test jargon detection result:', result);

        if (!result || result.trim() === '') {
            console.warn('⚠️ Empty response from model');
            analysisCache.set(cacheKey, null);
            return null;
        }

        if (/jargon detected/i.test(result.toLowerCase())) {
            analysisCache.set(cacheKey, result);
            return result;
        } else {
            analysisCache.set(cacheKey, null);
            return null;
        }

    } catch (error) {
        console.error("❌ Error during jargon detection:", error);
        return null;
    }
}

module.exports = {
    checkForJargon,
    detectBusinessDomain,
};