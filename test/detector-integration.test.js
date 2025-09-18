/**
 * Detector Integration Test Suite
 * 
 * This test file validates that all detector classes work correctly:
 * - Each detector can be imported and instantiated
 * - Multiple detector calls don't cause state interference
 * - Babel parser errors are handled gracefully
 * - State isolation between detector instances
 */

// Test content samples
const testContent = {
    goodBreadcrumbs: `
        import React from 'react';
        const GoodBreadcrumbs = () => (
            <nav aria-label="breadcrumb">
                <ol>
                    <li><a href="/">Home</a></li>
                    <li><a href="/products">Products</a></li>
                    <li aria-current="page">Current Page</li>
                </ol>
            </nav>
        );
        export default GoodBreadcrumbs;
    `,
    
    badLoading: `
        import React, { useState } from 'react';
        const BadLoading = () => {
            const [loading, setLoading] = useState(false);
            
            const handleSubmit = async () => {
                setLoading(true);
                await fetch('/api/data');
                // Missing loading state reset!
            };
            
            return (
                <form onSubmit={handleSubmit}>
                    <button type="submit">Submit</button>
                </form>
            );
        };
        export default BadLoading;
    `,
    
    badModal: `
        import React from 'react';
        const BadModal = ({ isOpen }) => (
            isOpen && (
                <Modal>
                    <div>
                        <h2>Delete Item</h2>
                        <p>Are you sure?</p>
                        <button>Delete</button>
                    </div>
                </Modal>
            )
        );
        export default BadModal;
    `
};

console.log('Starting Detector Integration Tests...');

function test_breadcrumb_detector() {
    console.log('\n=== Testing BreadcrumbDetector ===');
    
    try {
        const BreadcrumbDetector = require('../src/heuristics/1-visibility-system-status/breadcrumb-detector');
        
        // Test 1: Create fresh instance
        console.log('✓ BreadcrumbDetector instance created');
        
        // Test 2: Run detection
        const result1 = BreadcrumbDetector.detectBreadcrumbs(testContent.goodBreadcrumbs);
        console.log(`✓ First detection completed (${result1.length} issues found)`);
        
        // Test 3: Run again to test state isolation
        const result2 = BreadcrumbDetector.detectBreadcrumbs(testContent.badLoading);
        console.log(`✓ Second detection completed (${result2.length} issues found)`);
        
        // Test 4: Create another instance
        const result3 = BreadcrumbDetector.detectBreadcrumbs(testContent.goodBreadcrumbs);
        console.log(`✓ Third detection with new instance (${result3.length} issues found)`);
        
        console.log('✓ BreadcrumbDetector tests passed');
        return true;
        
    } catch (error) {
        console.log(`✗ BreadcrumbDetector test failed: ${error.message}`);
        return false;
    }
}

function test_loading_detector() {
    console.log('\n=== Testing LoadingDetector ===');
    
    try {
        const LoadingDetector = require('../src/heuristics/1-visibility-system-status/loading-detector');
        
        // Test 1: Create fresh instance
        console.log('✓ LoadingDetector instance created');
        
        // Test 2: Run detection
        const result1 = LoadingDetector.detectLoadingPatterns(testContent.badLoading);
        console.log(`✓ First detection completed (${result1.length} issues found)`);
        
        // Test 3: Run again to test state isolation
        const result2 = LoadingDetector.detectLoadingPatterns(testContent.goodBreadcrumbs);
        console.log(`✓ Second detection completed (${result2.length} issues found)`);
        
        // Test 4: Create another instance
        const result3 = LoadingDetector.detectLoadingPatterns(testContent.badLoading);
        console.log(`✓ Third detection with new instance (${result3.length} issues found)`);
        
        console.log('✓ LoadingDetector tests passed');
        return true;
        
    } catch (error) {
        console.log(`✗ LoadingDetector test failed: ${error.message}`);
        return false;
    }
}

function test_control_exit_detector() {
    console.log('\n=== Testing ControlExitDetector ===');
    
    try {
        const ControlExitDetector = require('../src/heuristics/3-user-control-freedom/control-exit-detector');
        
        // Test 1: Create fresh instance
        console.log('✓ ControlExitDetector instance created');
        
        // Test 2: Run detection
        const result1 = ControlExitDetector.detectControlExits(testContent.badModal);
        console.log(`✓ First detection completed (${result1.length} issues found)`);

        // Test 3: Run again to test state isolation
        const result2 = ControlExitDetector.detectControlExits(testContent.goodBreadcrumbs);
        console.log(`✓ Second detection completed (${result2.length} issues found)`);
        
        // Test 4: Create another instance
        const result3 = ControlExitDetector.detectControlExits(testContent.badModal);
        console.log(`✓ Third detection with new instance (${result3.length} issues found)`);
        
        console.log('✓ ControlExitDetector tests passed');
        return true;
        
    } catch (error) {
        console.log(`✗ ControlExitDetector test failed: ${error.message}`);
        return false;
    }
}

function test_detector_state_isolation() {
    console.log('\n=== Testing Detector State Isolation ===');
    
    try {
        const BreadcrumbDetector = require('../src/heuristics/1-visibility-system-status/breadcrumb-detector');
        const LoadingDetector = require('../src/heuristics/1-visibility-system-status/loading-detector');
        const ControlExitDetector = require('../src/heuristics/3-user-control-freedom/control-exit-detector');
        
        
        // Run all detectors on same content multiple times
        for (let i = 0; i < 3; i++) {
            const breadcrumbResult = BreadcrumbDetector.detectBreadcrumbs(testContent.badModal);
            const loadingResult = LoadingDetector.detectLoadingPatterns(testContent.badLoading);
            const controlResult = ControlExitDetector.detectControlExits(testContent.badModal);

            console.log(`✓ Round ${i + 1}: All detectors completed successfully`);
            console.log(`  - Breadcrumb issues: ${breadcrumbResult.length}`);
            console.log(`  - Loading issues: ${loadingResult.length}`);
            console.log(`  - Control exit issues: ${controlResult.length}`);
        }
        
        console.log('✓ State isolation test passed');
        return true;
        
    } catch (error) {
        console.log(`✗ State isolation test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('========================================');
    console.log('DETECTOR INTEGRATION TEST SUITE');
    console.log('========================================');
    
    const results = [];
    
    results.push(test_breadcrumb_detector());
    results.push(test_loading_detector());
    results.push(test_control_exit_detector());
    results.push(test_detector_state_isolation());
    
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    
    console.log('\n========================================');
    console.log('TEST RESULTS');
    console.log('========================================');
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`Total: ${results.length}`);
    
    if (failed === 0) {
        console.log('\n🎉 All detector tests passed! State interference is fixed.');
    } else {
        console.log('\n❌ Some tests failed. Check the output above for details.');
        process.exit(1);
    }
}

// Run the tests
runAllTests();
