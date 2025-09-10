// Debug test script for breadcrumb, loading and modal detectors
const fs = require('fs');
const BreadcrumbDetector = require('./heuristics/1-visibility-system-status/breadcrumb-detector');
const LoadingDetector = require('./heuristics/1-visibility-system-status/loading-detector');
const ModalExitDetector = require('./heuristics/3-user-control-freedom/modal-exit-detector');
const FeedbackHandler = require('./heuristics/feedback-handler');

function runDebugTests() {
    console.log('🔍 RUNNING BREADCRUMB, LOADING, MODAL & FEEDBACK TESTS');
    console.log('=====================================================\n');
    
    // FEEDBACK HANDLER TESTS
    console.log('📋 FEEDBACK HANDLER ANALYSIS');
    console.log('=============================\n');
    
    const feedbackHandler = new FeedbackHandler();
    
    // BREADCRUMB TESTS
    console.log('🔗 BREADCRUMB ANALYSIS');
    console.log('======================\n');
    
    const breadcrumbDetector = new BreadcrumbDetector();
    
    try {
        // Test 1: Bad breadcrumbs
        console.log('1️⃣  Testing BAD breadcrumbs:');
        console.log('📄 File: bad-breadcrumbs.jsx');
        
        const badFile = fs.readFileSync('./test/test-breadcrumbs/bad-breadcrumbs.jsx', 'utf8');
        const badResults = breadcrumbDetector.detectBreadcrumbs(badFile);
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
        const mixedResults = breadcrumbDetector.detectBreadcrumbs(mixedFile);
        const mixedMissing = mixedResults.filter(r => r.type === 'missing-breadcrumb');
        const mixedGood = mixedResults.filter(r => r.type === 'good-breadcrumb');
        
        console.log(`✅ Found ${mixedGood.length} good breadcrumbs`);
        console.log(`❌ Found ${mixedMissing.length} missing breadcrumbs:\n`);
        
        mixedMissing.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Content: ${result.content}`);
            console.log(`   Message: ${result.message}\n`);
        });
        
        // LOADING TESTS
        console.log('\n⏳ LOADING ANALYSIS');
        console.log('==================\n');
        
        const loadingDetector = new LoadingDetector();
        
        // Test 3: Bad loading
        console.log('3️⃣  Testing BAD loading:');
        console.log('📄 File: bad-loading.jsx');
        
        const badLoadingFile = fs.readFileSync('./test/test-loading/bad-loading.jsx', 'utf8');
        const badLoadingResults = loadingDetector.detectLoadingPatterns(badLoadingFile);
        const badLoadingIssues = badLoadingResults.filter(r => r.severity === 'warning');
        
        console.log(`❌ Found ${badLoadingIssues.length} loading issues:\n`);
        badLoadingIssues.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Content: ${result.content}`);
            console.log(`   Message: ${result.message}\n`);
        });
        
        // Test 4: Mixed loading
        console.log('4️⃣  Testing MIXED loading:');
        console.log('📄 File: mixed-loading.jsx');
        
        const mixedLoadingFile = fs.readFileSync('./test/test-loading/mixed-loading.jsx', 'utf8');
        const mixedLoadingResults = loadingDetector.detectLoadingPatterns(mixedLoadingFile);
        const mixedLoadingIssues = mixedLoadingResults.filter(r => r.severity === 'warning');
        const mixedLoadingGood = mixedLoadingResults.filter(r => r.severity === 'info');
        
        console.log(`✅ Found ${mixedLoadingGood.length} good loading practices`);
        console.log(`❌ Found ${mixedLoadingIssues.length} loading issues:\n`);
        
        mixedLoadingIssues.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Content: ${result.content}`);
            console.log(`   Message: ${result.message}\n`);
        });

    } catch (error) {
        console.error('❌ Loading test failed:', error.message);
    }

    // MODAL TESTS
    console.log('\n🔴 MODAL ANALYSIS');
    console.log('=================\n');
    
    const modalDetector = new ModalExitDetector();
    
    try {
        // Test 1: Bad modals
        console.log('1️⃣  Testing BAD modals:');
        console.log('📄 File: bad-modals.jsx');
        
        const badModalFile = fs.readFileSync('./test/test-modals/bad-modals.jsx', 'utf8');
        const badModalResults = modalDetector.detectModalExits(badModalFile);
        
        console.log(`❌ Found ${badModalResults.length} modal exit issues:\n`);
        badModalResults.forEach((result, index) => {
            console.log(`${index + 1}. Line ${result.line}: ${result.type}`);
            console.log(`   Context: ${result.context || result.issue || result.message}`);
            console.log(`   Pattern: ${result.pattern}\n`);
        });

        // Test FeedbackHandler integration
        console.log('2️⃣  Testing FeedbackHandler integration with modals:');
        feedbackHandler.showResults({
            analysisType: 'MODAL',
            fileName: './test/test-modals/bad-modals.jsx',
            issues: badModalResults,
            issueLabel: 'MODAL EXIT ISSUES'
        });
        console.log('✅ FeedbackHandler integration successful\n');
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the debug tests
runDebugTests();
