/**
 * Debug Script - React UX Analyzer
 * 
 * This script tests both BreadcrumbDetector and LoadingDetector
 * using the new centralized FeedbackHelper for consistent output.
 */

const fs = require('fs');
const BreadcrumbDetector = require('./heuristics/visibility-system-status/breadcrumb-detector');
const LoadingDetector = require('./heuristics/visibility-system-status/loading-detector');
const StandaloneFeedbackHelper = require('./test/test-feedback-helper');

console.log('🧪 React UX Analyzer - Debug Mode\n');

// Test files
const testFiles = [
    './test/test-breadcrumbs/bad-breadcrumbs.jsx',
    './test/test-breadcrumbs/mixed-breadcrumbs.jsx',
    './test/test-loading/bad-loading.jsx',
    './test/test-loading/mixed-loading.jsx'
];

const breadcrumbDetector = new BreadcrumbDetector();
const loadingDetector = new LoadingDetector();

testFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 Analyzing: ${file}`);
        console.log(`${'='.repeat(60)}\n`);
        
        const content = fs.readFileSync(file, 'utf8');
        
        // Test breadcrumb detection
        if (file.includes('breadcrumb')) {
            const patterns = breadcrumbDetector.detectBreadcrumbs(content);
            const issues = patterns.filter(p => p.type === 'missing-breadcrumb');
            
            StandaloneFeedbackHelper.showResults({
                analysisType: 'BREADCRUMB',
                fileName: file,
                issues: issues,
                issueLabel: 'MISSING BREADCRUMBS'
            });
        }
        
        // Test loading detection
        if (file.includes('loading')) {
            const patterns = loadingDetector.detectLoadingPatterns(content);
            const issues = StandaloneFeedbackHelper.filterIssues(patterns);
            
            StandaloneFeedbackHelper.showResults({
                analysisType: 'LOADING',
                fileName: file,
                issues: issues,
                issueLabel: 'LOADING ISSUES'
            });
        }
    }
});

console.log(`\n${'='.repeat(60)}`);
console.log('✅ Debug complete!');
console.log(`${'='.repeat(60)}`);
