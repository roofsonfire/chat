# Documentation Contribution Guide

Use this guide when adding, updating, or relocating documentation in the `docs/` tree. Following these conventions keeps the index tidy and ensures the README and Copilot instructions stay in sync.

## 1. Decide Where Content Lives

- `README.md` (root) covers the elevator pitch, quick start, and links into the documentation index. Do not duplicate detailed instructions there.
- `docs/README.md` is the canonical table of contents. Every new top-level document must be referenced either directly in that index or through a clearly linked subdirectory README.
- `.github/copilot-instructions.md` references sections from the index; keep it high-level and avoid copying entire guides into that file.

## 2. Naming & Formatting

- File names use upper-case with hyphens (`MY-DOC.md`) for top-level topics and match existing patterns inside subfolders.
- Stick to ASCII characters in file names and headings.
- Start each document with an H1 that matches the file name in title case.
- Include a short "Audience" or "When to use" note near the top if the doc is task-specific.

## 3. Linking Rules

- When you add a new document, update `docs/README.md` in the appropriate section. Include a brief description (one clause) and keep bullets alphabetised when practical.
- Cross-reference related guides using relative links (e.g. `../README.md`, `features/MY-FEATURE.md`).
- If you remove or rename a document, search for inbound links in the repo (`rg "old-name"`) and update them, including any references inside Copilot instructions.

## 4. Versioning & History

- Major migrations or architectural shifts belong under `docs/migration/` with a date or version in the filename.
- Historical summaries and retrospectives belong under `docs/archive/`.
- Keep active how-to content separate from archival narratives to avoid stale guidance.

## 5. Style Guidelines

- Be concise, prefer imperative language for instructions, and highlight commands with fenced code blocks and language hints (`bash`, `ts`, `json`).
- Use unordered lists for short procedures; number the steps only when order matters.
- Add context for why a step exists when it is non-obvious. Avoid line-by-line explanations that restate the code.

## 6. Review Checklist

Before opening a PR that touches docs:

1. `docs/README.md` references any new or moved files.
2. The root `README.md` still points to the correct deep doc for detailed guidance.
3. `.github/copilot-instructions.md` does not contradict or duplicate the new content.
4. All links render correctly in GitHub preview.
5. Optional: run `npm run lint` if you touched MDX/MD files that might include code blocks with linted examples.

Keeping to this workflow helps future contributors (human and AI) find accurate information quickly. Thank you for investing in clear documentation.
