/**
 * Loading State Detector
 * 
 * This class analyzes JSX/React code to find loading states and indicators.
 * Proper loading feedback helps users understand system status (Nielsen Heuristic #1).
 * 
 * What it does:
 * - Scans through JSX code for loading components and patterns
 * - Identifies loading states, spinners, progress bars, and skeleton screens
 * - Reports missing loading feedback as warnings
 * - Detects good practices like loading indicators during async operations
 */
class LoadingDetector {
    
    /**
     * Main function to detect loading patterns in JSX code
     * 
     * @param {string} content - The complete JSX file content as a string
     * @returns {Array} - List of found patterns with details
     */
    detectLoadingPatterns(content) {
        // Array to store all patterns we find
        const foundPatterns = [];
        
        // Split the content into individual lines for easier analysis
        const lines = content.split('\n');
        
        // Go through each line one by one
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            const lineNumber = i + 1; // Line numbers start at 1, not 0
            
            // Check for different loading patterns
            this.checkForLoadingComponents(currentLine, lineNumber, foundPatterns);
            this.checkForLoadingStates(currentLine, lineNumber, foundPatterns);
            this.checkForProgressIndicators(currentLine, lineNumber, foundPatterns);
            this.checkForSkeletonScreens(currentLine, lineNumber, foundPatterns);
            this.checkForMissingLoadingFeedback(currentLine, lineNumber, foundPatterns, lines, i);
        }
        
