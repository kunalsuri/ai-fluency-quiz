# Test Coverage Specification - AI Fluency Quiz

**Status**: Implemented — see `tests/` (Vitest + jsdom, 149 tests across 6 files)
**Last Updated**: 2026-07-04

---

## Executive Summary

> **Update**: This document originally described a zero-dependency SPA with a single `questions.json`
> and no topic/bank system. The app has since evolved to a `data/manifest.json` + `data/banks/*.json`
> architecture (topics, session length presets, per-question point overrides), but the 12 testing
> gaps identified below remained valid and are now covered by the test suite in `tests/`:
>
> | Gap | Covered by |
> |---|---|
> | 1. Data Validation | `tests/data-integrity.test.js`, `tests/validate-data-script.test.js` |
> | 2. Scoring & Tier System | `tests/pure-functions.test.js` (`getTier` boundaries), `tests/quiz-flow.test.js` |
> | 3. Question Filtering | `tests/pure-functions.test.js` (`buildPool`) |
> | 4. State Management | `tests/quiz-flow.test.js`, `tests/error-handling.test.js` |
> | 5. View Management | `tests/quiz-flow.test.js` (`showView` transitions) |
> | 6. Answer Recording & Evaluation | `tests/quiz-flow.test.js` |
> | 7. Gauge Rendering | `tests/quiz-flow.test.js` (stroke-dashoffset assertions) |
> | 8. Score Animation | `tests/quiz-flow.test.js` (animated score settles to target) |
> | 9. Security: XSS Prevention | `tests/pure-functions.test.js` (`escapeHtml`), `tests/quiz-flow.test.js`, `tests/error-handling.test.js` |
> | 10. Error Handling | `tests/error-handling.test.js` |
> | 11. Event Listeners | `tests/quiz-flow.test.js` (button clicks drive `startQuiz`/`selectAnswer`/`resetQuiz`) |
> | 12. Progress UI Updates | `tests/quiz-flow.test.js` (progress bar, counter, difficulty badge) |
>
> Tests run the real `index.html` in jsdom via `tests/helpers/app-harness.js` rather than extracting
> JS into modules, so production code is untouched. See the README's Testing section for how to run
> `npm test`.

The AI Fluency Quiz is a single-page application. All logic is embedded in `index.html` with vanilla JavaScript. This document specifies 12 critical testing gaps and a 5-phase implementation roadmap (historical context below; see the table above for current coverage).

---

## 1. Data Validation & Initialization

**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 100%

### Gaps
- No validation of `questions.json` structure
- No validation of scoring tiers configuration
- No bounds checking on correctAnswerIndex
- No duplicate ID detection

### Test Cases Required
```javascript
// Missing required fields
{ id: 1, question: "...", options: ["A", "B"] }

// Invalid correctAnswerIndex (out of bounds)
{ id: 1, options: ["A", "B"], correctAnswerIndex: 5 }

// Malformed scoring tiers
[{ minPercent: 90 }, { minPercent: 50 }, { minPercent: 0 }]

// Empty questions array
{ questions: [] }
```

### Success Criteria
- Application rejects invalid JSON on load
- Error message displayed to user
- No silent failures

---

## 2. Scoring & Tier System

**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 100%

### Gaps
- No verification of `getTier(percentScore)` for boundaries
- No testing of score percentage calculation
- No tests for points allocation logic

### Boundary Test Values
| Score | Expected Tier | Test Case |
|-------|---------------|-----------|
| 0% | AI Novice | Lower boundary |
| 49% | AI Novice | Just below threshold |
| 50% | Prompt Engineer | Exact boundary |
| 89% | Prompt Engineer | Just below 90% |
| 90% | AI-Native Architect | Upper boundary |
| 100% | AI-Native Architect | Perfect score |

### Calculation Tests
```javascript
// Score: 8/20 = 40%
userScore = 8
totalPossiblePoints = 20
percentScore = Math.round((8/20) * 100) = 40
tierResult = "AI Novice"

// Correct answer: +5 points
// Incorrect answer: +0 points
```

---

## 3. Question Filtering

**Priority**: MEDIUM  
**Current Coverage**: 0%  
**Target Coverage**: 100%

### Gaps
- No validation of filter results
- No edge case testing (empty results, unknown difficulty)
- No test data consistency

### Test Scenarios
| Filter | Expected Count | Question IDs |
|--------|----------------|-------------|
| 'all' | 12 | 1-12 |
| 'beginner' | 4 | 1-4 |
| 'intermediate' | 4 | 5-8 |
| 'advanced' | 4 | 9-12 |
| 'unknown' | 0 | (empty) |

---

## 4. State Management

**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 95%

### startQuiz(difficulty)
- `currentQuestions` = filtered questions
- `currentIndex` = 0
- `userAnswers` = []
- `totalPossiblePoints` = sum of all question points
- `userScore` = 0

### selectAnswer(selectedIndex)
- Push to `userAnswers` array
- Increment `userScore` if correct
- Increment `currentIndex`
- Call `renderQuestion()`

### resetQuiz()
- Reset all state variables to initial values
- Clear animation intervals
- Reset gauge UI to initial state
- Return to splash view

---

## 5. View Management

**Priority**: MEDIUM  
**Current Coverage**: 0%  
**Target Coverage**: 90%

### showView(viewName) Tests
- Only one view visible at a time
- Correct view shows when called
- Other views hidden

### Test Matrix
| viewName | splash.hidden | quiz.hidden | evaluation.hidden |
|----------|--------------|------------|------------------|
| 'splash' | false | true | true |
| 'quiz' | true | false | true |
| 'evaluation' | true | true | false |

