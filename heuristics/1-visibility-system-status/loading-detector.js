const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

/**
 * Loading State Detector for React UX Analysis
 * 
 * Detects missing loading feedback in React components (Nielsen Heuristic #1: Visibility of System Status)
 * 
 * Features:
 * - AST-based analysis for comprehensive component scanning
 * - Detects API calls without loading feedback
 * - Finds good loading practices (spinners, progress bars, skeleton screens)
 * - Reports form submissions without loading states
 */
class LoadingDetector {
    
    detectLoadingPatterns(content) {
        const foundPatterns = [];
        
        try {
            // AST Analysis: Component-level detection
            const astPatterns = this.performASTAnalysis(content);
            foundPatterns.push(...astPatterns);
            
            // Line-by-line Analysis: Specific pattern detection
            const linePatterns = this.performLineAnalysis(content);
            foundPatterns.push(...linePatterns);
            
        } catch (error) {
            console.warn('Loading detector analysis failed:', error.message);
        }
        
        return foundPatterns;
    }
    
    // ===============================================
    // AST ANALYSIS - Component Level Detection
    // ===============================================
    
    performASTAnalysis(content) {
        const patterns = [];
        const components = new Map();
        
        const ast = parse(content, {
            sourceType: "module",
            plugins: ["jsx", "typescript"]
        });
        
        // Step 1: Find all React components/functions
        this.findComponents(ast, components);
        
        // Step 2: Analyze each component for API calls and loading patterns
        this.analyzeComponentPatterns(ast, components);
        
        // Step 3: Generate warnings for components with missing loading feedback
        this.generateComponentWarnings(components, patterns);
        
        return patterns;
    }
    
    findComponents(ast, components) {
        traverse(ast, {
            FunctionDeclaration(path) {
                const name = path.node.id ? path.node.id.name : 'anonymous';
                const line = path.node.loc ? path.node.loc.start.line : 1;
                
                components.set(name, {
                    line: line,
                    name: name,
                    hasAPICall: false,
                    hasLoadingState: false,
                    hasLoadingUI: false
                });
            }
        });
    }
    
    analyzeComponentPatterns(ast, components) {
        traverse(ast, {
            // Detect API calls (fetch, axios, custom API functions)
            CallExpression: (path) => this.detectAPICalls(path, components),
            
            // Detect loading states (useState with loading variables)
            VariableDeclarator: (path) => this.detectLoadingStates(path, components),
            
            // Detect loading UI components (<Spinner>, <Loading>, etc.)
            JSXElement: (path) => this.detectLoadingUI(path, components),
            
            // Detect loading text ("Loading...", "Please wait", etc.)
            JSXText: (path) => this.detectLoadingText(path, components)
        });
    }
    
    detectAPICalls(path, components) {
        const callee = path.node.callee;
        const line = path.node.loc ? path.node.loc.start.line : 1;
        
        const isAPICall = 
            // fetch() calls
            (callee.type === "Identifier" && callee.name === "fetch") ||
            // axios.get(), axios.post(), etc.
            (callee.type === "MemberExpression" && 
             callee.object.type === "Identifier" && 
             callee.object.name === "axios") ||
            // Custom API functions (fetchUser, getData, etc.)
            (callee.type === "Identifier" && 
             (callee.name.includes('fetch') || callee.name.includes('API') || callee.name.includes('api')));
        
        if (isAPICall) {
            this.markComponentFeature(components, line, 'hasAPICall');
        }
    }
    
    detectLoadingStates(path, components) {
        if (!this.isUseStateCall(path)) return;
        
        const variableName = this.getVariableName(path);
        if (variableName && /loading/i.test(variableName)) {
            const line = path.node.loc ? path.node.loc.start.line : 1;
            this.markComponentFeature(components, line, 'hasLoadingState');
        }
    }
    
    detectLoadingUI(path, components) {
        const componentName = path.node.openingElement.name;
        if (componentName.type === "JSXIdentifier") {
            const loadingComponents = [
                "Loader", "Spinner", "Skeleton", "Progress", "Loading", 
                "LoadingIndicator", "CircularProgress", "LinearProgress"
            ];
            
            if (loadingComponents.includes(componentName.name)) {
                const line = path.node.loc ? path.node.loc.start.line : 1;
                this.markComponentFeature(components, line, 'hasLoadingUI');
            }
        }
    }
    
    detectLoadingText(path, components) {
        if (/loading/i.test(path.node.value)) {
            const line = path.node.loc ? path.node.loc.start.line : 1;
            this.markComponentFeature(components, line, 'hasLoadingUI');
        }
    }
    
    // Helper methods for AST analysis
    isUseStateCall(path) {
        return path.node.init &&
               path.node.init.type === "CallExpression" &&
               path.node.init.callee &&
               path.node.init.callee.type === "Identifier" &&
               path.node.init.callee.name === "useState";
    }
    
    getVariableName(path) {
        if (path.node.id.type === "ArrayPattern" &&
            path.node.id.elements &&
            path.node.id.elements[0] &&
            path.node.id.elements[0].type === "Identifier") {
            return path.node.id.elements[0].name;
        }
        return null;
    }
    
    markComponentFeature(components, line, feature) {
        components.forEach((component) => {
            if (line >= component.line) {
                component[feature] = true;
            }
        });
    }
    
