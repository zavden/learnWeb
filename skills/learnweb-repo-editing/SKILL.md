---
name: learnweb-repo-editing
description: Guide for editing this LearnWeb repository safely and efficiently. Use this skill when an AI needs to understand where features live, how examples and theory are stored, which files to change for editor/preview/shader/content tasks, and what validations to run before finishing.
---

# LearnWeb Repo Editing

## Overview

Use this skill as the default orientation guide for this repository. It helps an AI route a request to the correct subsystem before editing files.

Read [references/hotspots.md](references/hotspots.md) when you need the file map for a specific task. For how the
app works end to end, read [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md); for scripts, TypeScript usage,
code conventions, testing and extension recipes, read [docs/DEVELOPMENT.md](../../docs/DEVELOPMENT.md).

## Use This Skill When

- the task is inside this repo and the correct edit location is not obvious
- the request touches editor, preview, shaders, theory, gallery, favorites, pending, or markdown parsing
- the task requires changing content under `material/`
- the AI needs to know which validations to run

If the task is narrowly about content creation, prefer the specific skills:

- `skills/learnweb-example-authoring/SKILL.md` — all example formats, frontmatter, virtual files
- `skills/learnweb-theory-authoring/SKILL.md` — theory files and exercise embeds
- `skills/learnweb-shader-authoring/SKILL.md` — shader examples, uniforms, textures

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
   - UI behavior changes usually live in `src/components/`, `src/utils/`, `index.html`, or `src/styles/`
5. Validate at the smallest level that still proves the change:
   - content-only updates: targeted checks or no build if unnecessary
   - parser/runtime/editor changes: `npm test`
   - any app code change: `npm run typecheck` (or `npm run check`: types, lint, formatting, tests)
   - parser/compiler/renderer/runtime changes that must not change output: `npm run snapshot:material`
     (`--out` before, `--compare` after)
   - UI/runtime changes: `npm run build`

## Repository Rules

- `material/` is source content, not generated output.
- `main.md` is theory. `examples/*.md` are runnable examples.
- App code is strict TypeScript (`.ts`). Node runs `server.ts`, the scripts and the tests by stripping types, so only erasable syntax is allowed (no `enum`, no `namespace`), types are imported with `import type`, and imports spell the `.ts` extension. `npm run typecheck` is the only type check.
- Types shared across areas live in `src/types/` (document model, diagnostics, compile contract, runtime protocol, API payloads, material tree, theory pages).
- App code is modularized. `src/utils/markdown.ts` and `src/utils/exampleRenderer.ts` re-export from `markdown/` and `renderer/`; `src/utils/exampleCompiler.ts` dispatches to the compilers in `compiler/`.
- Editor methods are split into mixins in `src/components/editor/` applied to `Editor.prototype`.
- Preview methods are split into mixins in `src/components/preview/` applied to `Preview.prototype`.
- The preview runtime (`src/utils/renderer/runtimeBridgeRuntime.ts`) is serialized with `Function.prototype.toString()` and must stay self-contained (type imports only).
- Vim support is split into `src/editor/vim/`.
- Vim shortcuts are configurable through `vim-shortcuts.yaml`.
- Favorites are stored in `.favorites`, not in example frontmatter.
- Pending items are stored in `.pending` with the same architecture as favorites.
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
