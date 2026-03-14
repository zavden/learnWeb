# Vue Project SFC TypeScript

Use this template when the lesson needs modern `.vue` authoring with TypeScript.

## Format

- `framework: vue`
- `mode: multi-file`
- `.vue` files with `lang="ts"` support
- optional `SCSS` styles

## Expected structure

- one entry file mounting the app
- one or more typed `.vue` components
- optional composables or helpers in `TypeScript`

## What each file template means

This topic uses the same roles as `Vue Project SFC JavaScript`, but with TypeScript available:

- `Entry`: typed bootstrap file for `createApp(...)`.
- `App`: root SFC, often the first place where typed data or pages are composed.
- `Component`: typed child SFC.
- `Composable`: typed Composition API logic.
- `Page`: typed screen-level SFC.
- `Store`: shared typed reactive state.
- `Derived State`: typed computed helpers derived from store or refs.
- `Style`: project-wide `CSS`, `SCSS` or `SASS`.
- `Util`: typed pure helpers.

## Example map

- `ex01`: entry + app + component
- `ex03`: typed composable
- `ex04`: typed child component structure
- `ex05`: typed SFC composition

If you want a plain-language walkthrough of every role first, start with the JavaScript SFC topic and then come back here for the typed version.

## When to use it

- for typed props, typed composables and modern Vue patterns
- for lessons that should feel close to a real Vue codebase without leaving the Markdown model

## Limitations

- SFC support is intentionally scoped to the features already implemented
- it is strong enough for learning, but not a full clone of the complete Vue SFC toolchain