---

## 6. Answer Recording & Evaluation

**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 95%

### userAnswers Array Structure
```javascript
{
  questionId: number,
  selectedIndex: number,
  isCorrect: boolean,
  points: number,
  question: object
}
```

### Validation
- All answers recorded in order
- Correct/incorrect flags accurate
- Points allocated correctly
- Review section populated

---

## 7. Gauge Rendering

**Priority**: MEDIUM  
**Current Coverage**: 0%  
**Target Coverage**: 85%

### SVG Offset Calculation
```
stroke-dasharray = 125.66
stroke-dashoffset = 125.66 × (1 - percentScore / 100)

Examples:
- 0% → 125.66 (empty)
- 50% → 62.83 (half)
- 100% → 0 (full)
```

### Animation
- Duration: 1 second (CSS transition)
- Reset after "Play Again": 125.66

---

## 8. Score Animation

**Priority**: LOW**  
**Current Coverage**: 0%  
**Target Coverage**: 80%

### animateScore(targetPercent)
- Increment: `targetPercent / 50`
- Interval: 20ms
- Duration: ~1000ms (50 intervals)
- Display: rounded integer

---

## 9. Security: XSS Prevention

**Priority**: MEDIUM  
**Current Coverage**: 0%  
**Target Coverage**: 100%

### escapeHtml(text) Tests
```javascript
'&' → '&amp;'
'<' → '&lt;'
'>' → '&gt;'
'"' → '&quot;'
"'" → '&#039;'

Edge cases:
- Multiple consecutive: '<<>>'
- All special chars: '&<>"\'&<>"\'...'
- Mixed with normal text: 'Safe & <unsafe>'
```

---

## 10. Error Handling

**Priority**: HIGH  
**Current Coverage**: 0%  
**Target Coverage**: 85%

### Fetch Failures
- Network error
- HTTP 404/500
- CORS failure
- Timeout

### JSON Failures
- Malformed JSON
- Missing fields
- Invalid types

### Application State
- Empty questions array
- No questions match filter
- Missing scoring tiers
- lingering animation intervals

---

## 11. Event Listeners

**Priority**: LOW  
**Current Coverage**: 0%  
**Target Coverage**: 85%

### Button Events
- `#btn-all` → `startQuiz('all')`
- `#btn-beginner` → `startQuiz('beginner')`
- `#btn-advanced` → `startQuiz('advanced')`
- `#btn-play-again` → `resetQuiz()`

### Option Events
- Option buttons → `selectAnswer(index)` with correct index

---

## 12. Progress UI Updates

**Priority**: MEDIUM  
**Current Coverage**: 0%  
**Target Coverage**: 90%

### Progress Bar
```javascript
width = ((currentIndex + 1) / currentQuestions.length) * 100

Example (4 questions):
- Question 1: 25%
- Question 2: 50%
- Question 3: 75%
- Question 4: 100%
```

### Question Counter
- Format: "Question X / Y"
- Updates after each answer

### Difficulty Badge
- Shows current question difficulty

---

## Implementation Roadmap

### Phase 1: Foundation (2-3 days)
1. Set up Vitest + jsdom
2. Configure test environment
3. Extract JavaScript from HTML
4. Test pure functions: getTier, filterQuestions, escapeHtml

### Phase 2: State & Integration (2-3 days)
1. Test initialization: startQuiz
2. Test updates: selectAnswer
3. Test cleanup: resetQuiz
4. State transition tests

### Phase 3: DOM & Interactions (2-3 days)
1. Test view management: showView
2. Test gauge calculations
3. Test progress bar updates
4. Test event listeners

### Phase 4: Edge Cases (2-3 days)
1. Error handling tests
2. Boundary value tests
3. Animation timing tests
4. Security tests

### Phase 5: CI/CD (1-2 days)
1. Configure test runner in package.json
2. Set up GitHub Actions
3. Enforce minimum coverage
4. Document testing guidelines

---

## Quick Wins (High ROI)

**Effort**: 5-8 hours  
**ROI**: Catches 70% of potential bugs

1. **getTier() function** (30 min)
   - 5 boundary test cases
   - 100% coverage

2. **filterQuestions() function** (30 min)
   - 4 filtering scenarios
   - Edge case: no results

3. **Score calculation** (1 hour)
   - Percentage formula
   - Points allocation

4. **escapeHtml() function** (1 hour)
   - 5 special characters
   - Edge cases

5. **State initialization** (2 hours)
   - startQuiz with all difficulties
   - Verify state variables

6. **Gauge offset calculation** (1.5 hours)
   - 0%, 50%, 100% values
   - SVG rendering

---

## Testing Tools & Dependencies

### Recommended Setup
```json
{
  "devDependencies": {
    "vitest": "^latest",
    "jsdom": "^latest",
    "@vitest/ui": "^latest"
  },
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Success Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Coverage % | 90% | `vitest --coverage` |
| Critical Functions | 100% | Scoring, filtering, validation |
| Error Scenarios | 85% | Fetch failures, malformed data |
| User Flows | 95% | Full quiz completion paths |
| Security | 100% | XSS prevention verified |

---

## File References

- **Main App**: `index.html` (432 lines)
- **Data**: `questions.json` (193 lines)
- **Docs**: `README.md`

---

## Next Steps

1. **Tomorrow**: Create package.json and set up Vitest
2. **Extract**: Move JS from HTML to separate modules
3. **Test**: Write Phase 1 tests (pure functions)
4. **Iterate**: Add Phase 2-5 tests incrementally
5. **Integrate**: Set up CI/CD for test automation

