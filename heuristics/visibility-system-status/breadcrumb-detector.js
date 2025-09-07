/**
 * Simple Breadcrumb Pattern Detector
 * 
 * This class analyzes JSX/React code to find breadcrumb navigation patterns.
 * Breadcrumbs help users understand where they are in the application (Nielsen Heuristic #1).
 * 
 * What it does:
 * - Scans through each line of JSX code
 * - Looks for breadcrumb components and patterns
 * - Reports missing breadcrumbs as warnings
 */
class BreadcrumbDetector {
    
    /**
     * Main function to detect breadcrumb patterns in JSX code
     * 
     * @param {string} content - The complete JSX file content as a string
     * @returns {Array} - List of found patterns with details
     */
    detectBreadcrumbs(content) {
        // Array to store all patterns we find
        const foundPatterns = [];
        
        // Split the content into individual lines for easier analysis
        const lines = content.split('\n');
        
        // Go through each line one by one
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            const lineNumber = i + 1; // Line numbers start at 1, not 0
            
            // Check for different breadcrumb patterns
            this.checkForBreadcrumbComponents(currentLine, lineNumber, foundPatterns);
            this.checkForNavigationElements(currentLine, lineNumber, foundPatterns);
            this.checkForMissingBreadcrumbs(currentLine, lineNumber, foundPatterns, lines, i);
        }
        
