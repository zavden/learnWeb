---
name: learnweb-theory-authoring
description: Create or update LearnWeb topic theory files at material/**/main.md. Covers topic explanations, exercise embeds with [[exercise:...]], and didactic structure for the Theory viewer.
---

# LearnWeb Theory Authoring

## Overview

Use this skill for `main.md` theory files. These are Markdown documents that explain a topic and optionally embed references to runnable examples. They are rendered in the app's Theory viewer panel.

## Directory Structure

```
material/
  ch01-templates/
    sec01-vanilla/
      top06-html-css-javascript/
        main.md              # <-- this is the theory file
        examples/
          ex01.md
          ex02.md
```

Each topic folder has exactly one `main.md`. It coexists with the `examples/` folder.

## Format

Theory files are standard Markdown with one custom extension: exercise embeds.

```markdown
# Topic Title

Introduction paragraph explaining the concept.

## Section Heading

More explanation. Keep paragraphs short and scannable.

Here is an exercise to try:

[[exercise:ex01.md]]

And another concept:

[[exercise:ex02.md]]

## Summary

Wrap up the key ideas.
```

### Exercise Embeds

Syntax: `[[exercise:filename.md]]`

- The filename is resolved relative to the topic's `examples/` folder.
- The embed renders as an interactive card in the Theory viewer with:
  - A small inline preview
  - A button to open the full exercise
  - A button to open a larger popup preview
- Place one or two lines of framing text around each embed so the reader knows what to expect.

Rules:
- Keep the filename exact (case-sensitive).
- Only reference exercises from the same topic unless explicitly asked otherwise.
- Prefer a small number of embeds per page (3-5 max) unless the page is an overview index.
- The referenced file MUST exist in `examples/`. Verify this before finishing.

## Theory Writing Rules

1. **Short paragraphs.** Prefer 2-4 sentences per paragraph.
2. **Clear headings.** Use `##` for sections within the topic.
3. **Tie to examples.** Reference examples that actually exist. Don't describe code that the learner can't run.
4. **Don't paste large code blocks.** If the code exists as a runnable `.md` in `examples/`, embed it with `[[exercise:...]]` instead of copying.
5. **Match local tone.** Read neighboring `main.md` files in the same section to stay consistent.
6. **Be didactic, not encyclopedic.** Explain *why*, not just *what*.
7. **Title consistency.** Keep `# Topic Title` consistent with the folder naming convention.

## Workflow

1. Open the target `main.md`.
2. Read the local `examples/` folder to know what's available for embedding.
3. Read neighboring `main.md` files if tone or structure matters.
4. Write or edit the theory content.
5. Verify all `[[exercise:...]]` references point to existing files.

## Validation

- Verify referenced exercise filenames exist in `examples/`.
- Verify the page reads well as plain Markdown (no broken syntax).
- If embed-heavy, mention that visual verification in the Theory viewer is recommended.

## Output When Finishing

Report:
- Which `main.md` files were created or changed
- Any new `[[exercise:...]]` references added
- Whether validation was textual only or visual verification is needed
