const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { detectBusinessDomain } = require('../../src/heuristics/2-match-system-with-real-world/language-analyzer.js');
const { detectMatchSystemwithRealWorld } = require('./../../src/heuristics/2-match-system-with-real-world/match-system-world-detector.js');
const { extractVisibleTextFromCode } = require('./../../src/heuristics/utils/extractVisibleText.js');

// ✅ File path to analyze (change as needed)
const FILE_PATH = './test/test-system-real-world/bad-server-status-jargon.jsx';

async function runAnalysis() {
    try {
        const content = fs.readFileSync(path.resolve(FILE_PATH), 'utf8');

        console.log(chalk.cyan(`\n📄 Analyzing file: ${FILE_PATH}`));
        const visibleText = extractVisibleTextFromCode(content); // array of {text, line}

        // 🔍 Step 1: Detect domain
        console.log(chalk.yellow('🧠 Detecting business domain...'));
        const domain = await detectBusinessDomain(
            visibleText.map(({ text }) => text).join(' '), // combine text lines for domain detection
        );
        console.log(chalk.greenBright(`✅ Detected domain: ${domain || 'general'}\n`));

        // 🔍 Step 2: Run jargon detector
        console.log(chalk.yellow('🧪 Running jargon analysis...\n'));
        const results = await detectMatchSystemwithRealWorld(visibleText, domain || 'general'); // pass array of {text, line}

        if (results.length === 0) {
            console.log(chalk.green('✅ No jargon detected. The UI text is user-friendly.\n'));
        } else {
            results.forEach(issue => {
                console.log(chalk.red(`⚠️ Line ${issue.line}: ${issue.message}`));
            });
            console.log(`\n🧾 ${results.length} potential UX language issue(s) found.`);
        }

    } catch (err) {
        console.error(chalk.red('❌ Error running test:'), err.message);
    }
}

runAnalysis();