        return foundPatterns;
    }
    
    /**
     * Look for breadcrumb component names like <Breadcrumb>, <BreadCrumb>, etc.
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForBreadcrumbComponents(line, lineNumber, patterns) {
        // COMPREHENSIVE breadcrumb component detection for React web apps
        
        // 1. Common Breadcrumb component names
        const breadcrumbComponentPattern = /<(Breadcrumb|BreadCrumb|Breadcrumbs|BreadCrumbs|Trail|PathTrail|Navigation|NavTrail|Crumb|Crumbs)\s/;
        
        // 2. Navigation with breadcrumb classes
        const navBreadcrumbPattern = /<nav\s[^>]*className="[^"]*\bbreadcrumb/;
        
        // 3. Ordered/Unordered lists often used for breadcrumbs
        const listBreadcrumbPattern = /<(ol|ul)\s[^>]*className="[^"]*\b(breadcrumb|trail|path|navigation)/;
        
        // 4. Div-based breadcrumbs (common pattern)
        const divBreadcrumbPattern = /<div\s[^>]*className="[^"]*\b(breadcrumb|trail|path-trail|nav-trail)/;
        
        // 5. Aria-labeled breadcrumbs (accessibility pattern)
        const ariaBreadcrumbPattern = /aria-label="[^"]*\bbreadcrumb/i;
        
        const hasBreadcrumbComponent = breadcrumbComponentPattern.test(line) || 
                                     navBreadcrumbPattern.test(line) || 
                                     listBreadcrumbPattern.test(line) ||
                                     divBreadcrumbPattern.test(line) ||
                                     ariaBreadcrumbPattern.test(line);
        
        if (hasBreadcrumbComponent) {
            // We found a breadcrumb component - this is good!
            patterns.push({
                type: 'good-breadcrumb',
                line: lineNumber,
                content: line.trim(),
                message: 'Found breadcrumb component - Excellent for navigation!',
                severity: 'info'
            });
        }
    }
    
    /**
     * Look for navigation elements with breadcrumb-related attributes
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     */
    checkForNavigationElements(line, lineNumber, patterns) {
        // Check for <nav> elements that mention breadcrumbs
        const hasNavBreadcrumb = line.includes('<nav') && 
                               (line.includes('breadcrumb') || line.includes('navigation'));
        
        if (hasNavBreadcrumb) {
            // Found a navigation element for breadcrumbs
            patterns.push({
                type: 'good-navigation',
                line: lineNumber,
                content: line.trim(),
                message: 'Found navigation element for breadcrumbs',
                severity: 'info'
            });
        }
    }
    
    /**
     * Check if page components are missing breadcrumb navigation
     * 
     * @param {string} line - The current line of code
     * @param {number} lineNumber - Which line we're checking
     * @param {Array} patterns - Array to add found patterns to
     * @param {Array} allLines - All lines in the file (to check nearby lines)
     * @param {number} currentIndex - Current position in the file
     */
    checkForMissingBreadcrumbs(line, lineNumber, patterns, allLines, currentIndex) {
        // COMPREHENSIVE pattern matching for React web applications
        
        // 1. React Components (PascalCase) - Most common in React apps
        const reactComponentPattern = /<(Page|Layout|Container|Section|Main|Content|Wrapper|Dashboard|Product|User|Profile|Settings|Header|Sidebar|Panel|App|Home|About|Contact|Blog|Article|Card|Modal|Dialog|Form|Table|List|Grid|View|Screen|Route)\s/;
        
        // 2. Semantic HTML elements that typically contain page content
        const semanticHtmlPattern = /<(main|section|article|aside|header|nav|div)\s[^>]*className="[^"]*\b(page|layout|container|content|main|dashboard|profile|settings|wrapper|app|home|view|screen|component)\b/;
        
        // 3. Common CSS class patterns for page-level elements
        const cssClassPattern = /className="[^"]*\b(app-|page-|main-|content-|layout-|dashboard-|profile-|product-|user-|home-|view-|screen-|component-|section-|container-|wrapper-)/;
        
        // 4. UI Framework Components (Material-UI, Ant Design, Bootstrap, Chakra UI, etc.)
        const uiFrameworkPattern = /<(Container|Box|Grid|Paper|Card|Panel|Layout|Content|Sider|Row|Col|Flex|Stack|VStack|HStack|SimpleGrid)\s/;
        
        // 5. Route/Page components (React Router patterns)
        const routePattern = /<(Route|Switch|Router|Navigate|Link)\s[^>]*\b(component|element|to|path)\b/;
        
        // 6. Common div patterns with page-indicating attributes
        const divPagePattern = /<div\s[^>]*\b(id|className)="[^"]*\b(app|page|main|root|container|layout|content|dashboard|view|screen)\b/;
        
        const isPageComponent = reactComponentPattern.test(line) || 
                               semanticHtmlPattern.test(line) || 
                               cssClassPattern.test(line) ||
                               uiFrameworkPattern.test(line) ||
                               routePattern.test(line) ||
                               divPagePattern.test(line);
        
        if (isPageComponent) {
            // Check if there are breadcrumbs nearby (within 15 lines above or below)
            const hasBreadcrumbsNearby = this.searchForBreadcrumbsNearby(allLines, currentIndex);
            
            if (!hasBreadcrumbsNearby) {
                // Warning: Page component without breadcrumbs
                patterns.push({
                    type: 'missing-breadcrumb',
                    line: lineNumber,
                    content: line.trim(),
                    message: 'Page-level component without breadcrumb navigation - Users might get lost!',
                    severity: 'warning'
                });
            } else {
                // Good: Page component has breadcrumbs nearby
                patterns.push({
                    type: 'good-page-with-breadcrumbs',
                    line: lineNumber,
                    content: line.trim(),
                    message: 'Page component with breadcrumb navigation nearby - Good!',
                    severity: 'info'
                });
            }
        }
    }
    
    /**
     * Search for breadcrumbs in lines near the current position
     * 
     * @param {Array} lines - All lines in the file
     * @param {number} currentIndex - Current line position
     * @returns {boolean} - True if breadcrumbs found nearby, false otherwise
     */
    searchForBreadcrumbsNearby(lines, currentIndex) {
        const searchDistance = 15; // Increased search distance for better detection
        const startIndex = Math.max(0, currentIndex - searchDistance);
        const endIndex = Math.min(lines.length, currentIndex + searchDistance);
        
        // Check each line in the search range
        for (let i = startIndex; i < endIndex; i++) {
            const lineToCheck = lines[i];
            
            // Skip comments and text content to avoid false positives
            if (lineToCheck.trim().startsWith('//') || 
                lineToCheck.trim().startsWith('/*') || 
                lineToCheck.trim().startsWith('*') ||
                lineToCheck.includes('<p>') ||
                lineToCheck.includes('<h') ||
                lineToCheck.includes('<span>')) {
                continue;
            }
            
            // COMPREHENSIVE breadcrumb detection patterns
            
            // 1. Breadcrumb components
            const breadcrumbComponents = /<(Breadcrumb|BreadCrumb|Breadcrumbs|BreadCrumbs|Trail|PathTrail|NavTrail|Crumb|Crumbs)\s/;
            
            // 2. Navigation elements with breadcrumb indicators
            const navElements = /<nav\s[^>]*\b(breadcrumb|trail|path)/;
            
            // 3. Lists commonly used for breadcrumbs
            const listElements = /<(ol|ul)\s[^>]*className="[^"]*\b(breadcrumb|trail|path|navigation|crumb)/;
            
            // 4. Divs with breadcrumb classes
            const divElements = /<div\s[^>]*className="[^"]*\b(breadcrumb|trail|path-trail|nav-trail|crumb)/;
            
            // 5. Aria labels for accessibility
            const ariaElements = /aria-label="[^"]*\b(breadcrumb|trail|path|navigation)/i;
            
            // 6. Common breadcrumb text patterns (with separators)
            const textPatterns = /[>\-\/→←│\|]\s*(Home|Start|Dashboard|Main)\s*[>\-\/→←│\|]/;
            
            // 7. Link chains that indicate breadcrumbs
            const linkChains = /<a[^>]*>[^<]+<\/a>\s*[>\-\/→]\s*<a[^>]*>/;
            
            const hasBreadcrumbPattern = breadcrumbComponents.test(lineToCheck) || 
                                       navElements.test(lineToCheck) ||
                                       listElements.test(lineToCheck) ||
                                       divElements.test(lineToCheck) ||
                                       ariaElements.test(lineToCheck) ||
                                       textPatterns.test(lineToCheck) ||
                                       linkChains.test(lineToCheck);
            
            if (hasBreadcrumbPattern) {
                return true; // Found actual breadcrumb components nearby
            }
        }
        
        return false; // No breadcrumb components found nearby
    }
    
    /**
     * Create a simple report summarizing what was found
     * 
     * @param {Array} patterns - All patterns found during analysis
     * @returns {Object} - Summary report with counts and details
     */
    generateReport(patterns) {
        // Count different types of findings
        const goodBreadcrumbs = patterns.filter(p => p.type === 'good-breadcrumb' || p.type === 'good-navigation').length;
        const missingBreadcrumbs = patterns.filter(p => p.type === 'missing-breadcrumb').length;
        
        // Return a simple summary
        return {
            totalFindings: patterns.length,
            goodBreadcrumbs: goodBreadcrumbs,
            missingBreadcrumbs: missingBreadcrumbs,
            allPatterns: patterns
        };
    }
}

// Make this class available to other files
module.exports = BreadcrumbDetector;