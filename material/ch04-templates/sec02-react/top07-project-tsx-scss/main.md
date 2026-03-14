# React Project TSX + SCSS

Use this template when the lesson needs a small typed React project with preprocessed styles.

## Format

- `framework: react`
- `mode: multi-file`
- `TSX` and `TypeScript` virtual files
- `SCSS` for styles

## Expected structure

- typed entry and app files
- reusable hooks or components in separate files
- one SCSS file or a small set of project styles

## What each file template means

This topic uses the same project roles as `React Project JSX`, but with types and `SCSS` available:

- `Entry`: typed bootstrap file for `createRoot(...)`.
- `App`: typed top-level component for the lesson.
- `Component`: typed reusable UI with props.
- `Hook`: reusable typed React logic.
- `Page`: screen-level TSX component that composes smaller files.
- `Context`: typed shared state through `createContext` and a provider.
- `Reducer`: typed state transition function for `useReducer`.
- `Style`: `SCSS`, `SASS` or `CSS` for the project.
- `Util`: typed pure helpers such as formatters or data mappers.

## Example map

- `ex01`: hook in a typed React project
- `ex02`: reducer in a typed React project
- `ex03`: context in a typed React project
- `ex04`: util file in a typed React project
- `ex05`: component + hook composition with `SCSS`
- `ex06`: page + component layout
- `ex07`: hook + component with typed filters
- `ex08`: reducer + component controls
- `ex09`: util + component formatting
- `ex10`: page + hook + component
- `ex11`: context + component preferences
- `ex12`: page + reducer + component
- `ex13`: context + hook collaboration
- `ex14`: page + util + component
- `ex15`: broader project map with `page`, `context`, `hook`, `reducer`, `util` and typed components

## When to use it

- for stronger examples around hooks, typed props and multi-file organization
- for showing how React and SCSS interact in a project-oriented lesson

## Limitations

- this is the richer React teaching mode currently represented by presets
- it is still meant for compact projects, not full production bundler behavior
