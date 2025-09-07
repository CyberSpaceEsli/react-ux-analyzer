# Loading Detector (`loading-detector.js`)

This detector analyzes React/JSX code to identify loading states and feedback mechanisms, ensuring users always know when the system is processing something (Nielsen Heuristic #1: Visibility of System Status).

## What the Detector Does

The `LoadingDetector` class scans through JSX code and identifies:
- ✅ **Good practices**: Proper loading indicators and state management
- ⚠️ **Warnings**: Missing loading feedback during async operations
- 💡 **Suggestions**: Potential improvements for loading UX

## How It Works

### Main Function: `detectLoadingPatterns(content)`
```javascript
const detector = new LoadingDetector();
const patterns = detector.detectLoadingPatterns(jsxContent);
const summary = detector.generateSummary(patterns);
```

The detector uses these methods:

1. **`checkForLoadingComponents()`** - Finds loading UI components
2. **`checkForLoadingStates()`** - Detects loading state management
3. **`checkForProgressIndicators()`** - Identifies progress bars and indicators
4. **`checkForSkeletonScreens()`** - Finds skeleton screens and placeholders
5. **`checkForMissingLoadingFeedback()`** - Warns about missing loading feedback

## Detection Patterns

### ✅ Good Loading Practices Detected

**1. Loading Components:**
```jsx
<Spinner />
<Loader />
<Loading />
<CircularProgress />
<LinearProgress />
<ProgressBar />
<LoadingSpinner />
<ActivityIndicator />
```

**2. Loading State Management:**
```jsx
const [loading, setLoading] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [fetching, setFetching] = useState(false);
const [submitting, setSubmitting] = useState(false);
```

**3. Conditional Loading Rendering:**
```jsx
{isLoading ? <Spinner /> : <Content />}
{loading && <LoadingIndicator />}
```

**4. Progress Indicators:**
```jsx
<ProgressBar value={progress} max={100} />
<progress value={uploadProgress} max="100" />
<LinearProgress variant="determinate" value={percentage} />
```

**5. Skeleton Screens:**
```jsx
<Skeleton height={20} />
<div className="skeleton shimmer" />
<div className="loading-placeholder pulse" />
<ContentLoader />
```

### ⚠️ Loading Problems Detected

**1. Async Operations Without Loading Feedback:**
```jsx
// BAD: No loading indication
useEffect(() => {
  fetch('/api/data').then(setData); // Users don't know it's loading!
}, []);

// GOOD: With loading state
useEffect(() => {
  setLoading(true);
  fetch('/api/data')
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

**2. Form Submissions Without Loading States:**
```jsx
// BAD: No submission feedback
const handleSubmit = async (data) => {
  await submitForm(data); // Users might click multiple times!
};

// GOOD: With loading state
const handleSubmit = async (data) => {
  setSubmitting(true);
  try {
    await submitForm(data);
  } finally {
    setSubmitting(false);
  }
};
```

**3. Missing Disabled States:**
```jsx
// BAD: Button stays clickable during submission
<button type="submit">Submit</button>

// GOOD: Button disabled during submission  
<button type="submit" disabled={submitting}>
  {submitting ? 'Submitting...' : 'Submit'}
</button>
```

## Example Usage

```javascript
const LoadingDetector = require('./loading-detector');
const detector = new LoadingDetector();

const jsxCode = `
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <Spinner />;
  }

  return <div>{user?.name}</div>;
}
`;

const results = detector.detectLoadingPatterns(jsxCode);
const summary = detector.generateSummary(results);

console.log(`Found ${summary.goodPractices} good practices`);
console.log(`Found ${summary.warnings} warnings`);
```

## Pattern Recognition Details

### Loading Component Patterns
- **Component names**: `/Loading|Loader|Spinner|Progress|ActivityIndicator/`
- **CSS classes**: `/loading|spinner|loader|progress|skeleton|shimmer/`
- **Loading icons**: `/loading|spinner|refresh|sync|clock|hourglass/`

### State Management Patterns  
- **useState patterns**: `/useState.*loading|isLoading|fetching|submitting/`
- **Loading props**: `/loading|isLoading|pending|fetching\s*[:=]/`

### Missing Feedback Detection
- **Async operations**: `/fetch\(|axios\.|api\.|getData|fetchData/`
- **Form submissions**: `/onSubmit|handleSubmit|submitForm/`
- **useEffect async**: Checks for async operations in useEffect without loading states

## Why Loading Feedback Matters

1. **User Confidence**: Users know the system is working, not broken
2. **Perceived Performance**: Apps feel faster with immediate feedback
3. **Error Prevention**: Users won't click multiple times if they see loading state
4. **Accessibility**: Screen readers can announce loading states to visually impaired users
5. **Trust Building**: Transparent feedback builds user confidence in the application

## Nielsen Heuristic Compliance

**Heuristic #1: Visibility of System Status**
> "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time."

Loading indicators provide essential feedback about:
- System processing status
- Expected wait times (with progress bars)
- Current operation state
- Whether user input was received
