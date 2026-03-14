---
name: learnweb-theory-authoring
description: Create or update LearnWeb topic theory files at material/**/main.md. Use this skill when the task is to write or refine topic explanations, add exercise embeds with [[exercise:...]], or improve the didactic structure of a topic overview.
---

# LearnWeb Theory Authoring

## Overview

Use this skill for `main.md` theory files. It covers topic explanations, overview pages, inline exercise embeds, and theory text meant to work with the repo’s Theory viewer and theory editor.

## Use This Skill When

- editing a topic `main.md`
- creating a new overview for a section or topic
- improving explanations, progression, or headings
- embedding exercises inline with `[[exercise:filename.md]]`
- making theory and examples line up better pedagogically

Do not use this skill for editing example code unless the request explicitly includes both theory and examples.

## Workflow

1. Open the target `main.md`.
2. Read the local topic structure:
   - nearby examples in `examples/`
   - neighboring `main.md` files in the same section when tone matters
3. Keep the theory didactic and scannable:
   - short sections
   - clear headings
   - concrete references to examples
4. When useful, embed local exercises with:

```md
[[exercise:ex01.md]]
```

5. Only reference exercises from the same topic unless the task explicitly asks for cross-topic references.

## Theory Rules

- Prefer short paragraphs over long walls of text.
- Tie explanation to examples that actually exist.
- If an embedded exercise is important, place one or two lines of framing text around it.
- Do not paste large code blocks into theory if the example already exists as a runnable `.md`.
- Keep titles and section names consistent with the local topic naming.

## Exercise Embeds

The repo already supports:

- inline exercise cards in Theory
- small inline previews
- a larger popup preview
- direct open to the exercise

When inserting embeds:

- keep the filename exact, for example `[[exercise:ex05.md]]`
- preserve surrounding text so the markdown still reads naturally
- prefer a small number of embeds per page unless the page is an overview

## Validation

After changing `main.md`, check:

- the referenced exercise filenames exist
- the page still reads well in plain Markdown
- if you touched embed-heavy theory, mention that it should be checked visually in the Theory viewer

## Output Expectations

When finishing:

- mention the `main.md` files changed
- mention any new `[[exercise:...]]` references
- mention whether validation was textual only or whether the user should visually verify Theory rendering
