/**
 * React UX Analyzer - Heuristics Module
 * 
 * This module exports all UX heuristic detectors for the React UX Analyzer extension.
 * Currently implements Nielsen's Heuristic #1: Visibility of System Status
 */

const BreadcrumbDetector = require('./visibility-system-status/breadcrumb-detector');
const LoadingDetector = require('./visibility-system-status/loading-detector');
const FeedbackHandler = require('./feedback-handler');

module.exports = {
    BreadcrumbDetector,
    LoadingDetector,
    FeedbackHandler
};
