---
name: learnweb-example-authoring
description: Create or update LearnWeb example Markdown files under material/**/examples/*.md. Use this skill when the task is to add, edit, review, or backfill a runnable example, including editorial metadata such as example_description, example_tags, example_rating, and example_importance.
---

# LearnWeb Example Authoring

## Overview

Use this skill for example files, not for `main.md` theory files and not for core app code. It is for content work inside `material/**/examples/*.md`.

## Use This Skill When

- adding a new example to a topic
- rewriting an example to be clearer or smaller
- fixing a broken example without changing app internals
- backfilling editorial metadata
- checking that a specific example still parses or compiles

Use `learnweb-shader-authoring` instead for shader-specific authoring. Use `learnweb-theory-authoring` for `main.md`.

## Workflow

1. Locate the target topic and example file under `material/`.
2. Read one or two nearby examples from the same topic to preserve local style.
3. Keep the example in one of the supported formats already used by the repo:
   - legacy blocks like `HTML`, `CSS`, `JavaScript`
   - React single-file
   - Vue single-file
   - multi-file virtual documents with `@file`, `@lang`, `@role`
4. If the example is intended for discovery in Gallery or Favorites, add editorial metadata when useful:
   - `example_description`
   - `example_tags`
   - `example_rating`
   - `example_importance`
5. Prefer examples that teach one idea clearly. Split concepts across multiple examples instead of overloading one file.
6. If you change runnable code, validate with the existing test/build flow when practical.

## Authoring Rules

- Keep examples small enough to scan quickly.
- Match the topic’s teaching intent before adding extra features.
- Preserve the repo’s current markdown format instead of inventing a new one.
- For multi-file examples, keep `entry` correct and use semantically correct roles such as `entry`, `app`, `component`, `hook`, `style`, or `util`.
- Do not add fake support. If the compiler/runtime does not support a pattern, teach the supported version instead.

## Editorial Metadata

When you add metadata, use these rules:

- `example_description`: one short sentence
- `example_tags`: pipe-separated, compact, lowercase when possible
- `example_rating`: integer `1` to `5`
- `example_importance`: `trivial`, `useful`, `important`, or `critical`

Use metadata only when it adds real discovery value. Do not pad every example with noisy tags.

## Validation

Use targeted validation when possible:

- parser/metadata changes: `npm test`
- content-only changes to a small set of examples: open the affected files and, if needed, run the existing test suite
- broad content migrations: prefer checking the exact affected examples plus `npm test`

## Output Expectations

When finishing:

- mention which example files were created or changed
- mention whether editorial metadata was added or updated
- mention what validation was run
