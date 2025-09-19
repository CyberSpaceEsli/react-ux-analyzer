// languageAnalyzer.js
require('dotenv').config();

const analysisCache = new Map();

// ---[ 1. Shared fetch logic to LLaMA-3 via OpenRouter ]---
async function getLLMCompletion(text, maxTokens = 100, temperature = 0.3) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/CyberSpaceEsli/react-ux-analyzer",  // Optional
                "X-Title": "react-ux-analyzer",           // Optional
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct:free", 
                messages: [{ role: "user", content: text }],
                temperature,
                max_tokens: maxTokens
            }),
        });

        const raw = await response.json();
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

// ---[ 2. Business Domain Detection ]---
async function detectBusinessDomain(text, availableDomains = ['health', 'legal', 'finance', 'e-commerce', 'information technology', 'education']) {
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
        const response = await getLLMCompletion(prompt, 20, 0.1);
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

// ---[ 3. Technical/Internal Jargon Detection ]---
async function checkForJargon(text, businessDomain = 'general') {
    if (!text || text.trim().length < 3) return null;

    const cacheKey = `${businessDomain}:${text}`;
    if (analysisCache.has(cacheKey)) return analysisCache.get(cacheKey);

    const examples = {
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
    };

    const domainExamples = examples[businessDomain] || '';

    const prompt = `
You are a professional UX language expert in the ${businessDomain} industry.

Evaluate the following UI text for clarity and better understanding to non-technical or non-internal users.

Avoid:
- Technical or developer terms
- Internal abbreviations (e.g., SKU, RMA)
- Legal, policy, or clinical jargon

${domainExamples}

Instructions:
- ✅ "OK" — if the text is clear and user-friendly
- ⚠️ If it contains technical, complex or internal language, respond only with this exact format: 
"Jargon detected: [term] – [short explanation + simple alternative]"

Examples:
- SKU – internal product code, replace with "Product code"
- Fulfillment center – internal logistics term, say "warehouse"

Dont add any extra explanations or text.

Text to analyze:
"${text}"
    `.trim();

    try {
        const result = await getLLMCompletion(prompt, 60, 0.2); //60 tokens for detailed response, 0.2 closely to logic with some creativity

        if (result.toLowerCase().startsWith('jargon detected')) {
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

// ---[ 4. Exports ]---
module.exports = {
    checkForJargon,
    detectBusinessDomain,
};