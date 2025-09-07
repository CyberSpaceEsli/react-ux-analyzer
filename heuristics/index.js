/**
 * Simple Heuristics Module
 * 
 * This file makes it easy to import our detection algorithms.
 * Currently we only have breadcrumb detection, but more will be added later.
 * 
 * Usage example:
 * const { BreadcrumbDetector } = require('./heuristics');
 * const detector = new BreadcrumbDetector();
 */

// Import our breadcrumb detection class
const BreadcrumbDetector = require('./visibility_system_status/breadcrumb-detector');

// Export it so other files can use it
module.exports = {
    BreadcrumbDetector
    
    // Future detectors will be added here:
    // FormValidationDetector,
    // ErrorMessageDetector,
    // etc.
};
