# Broken Links Fix Plan

**Date:** November 7, 2025
**Status:** In Progress
**Issue:** Documentation Quality Checks workflow failing due to broken links

---

## Summary

The Documentation Quality Checks workflow is failing with **multiple broken links** after recent repository reorganization (security migration and archival). This document tracks all broken links and their fixes.

---

## Categories of Broken Links

### 1. Missing Local Files (Relative Path Issues)

These files exist but the markdown-link-check is looking in the wrong location:

| Source File                                  | Broken Link                                   | Expected Path                                                  | Fix                                |
| -------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| `docs/SECURITY-MIGRATION-NEXT-STEPS.md`      | `docs/adr/006-environment-based-allowlist.md` | `../docs/adr/...` (double `docs/`)                             | Remove `docs/` prefix from link    |
| `docs/SECURITY-MIGRATION-NEXT-STEPS.md`      | `docs/GIT-HISTORY-CLEANUP.md`                 | `../docs/...`                                                  | Remove `docs/` prefix              |
| `docs/SECURITY-MIGRATION-NEXT-STEPS.md`      | `docs/SECURITY-AUDIT.md`                      | `../docs/...`                                                  | Remove `docs/` prefix              |
| `docs/README.md`                             | `migration/GEMINI-2.0-MIGRATION.md`           | Should be `archive/migrations/2024-11-gemini-2.0-migration.md` | Update to archived location        |
| `docs/README.md`                             | `../scripts/README.md`                        | Missing file                                                   | Create or remove reference         |
| `docs/README.md`                             | `../scripts/utils/hash-password.js`           | Actually `.mjs`                                                | Update extension                   |
| `docs/README.md`                             | `../scripts/utils/diagnose-vertex-ai.sh`      | Missing file                                                   | Create or remove reference         |
| `docs/guides/QUICKSTART.md`                  | `../TROUBLESHOOTING.md`                       | Missing file                                                   | Create or remove reference         |
| `docs/DOCUMENTATION-OPTIMIZATION-SUMMARY.md` | `.github/copilot-quick-reference.md`          | `../docs/...` path issue                                       | Fix relative path                  |
| `docs/DOCUMENTATION-OPTIMIZATION-SUMMARY.md` | `.github/patterns/README.md`                  | `../docs/...` path issue                                       | Fix relative path                  |
| `docs/deployment/GITHUB-ACTIONS-STATUS.md`   | `docs/GITHUB-ACTIONS-DEPLOYMENT.md`           | `../docs/...` double path                                      | Remove `docs/` prefix              |
| `docs/deployment/GITHUB-ACTIONS-STATUS.md`   | `docs/CLOUD-RUN-DEPLOYMENT.md`                | `../docs/...` double path                                      | Remove `docs/` prefix              |
| `docs/adr/005-in-memory-rate-limiting.md`    | `../migration/RATE-LIMITING-MIGRATION.md`     | Should be archived                                             | Update to `archive/migrations/...` |
| `docs/adr/README.md`                         | `003-serverless-deployment.md`                | Missing ADR                                                    | Create or remove reference         |
| `docs/adr/README.md`                         | `004-nextauth-with-oauth.md`                  | Missing ADR                                                    | Create or remove reference         |

### 2. Dead External URLs

External links that return 404:

| Source File                                  | Broken Link                                                           | Status | Fix                                             |
| -------------------------------------------- | --------------------------------------------------------------------- | ------ | ----------------------------------------------- |
| Multiple files                               | `https://github.com/roofsonfire/chat/discussions`                     | 404    | Discussions not enabled - remove or update      |
| Multiple files                               | `https://github.com/roofsonfire/chat/settings/branches`               | 404    | Private URL - remove or use docs link           |
| Multiple files                               | `https://github.com/roofsonfire/chat/settings/secrets/actions`        | 404    | Private URL - remove or use docs link           |
| Multiple files                               | `https://github.com/roofsonfire/chat/settings/environments`           | 404    | Private URL - remove or use docs link           |
| `docs/deployment/DEPLOYMENT-CHECKLIST.md`    | `https://chat-staging-xxxxx-uc.a.run.app`                             | 404    | Placeholder URL - replace with actual or remove |
| `docs/deployment/GITHUB-ACTIONS-STATUS.md`   | `https://chat-staging-v2xv6gugxa-uc.a.run.app`                        | 404    | Old staging URL - update or remove              |
| `docs/EDITOR-SETUP.md`                       | `https://nextjs.org/docs/advanced-features/debugging`                 | 404    | Outdated Next.js docs - update URL              |
| `docs/migration/DYNAMIC-MODEL-FETCHING.md`   | `https://cloud.google.com/vertex-ai/docs/model-garden/explore-models` | 404    | Outdated GCP docs - update URL                  |
| `.github/patterns/error-handling-pattern.md` | `https://nodejs.org/en/docs/guides/error-handling/`                   | 404    | Outdated Node.js docs - update URL              |

