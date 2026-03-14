---
name: learnweb-repo-editing
description: Guide for editing this LearnWeb repository safely and efficiently. Use this skill when an AI needs to understand where features live, how examples and theory are stored, which files to change for editor/preview/shader/content tasks, and what validations to run before finishing.
---

# LearnWeb Repo Editing

## Overview

Use this skill as the default orientation guide for this repository. It helps an AI route a request to the correct subsystem before editing files.

Read [references/hotspots.md](references/hotspots.md) when you need the file map for a specific task.

## Use This Skill When

- the task is inside this repo and the correct edit location is not obvious
- the request touches editor, preview, shaders, theory, gallery, favorites, or markdown parsing
- the task requires changing content under `material/`
- the AI needs to know which validations to run

If the task is narrowly about example authoring, theory authoring, or shader authoring, prefer the more specific local skills when available.

## Default Workflow

1. Identify the task type:
   - app code
   - content in `material/`
   - tests
   - repo-level configuration
2. Open [references/hotspots.md](references/hotspots.md) and jump only to the relevant section.
3. Inspect the exact files before making assumptions.
4. Keep edits local to the subsystem involved:
   - content requests should usually not change app code
   - UI behavior changes usually live in `src/components/`, `src/utils/`, `index.html`, or `src/style.css`
5. Validate at the smallest level that still proves the change:
   - content-only updates: targeted checks or no build if unnecessary
   - parser/runtime/editor changes: `npm test`
   - UI/runtime changes: `npm run build`

## Repository Rules

- `material/` is source content, not generated output.
- `main.md` is theory. `examples/*.md` are runnable examples.
- Many behaviors depend on shared helpers in `src/utils/markdown.js`, `src/utils/exampleCompiler.js`, and `src/utils/exampleRenderer.js`.
- Vim shortcuts are configurable through `vim-shortcuts.yaml`.
- Favorites are stored in `.favorites`, not in example frontmatter.
- Hidden chapters, Vim default, and clipboard default are persisted in dotfiles at repo root.

## What To Check Before Editing

- Whether the request is content-only or requires runtime changes.
- Whether the feature already has tests in `tests/`.
- Whether the behavior is different for:
  - `Tabs` vs `Panels`
  - web examples vs shaders
  - theory `main.md` vs example `.md`

## Output Expectations

When finishing, report:

- which files changed
- whether the change was app code, content, or both
- what validation ran
- whether manual visual review is still needed
