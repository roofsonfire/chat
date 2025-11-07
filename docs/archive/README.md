# Documentation Archive

This folder contains historical documentation that is no longer actively maintained but preserved for context and institutional knowledge.

## 📋 Archive Policy

Documents are moved to this archive when:

1. **Feature is superseded** - A newer implementation replaces the old approach
2. **Migration is complete** - More than 6 months have passed since migration
3. **Historical value only** - Content is outdated but provides important context
4. **Decision reference** - Preserved to understand why choices were made

## 🔍 How to Use This Archive

- **Looking for current docs?** Check the main [docs/README.md](../README.md) navigation
- **Researching history?** Browse by date prefix (YYYY-MM format)
- **Understanding decisions?** See related Architecture Decision Records in `docs/adr/`

## 📁 Archive Structure

```
archive/
├── migrations/          # Completed migration guides
├── decisions/          # Historical decision documents
├── retrospectives/     # Project phase summaries
└── superseded/         # Replaced documentation
```

## 🏷️ Archived Documents

| Document                                                                                       | Archived Date | Reason                                        | Current Alternative                                                          |
| ---------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | ---------------------------------------------------------------------------- |
| [migrations/2024-11-gemini-2.0-migration.md](migrations/2024-11-gemini-2.0-migration.md)       | 2025-11-07    | Migration complete (superseded by Gemini 2.5) | [GEMINI-2.5-IMPLEMENTATION.md](../migration/GEMINI-2.5-IMPLEMENTATION.md)    |
| [migrations/2024-11-rate-limiting-migration.md](migrations/2024-11-rate-limiting-migration.md) | 2025-11-07    | Implementation complete                       | [MIDDLEWARE-SECURITY-SUMMARY.md](../features/MIDDLEWARE-SECURITY-SUMMARY.md) |

## 🔄 Review Schedule

Archive contents are reviewed annually to:

- Identify documents that can be permanently removed
- Update links to current alternatives
- Ensure historical context remains accurate

**Last Review:** November 2025  
**Next Review:** November 2026

## ✍️ Contributing to Archive

When archiving a document:

1. Add date prefix: `YYYY-MM-original-name.md`
2. Update this README with entry in the table above
3. Add deprecation notice to original location if it still exists
4. Update `docs/README.md` to remove references to archived doc
5. Link to current alternative in archive metadata

---

**Questions about archived content?**  
Open an issue with label `documentation` or contact the core team.