        return foundPatterns;
    }
    
    /**
     * Look for loading component names like <Spinner>, <Loader>, <Loading>, etc.
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForLoadingComponents(line, lineNumber, patterns) {
        // COMPREHENSIVE loading component detection for React web apps
        
        // 1. Common Loading component names
        const loadingComponentPattern = /<(Loading|Loader|Spinner|SpinLoader|CircularProgress|LinearProgress|ProgressBar|Preloader|LoadingSpinner|LoadingIndicator|ActivityIndicator)\s/;
        
        // 2. Components with loading classes
        const loadingClassPattern = /<[^>]+className="[^"]*\b(loading|spinner|loader|progress|preloader|skeleton|shimmer|placeholder)/;
        
        // 3. Loading icons and symbols
        const loadingIconPattern = /<[^>]+\b(icon|Icon)="[^"]*\b(loading|spinner|refresh|sync|clock|hourglass)/;
        
        // 4. Conditional loading rendering
        const conditionalLoadingPattern = /\{.*\bisLoading\b.*\?.*(<[^>]*loading|<Loading|<Spinner|loading)/;
        
        // 5. Loading text indicators
        const loadingTextPattern = /(Loading\.\.\.|Please wait|Fetching|Processing|Submitting)/;
        
        const hasLoadingComponent = loadingComponentPattern.test(line) || 
                                  loadingClassPattern.test(line) || 
                                  loadingIconPattern.test(line) ||
                                  conditionalLoadingPattern.test(line) ||
                                  loadingTextPattern.test(line);
        
        if (hasLoadingComponent) {
            // We found a loading component - this is good!
            patterns.push({
                type: 'good-loading',
                line: lineNumber,
                content: line.trim(),
                message: 'Found loading indicator - Excellent for user feedback!',
                severity: 'info'
            });
        }
    }
    
    /**
     * Look for loading states in React components (useState, useEffect patterns)
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForLoadingStates(line, lineNumber, patterns) {
        // 1. useState for loading states
        const useStateLoadingPattern = /useState\s*\(\s*false\s*\).*\b(loading|isLoading|fetching|isFetching|submitting|isSubmitting)/;
        
        // 2. Loading state variables
        const loadingStatePattern = /const\s+\[(.*loading.*|.*Loading.*|.*fetching.*|.*Fetching.*|.*submitting.*|.*Submitting.*)\s*,/;
        
        // 3. Loading props
        const loadingPropsPattern = /\b(loading|isLoading|fetching|isFetching|pending|isPending)\s*[:=]/;
        
        const hasLoadingState = useStateLoadingPattern.test(line) || 
                               loadingStatePattern.test(line) ||
                               loadingPropsPattern.test(line);
        
        if (hasLoadingState) {
            patterns.push({
                type: 'good-loading-state',
                line: lineNumber,
                content: line.trim(),
                message: 'Found loading state management - Good practice!',
                severity: 'info'
            });
        }
    }
    
    /**
     * Look for progress indicators like progress bars and percentage displays
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForProgressIndicators(line, lineNumber, patterns) {
        // 1. Progress bar components
        const progressBarPattern = /<(ProgressBar|Progress|LinearProgress|CircularProgress)\s/;
        
        // 2. Progress attributes
        const progressAttributePattern = /\b(progress|percentage|value|max|min)=\{/;
        
        // 3. Progress classes
        const progressClassPattern = /className="[^"]*\b(progress|percentage|bar|meter)/;
        
        // 4. Progress elements
        const progressElementPattern = /<(progress|meter)\s/;
        
        const hasProgressIndicator = progressBarPattern.test(line) || 
                                   progressAttributePattern.test(line) ||
                                   progressClassPattern.test(line) ||
                                   progressElementPattern.test(line);
        
        if (hasProgressIndicator) {
            patterns.push({
                type: 'excellent-progress',
                line: lineNumber,
                content: line.trim(),
                message: 'Found progress indicator - Excellent user feedback!',
                severity: 'info'
            });
        }
    }
    
    /**
     * Look for skeleton screens and placeholder content
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForSkeletonScreens(line, lineNumber, patterns) {
        // 1. Skeleton components
        const skeletonPattern = /<(Skeleton|SkeletonLoader|Placeholder|ContentLoader)\s/;
        
        // 2. Skeleton classes
        const skeletonClassPattern = /className="[^"]*\b(skeleton|shimmer|placeholder|ghost|loading-placeholder)/;
        
        // 3. Pulse or animation classes (common for loading)
        const pulsePattern = /className="[^"]*\b(pulse|animate-pulse|bounce|fade|blink)/;
        
        const hasSkeletonScreen = skeletonPattern.test(line) || 
                                 skeletonClassPattern.test(line) ||
                                 pulsePattern.test(line);
        
        if (hasSkeletonScreen) {
            patterns.push({
                type: 'excellent-skeleton',
                line: lineNumber,
                content: line.trim(),
                message: 'Found skeleton/placeholder screen - Modern loading UX!',
                severity: 'info'
            });
        }
    }
    
    /**
     * Check for missing loading feedback in async operations
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     * @param {Array} lines - All lines in the file
     * @param {number} currentIndex - Current line index
     */
    checkForMissingLoadingFeedback(line, lineNumber, patterns, lines, currentIndex) {
        // Look for async operations without loading feedback
        
        // 1. Fetch/API calls without loading states
        const fetchPattern = /\b(fetch\s*\(|axios\.|api\.|getData|fetchData|loadData|submitForm)/;
        const hasAsyncOperation = fetchPattern.test(line);
        
        if (hasAsyncOperation) {
            // Check surrounding lines for loading indicators
            const contextLines = this.getContextLines(lines, currentIndex, 5);
            const hasLoadingInContext = contextLines.some(contextLine => 
                /\b(loading|isLoading|Loading|Spinner|spinner|loader|Loader)/.test(contextLine)
            );
            
            if (!hasLoadingInContext) {
                patterns.push({
                    type: 'missing-loading',
                    line: lineNumber,
                    content: line.trim(),
                    message: 'Async operation without loading feedback - Users need to know system status!',
                    severity: 'warning'
                });
            }
        }
        
        // 2. Form submissions without loading states
        const formSubmitPattern = /\bonSubmit\s*=|handleSubmit|submitForm/;
        const hasFormSubmit = formSubmitPattern.test(line);
        
        if (hasFormSubmit) {
            const contextLines = this.getContextLines(lines, currentIndex, 3);
            const hasSubmittingState = contextLines.some(contextLine => 
                /\b(submitting|isSubmitting|disabled|loading)/.test(contextLine)
            );
            
            if (!hasSubmittingState) {
                patterns.push({
                    type: 'missing-submit-feedback',
                    line: lineNumber,
                    content: line.trim(),
                    message: 'Form submission without loading/disabled state - Add user feedback!',
                    severity: 'warning'
                });
            }
        }
        
        // 3. useEffect with async operations
        const useEffectAsyncPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{.*\b(fetch|axios|api)/;
        const hasUseEffectAsync = useEffectAsyncPattern.test(line) || 
                                 (line.includes('useEffect') && lines[currentIndex + 1] && 
                                  /\b(fetch|axios|api)/.test(lines[currentIndex + 1]));
        
        if (hasUseEffectAsync) {
            const contextLines = this.getContextLines(lines, currentIndex, 7);
            const hasLoadingState = contextLines.some(contextLine => 
                /useState.*loading|setLoading|isLoading/.test(contextLine)
            );
            
            if (!hasLoadingState) {
                patterns.push({
                    type: 'missing-effect-loading',
                    line: lineNumber,
                    content: line.trim(),
                    message: 'useEffect with async operation missing loading state - Consider adding loading feedback!',
                    severity: 'suggestion'
                });
            }
        }
    }
    
    /**
     * Get context lines around a specific line for analysis
     * 
     * @param {Array} lines - All lines in the file
     * @param {number} currentIndex - Current line index
     * @param {number} range - Number of lines before and after to include
     * @returns {Array} - Context lines
     */
    getContextLines(lines, currentIndex, range) {
        const start = Math.max(0, currentIndex - range);
        const end = Math.min(lines.length, currentIndex + range + 1);
        return lines.slice(start, end);
    }
    
    /**
     * Generate a summary report of loading patterns found
     * 
     * @param {Array} patterns - All detected patterns
     * @returns {Object} - Summary report
     */
    generateSummary(patterns) {
        const summary = {
            totalPatterns: patterns.length,
            goodPractices: patterns.filter(p => p.severity === 'info').length,
            warnings: patterns.filter(p => p.severity === 'warning').length,
            suggestions: patterns.filter(p => p.severity === 'suggestion').length,
            types: {}
        };
        
        patterns.forEach(pattern => {
            summary.types[pattern.type] = (summary.types[pattern.type] || 0) + 1;
        });
        
        return summary;
    }
}

module.exports = LoadingDetector;
