# Code Cleanup Plan - Remove Dead Code

This document outlines a systematic approach to remove unused code and assets from the chat application.

## Overview

Based on analysis of the codebase, we identified several areas of dead code that can be safely removed:

1. **Unused Feature Flag System** (~400 lines)
2. **Storybook Demo Components** (~200 lines)
3. **Unused Public Assets** (5 SVG files)
4. **Redundant Stream Utilities** (~50 lines)
5. **Unused Constants/Exports** (~20 lines)
6. **Unused Performance Helpers** (~60 lines)
7. **Runtime-unused Password Helper** (~10 lines)

**Total estimated reduction: ~740 lines of code + 5 asset files**

## Phase 1: Low-Risk Removals (Start Here)

### 1.1 Remove Unused Public Assets

- **Files to delete:**
  - `public/file.svg`
  - `public/globe.svg`
  - `public/next.svg`
  - `public/vercel.svg`
  - `public/window.svg`
- **Risk:** None - these are default Next.js template assets
- **Validation:** Search codebase to confirm no references

### 1.2 Remove Storybook Demo Components

- **Directory to delete:** `src/stories/`
- **Files affected:**
  - `src/stories/Button.tsx`
  - `src/stories/Header.tsx`
  - `src/stories/Page.tsx`
  - `src/stories/*.css`
  - `src/stories/*.stories.ts`
- **Risk:** None - these are Storybook template examples
- **Validation:** Confirm Storybook still works with real components

### 1.3 Clean Up Unused Exports

- **File:** `src/lib/constants/vertex-ai-models.ts`
- **Remove exports:**
  - `VERTEX_AI_MODEL_MAPPING`
  - `AVAILABLE_MODELS`
- **Risk:** Low - confirmed no imports
- **Validation:** Run `npm run lint` and `npm run build`

## Phase 2: Medium-Risk Removals

### 2.1 Remove Unused Stream Utility Function

- **File:** `src/lib/streaming/stream-utils.ts`
- **Action:** Remove `toReadableStream` function (keep types)
- **Reason:** Logic is duplicated in `ChatService.streamToReadable`
- **Risk:** Medium - ensure no indirect usage
- **Validation:** Run tests, check streaming still works

### 2.2 Remove Unused Performance Helpers

- **File:** `src/lib/performance.ts`
- **Remove functions:**
  - `performanceMark`
  - `performanceMeasure`
  - `trackEvent`
- **Keep:** `initPerformanceMonitoring` (used in PerformanceMonitor)
- **Risk:** Medium - these are public APIs
- **Validation:** Search for any dynamic/string-based calls

### 2.3 Remove Runtime-Unused Password Helper

- **File:** `src/lib/auth/password.ts`
- **Action:** Remove `hashPassword` function
- **Keep:** `verifyPassword` (used in authentication)
- **Risk:** Medium - used in tests and CLI script
- **Note:** Consider keeping if useful for local development

## Phase 3: High-Risk Removal (Feature Flag System)

### 3.1 Remove Feature Flag Implementation

- **Directories to delete:**
  - `src/lib/features/`
  - `src/lib/hooks/use-feature.ts`
- **Files affected:**
  - `src/lib/features/index.ts`
  - `src/lib/features/flags.ts`
  - `src/lib/features/server.ts`
  - `src/lib/hooks/use-feature.ts`
- **Tests to remove:**
  - `tests/unit/feature-flags.test.ts`
- **Risk:** High - substantial system, may have future plans
- **Decision point:** Confirm feature flags aren't on roadmap

### 3.2 Update Documentation

- **Files to update:**
  - Remove feature flag sections from `docs/features/FEATURE-FLAGS.md`
  - Update `README.md` if it mentions feature flags
  - Remove from `.github/copilot-instructions.md`

## Execution Steps

### Prerequisites

```bash
# Create backup branch
git checkout -b cleanup/remove-dead-code

# Ensure clean working directory
git status
```

### Step-by-Step Execution

#### Phase 1 Commands

```bash
# Remove unused public assets
rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg

# Remove Storybook demo components
rm -rf src/stories/

# Validate Phase 1
npm run lint
npm run build
npm run test
```

#### Phase 2 Commands

```bash
# Manual edits required for:
# - src/lib/constants/vertex-ai-models.ts (remove unused exports)
# - src/lib/streaming/stream-utils.ts (remove toReadableStream function)
# - src/lib/performance.ts (remove unused functions)
# - src/lib/auth/password.ts (remove hashPassword if desired)

# Validate Phase 2
npm run lint
npm run build
npm run test
npm run test:e2e
```

#### Phase 3 Commands (Optional)

```bash
# Remove feature flag system
rm -rf src/lib/features/
rm src/lib/hooks/use-feature.ts
rm tests/unit/feature-flags.test.ts

# Update package.json scripts if needed
# Manual doc updates required

# Validate Phase 3
npm run lint
npm run build
npm run test
```

### Validation Checklist

After each phase:

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npx vitest run` passes
- [ ] `npm run test:e2e` passes (Phase 2+)
- [ ] Application starts and works correctly
- [ ] Chat functionality works (send messages, image upload)
- [ ] Authentication works
- [ ] Storybook still works (after Phase 1)

### Rollback Plan

If issues are discovered:

```bash
# Rollback to previous commit
git reset --hard HEAD~1

# Or rollback entire cleanup
git checkout main
git branch -D cleanup/remove-dead-code
```

## Benefits After Cleanup

1. **Reduced bundle size** - Less code to bundle and ship
2. **Faster builds** - Fewer files to process
3. **Reduced complexity** - Less code to maintain
4. **Cleaner codebase** - Easier to navigate and understand
5. **Faster tests** - Fewer test files to run

## Recommendations

1. **Start with Phase 1** - Low risk, immediate benefits
2. **Consider keeping Phase 2 items** if they provide development value
3. **Skip Phase 3** if feature flags are planned for future use
4. **Run full test suite** after each phase
5. **Deploy to staging** before merging to main

## Quick Start

**Recommended approach:**

```bash
# 1. Validate everything is ready
./scripts/validate-cleanup.sh

# 2. Run interactive cleanup
./scripts/cleanup.sh

# 3. Test the results
npx vitest run && npm run test:e2e
```

**Or run individual phases:**

```bash
./scripts/cleanup-phase1.sh  # Safe: assets only
./scripts/cleanup-phase2.sh  # Medium: code cleanup
./scripts/cleanup-phase3.sh  # Risky: feature flags
```

## Next Steps After Cleanup

1. Review remaining `TODO` comments in codebase
2. Consider consolidating similar utility functions
3. Review and update documentation
4. Consider setting up automated dead code detection
