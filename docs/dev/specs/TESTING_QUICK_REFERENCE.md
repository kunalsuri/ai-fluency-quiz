# Testing Quick Reference Guide

## File Location
`/docs/dev/specs/TEST_COVERAGE_SPECIFICATION.md`

## At a Glance

| Item | Details |
|------|---------|
| Current Coverage | 0% (no tests) |
| Target Coverage | 90% |
| Total Effort | 20-30 hours |
| Number of Gaps | 12 critical areas |
| Recommended Framework | Vitest + jsdom |

## The 12 Critical Gaps

### HIGH Priority (Do First)
1. **Data Validation** - Validate questions.json structure
2. **Scoring & Tier System** - Test getTier() with 6 boundary values
3. **State Management** - Test startQuiz/selectAnswer/resetQuiz
4. **Error Handling** - Network failures, malformed JSON

### MEDIUM Priority
5. **Question Filtering** - Test all/beginner/advanced/edge cases
6. **View Management** - Test showView() visibility
7. **Gauge Rendering** - Test SVG offset calculations
8. **Security (XSS)** - Test escapeHtml() function
9. **Progress UI** - Test progress bar, counters, badges

### LOW Priority
10. **Score Animation** - Test timing/increment logic
11. **Event Listeners** - Test button clicks
12. **Quiz Flow** - End-to-end integration tests

## Quick Wins (Start Here)

**Time**: 5-8 hours  
**Impact**: Catches 70% of bugs

1. getTier() - 5 boundary tests → 30 min
2. filterQuestions() - 4 scenarios → 30 min
3. Score calculation - 2 tests → 1 hour
4. escapeHtml() - 5 edge cases → 1 hour
5. State initialization - 3 tests → 2 hours
6. Gauge calculations - 3 tests → 1.5 hours

## Critical Test Values

### Scoring Boundaries
```
0%   → AI Novice
49%  → AI Novice
50%  → Prompt Engineer
89%  → Prompt Engineer
90%  → AI-Native Architect
100% → AI-Native Architect
```

### Question Filtering
```
'all'          → 12 questions (ids 1-12)
'beginner'     → 4 questions (ids 1-4)
'intermediate' → 4 questions (ids 5-8)
'advanced'     → 4 questions (ids 9-12)
```

### Gauge Offsets
```
0%   → 125.66 (empty)
50%  → 62.83 (half)
100% → 0 (full)
Formula: 125.66 × (1 - score%)
```

## Implementation Phases

### Phase 1: Foundation (2-3 days)
- Setup Vitest + jsdom
- Extract JS from HTML
- Test pure functions

### Phase 2: State & Integration (2-3 days)
- startQuiz() tests
- selectAnswer() tests
- resetQuiz() tests

### Phase 3: DOM & Interactions (2-3 days)
- View management
- Gauge rendering
- Progress updates

### Phase 4: Edge Cases (2-3 days)
- Error scenarios
- Boundary tests
- Animation timing

### Phase 5: CI/CD (1-2 days)
- GitHub Actions setup
- Coverage enforcement
- Documentation

## Key Files

```
/docs/dev/specs/
├── TEST_COVERAGE_SPECIFICATION.md  (Full spec)
└── TESTING_QUICK_REFERENCE.md      (This file)

/index.html (432 lines - all logic)
/questions.json (193 lines - test data)
```

## Testing Tools Required

```bash
npm install --save-dev vitest jsdom @vitest/ui
```

## Commands to Add

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Success Criteria

- [ ] Phase 1 complete (pure functions at 100%)
- [ ] Phase 2 complete (state management at 95%)
- [ ] Phase 3 complete (DOM interactions at 90%)
- [ ] Phase 4 complete (edge cases at 85%)
- [ ] Phase 5 complete (CI/CD integrated)
- [ ] Overall coverage ≥ 90%

## Common Pitfalls to Avoid

1. **Don't test implementation details** - Test behavior, not internals
2. **Don't mock too early** - Real values first, mocks only when needed
3. **Don't skip edge cases** - Boundaries and errors catch real bugs
4. **Don't forget async/timing** - Animation and fetch need special attention
5. **Don't leave tests brittle** - Avoid tight coupling to implementation

## Resources

- Vitest Docs: https://vitest.dev/
- Testing Best Practices: https://testing-library.com/docs/guiding-principles/
- Jest Migration: https://vitest.dev/guide/migration.html (if coming from Jest)

## Session Setup Checklist

- [ ] Read TEST_COVERAGE_SPECIFICATION.md fully
- [ ] Create package.json with test scripts
- [ ] Install Vitest + jsdom
- [ ] Extract index.html JavaScript to modules
- [ ] Create test directory structure
- [ ] Write Phase 1 tests first

---

**Last Updated**: 2026-07-04  
**Status**: Ready for implementation tomorrow