    generateComponentWarnings(components, patterns) {
        components.forEach((component) => {
            if (component.hasAPICall && !component.hasLoadingState && !component.hasLoadingUI) {
                patterns.push({
                    type: "loader-missing-ast",
                    line: component.line,
                    content: `function ${component.name}() {`,
                    message: `Component '${component.name}' has API calls but no loading feedback. Consider adding loading states or UI indicators.`,
                    severity: "warning"
                });
            }
        });
    }
    
    // ===============================================
    // LINE ANALYSIS - Specific Pattern Detection
    // ===============================================
    
    performLineAnalysis(content) {
        const patterns = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            
            // Find good loading practices
            this.findGoodLoadingComponents(line, lineNumber, patterns);
            this.findGoodLoadingStates(line, lineNumber, patterns);
            this.findProgressIndicators(line, lineNumber, patterns);
            this.findSkeletonScreens(line, lineNumber, patterns);
            
            // Find missing loading feedback
            this.findMissingFormFeedback(line, lineNumber, patterns, lines, index);
            this.findMissingEffectFeedback(line, lineNumber, patterns, lines, index);
        });
        
        return patterns;
    }
    
    findGoodLoadingComponents(line, lineNumber, patterns) {
        const patterns_to_check = [
            // Loading component names
            /<(Loading|Loader|Spinner|SpinLoader|CircularProgress|LinearProgress|ProgressBar|Preloader|LoadingSpinner|LoadingIndicator|ActivityIndicator)\s/,
            // Loading CSS classes
            /<[^>]+className="[^"]*\b(loading|spinner|loader|progress|preloader|skeleton|shimmer|placeholder)/,
            // Loading icons
            /<[^>]+\b(icon|Icon)="[^"]*\b(loading|spinner|refresh|sync|clock|hourglass)/,
            // Conditional loading
            /\{.*\bisLoading\b.*\?.*(<[^>]*loading|<Loading|<Spinner|loading)/,
            // Loading text
            /(Loading\.\.\.|Please wait|Fetching|Processing|Submitting)/
        ];
        
        if (patterns_to_check.some(pattern => pattern.test(line))) {
            patterns.push({
                type: 'good-loading',
                line: lineNumber,
                content: line.trim(),
                message: 'Found loading indicator - Excellent for user feedback!',
                severity: 'info'
            });
        }
    }
    
    findGoodLoadingStates(line, lineNumber, patterns) {
        const patterns_to_check = [
            /useState\s*\(\s*false\s*\).*\b(loading|isLoading|fetching|isFetching|submitting|isSubmitting)/,
            /const\s+\[(.*loading.*|.*Loading.*|.*fetching.*|.*Fetching.*|.*submitting.*|.*Submitting.*)\s*,/,
            /\b(loading|isLoading|fetching|isFetching|pending|isPending)\s*[:=]/
        ];
        
        if (patterns_to_check.some(pattern => pattern.test(line))) {
            patterns.push({
                type: 'good-loading-state',
                line: lineNumber,
                content: line.trim(),
                message: 'Found loading state management - Good practice!',
                severity: 'info'
            });
        }
    }
    
    findProgressIndicators(line, lineNumber, patterns) {
        const patterns_to_check = [
            /<(ProgressBar|Progress|LinearProgress|CircularProgress)\s/,
            /\b(progress|percentage)=\{/,
            /className="[^"]*\b(progress|percentage|bar|meter)/,
            /<(progress|meter)\s/
        ];
        
        if (patterns_to_check.some(pattern => pattern.test(line))) {
            patterns.push({
                type: 'excellent-progress',
                line: lineNumber,
                content: line.trim(),
                message: 'Found progress indicator - Excellent user feedback!',
                severity: 'info'
            });
        }
    }
    
    findSkeletonScreens(line, lineNumber, patterns) {
        const patterns_to_check = [
            /<(Skeleton|SkeletonLoader|Placeholder|ContentLoader)\s/,
            /className="[^"]*\b(skeleton|shimmer|placeholder|ghost|loading-placeholder)/,
            /className="[^"]*\b(pulse|animate-pulse|bounce|fade|blink)/
        ];
        
        if (patterns_to_check.some(pattern => pattern.test(line))) {
            patterns.push({
                type: 'excellent-skeleton',
                line: lineNumber,
                content: line.trim(),
                message: 'Found skeleton/placeholder screen - Modern loading UX!',
                severity: 'info'
            });
        }
    }
    
    findMissingFormFeedback(line, lineNumber, patterns, lines, currentIndex) {
        if (!/\bonSubmit\s*=|handleSubmit|submitForm/.test(line)) return;
        
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
    
    findMissingEffectFeedback(line, lineNumber, patterns, lines, currentIndex) {
        const useEffectAsyncPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{.*\b(fetch|axios|api)/;
        const hasUseEffectAsync = useEffectAsyncPattern.test(line) || 
                                 (line.includes('useEffect') && lines[currentIndex + 1] && 
                                  /\b(fetch|axios|api)/.test(lines[currentIndex + 1]));
        
        if (!hasUseEffectAsync) return;
        
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
    
    // ===============================================
    // HELPER METHODS
    // ===============================================
    
    getContextLines(lines, currentIndex, range) {
        const start = Math.max(0, currentIndex - range);
        const end = Math.min(lines.length, currentIndex + range + 1);
        return lines.slice(start, end);
    }
    
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