### 3. Redirect Loop Issues (Google AI Docs)

| Source File                                                      | Broken Link                                                                             | Issue         | Fix                               |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------- | --------------------------------- |
| `docs/features/image-generation/IMAGE-GENERATION-INTEGRATION.md` | `https://ai.google.dev/gemini-api/docs/image-generation`                                | Redirect loop | Verify current Google AI docs URL |
| `docs/features/image-generation/IMAGE-GENERATION-INTEGRATION.md` | `https://ai.google.dev/gemini-api/docs/image-generation#prompting_guide_and_strategies` | Redirect loop | Verify current Google AI docs URL |

### 4. Timeout Issues (Local Network References)

| Source File                                                   | Broken Link                | Issue                   | Fix                                                         |
| ------------------------------------------------------------- | -------------------------- | ----------------------- | ----------------------------------------------------------- |
| `docs/features/image-generation/IMAGE-GENERATION-COMPLETE.md` | `http://192.168.1.17:3000` | Local dev URL - timeout | Add to ignorePatterns in `.github/markdown-link-check.json` |

---

## Fix Strategy

### Phase 1: Update .github/markdown-link-check.json ✅ NEXT

Add more ignore patterns:

```json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    },
    {
      "pattern": "^https://chat.daza.ar"
    },
    {
      "pattern": "^https://staging.chat.daza.ar"
    },
    {
      "pattern": "^http://192\\.168\\."
    },
    {
      "pattern": "^https://github\\.com/roofsonfire/chat/settings/"
    }
  ]
}
```

### Phase 2: Fix Missing Files

1. **Create Missing Script Documentation**

   ```bash
   touch scripts/README.md
   ```

2. **Fix Script References**
   - Update `docs/README.md` to reference `.mjs` instead of `.js` for hash-password
   - Document or create missing `diagnose-vertex-ai.sh`

3. **Create or Remove TROUBLESHOOTING.md**
   - Decision needed: Create comprehensive troubleshooting guide or remove references

### Phase 3: Fix Relative Paths

Update all double `docs/` paths in markdown files:

- `docs/SECURITY-MIGRATION-NEXT-STEPS.md`
- `docs/deployment/GITHUB-ACTIONS-STATUS.md`
- `docs/DOCUMENTATION-OPTIMIZATION-SUMMARY.md`

### Phase 4: Update Archived File References

Update references to migrated files:

- `migration/GEMINI-2.0-MIGRATION.md` → `archive/migrations/2024-11-gemini-2.0-migration.md`
- `migration/RATE-LIMITING-MIGRATION.md` → `archive/migrations/2024-11-rate-limiting-migration.md`

### Phase 5: Fix External URLs

1. Update Next.js debugging docs URL
2. Update Google Cloud Vertex AI docs URL
3. Update Node.js error handling docs URL
4. Remove or replace GitHub Discussions references
5. Update Google AI image generation docs (verify current URLs)

### Phase 6: Create Missing ADRs

Decision needed on:

- `003-serverless-deployment.md`
- `004-nextauth-with-oauth.md`

Either create these ADRs or remove references from `adr/README.md`

---

## Implementation Order

1. ✅ **DONE**: Fix Prettier formatting in `docs-quality.yml`
2. **NEXT**: Update `.github/markdown-link-check.json` with more ignore patterns
3. Fix relative path issues (automated find/replace possible)
4. Update external URLs
5. Create missing documentation files
6. Verify all links pass

---

## Commands to Run

```bash
# After making fixes, test locally:
npx markdown-link-check docs/README.md --config .github/markdown-link-check.json

# Test all docs:
find docs/ -name '*.md' -exec npx markdown-link-check {} --config .github/markdown-link-check.json -q \;

# Commit and test via GitHub Actions
```

---

## Notes

- Many issues stem from recent security migration and archive reorganization
- Some files were moved from `docs/` root to `docs/archive/migrations/`
- GitHub settings URLs (private) should be excluded or replaced with documentation links
- Consider enabling GitHub Discussions or removing all references

---

**Next Action**: Update `.github/markdown-link-check.json` to ignore known problematic patterns, then systematically fix remaining links.
