/**
 * React UX Analyzer - Heuristics Module
 * 
 * This module exports all UX heuristic detectors for the React UX Analyzer extension.
 * Currently implements Nielsen's Heuristic #1: Visibility of System Status
 */

const { detectBreadcrumbs } = require('./1-visibility-system-status/breadcrumb-detector');
const { detectLoadingPatterns } = require('./1-visibility-system-status/loading-detector');
const { detectControlExits } = require('./3-user-control-freedom/control-exit-detector');
const { detectPageConsistency } = require('./4-consistency-and-standards/page-consistency-detector');
const { detectShortcuts } = require('./7-flexibility-and-efficiency-of-use/shortcut-detector');

const FeedbackHandler = require('./feedback-handler');

module.exports = {
  // Function-based detector
  detectBreadcrumbs,
  detectLoadingPatterns,
  detectControlExits,
  detectPageConsistency,
  detectShortcuts,
  
  // Class-based handler
  FeedbackHandler
};
