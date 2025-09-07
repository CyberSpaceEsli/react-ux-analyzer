// Debug test script for breadcrumb detector
const fs = require('fs');
const BreadcrumbDetector = require('./heuristics/visibility-system-status/breadcrumb-detector');

function runDebugTests() {
    console.log('🔍 RUNNING BREADCRUMB DEBUG TESTS');
    console.log('==================================\n');
    
    const detector = new BreadcrumbDetector();
    
    try {
        // Test 1: Bad breadcrumbs
        console.log('1️⃣  Testing BAD breadcrumbs:');
        console.log('📄 File: bad-breadcrumbs.jsx');
        
        const badFile = fs.readFileSync('./test/test-breadcrumbs/bad-breadcrumbs.jsx', 'utf8');
        const badResults = detector.detectBreadcrumbs(badFile);
        const badMissing = badResults.filter(r => r.type === 'missing-breadcrumb');
        
        console.log(`❌ Found ${badMissing.length} missing breadcrumbs:\n`);
        badMissing.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Content: ${result.content}`);
            console.log(`   Message: ${result.message}\n`);
        });
        
        // Test 2: Mixed breadcrumbs
        console.log('2️⃣  Testing MIXED breadcrumbs:');
        console.log('📄 File: mixed-breadcrumbs.jsx');
        
        const mixedFile = fs.readFileSync('./test/test-breadcrumbs/mixed-breadcrumbs.jsx', 'utf8');
        const mixedResults = detector.detectBreadcrumbs(mixedFile);
        const mixedMissing = mixedResults.filter(r => r.type === 'missing-breadcrumb');
        const mixedGood = mixedResults.filter(r => r.type === 'good-breadcrumb');
        
        console.log(`✅ Found ${mixedGood.length} good breadcrumbs`);
        console.log(`❌ Found ${mixedMissing.length} missing breadcrumbs:\n`);
        
        mixedMissing.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Content: ${result.content}`);
            console.log(`   Message: ${result.message}\n`);
        });
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the debug tests
runDebugTests();
