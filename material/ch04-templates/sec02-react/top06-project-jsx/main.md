# React Project JSX

Use this template when the lesson should feel like a small React project while staying inside one Markdown document.

## Format

- `framework: react`
- `mode: multi-file`
- virtual files such as `src/main.jsx`, `src/App.jsx`, components and styles

## Expected structure

- one entry file
- one app file
- any supporting JSX, JS or CSS files that belong to the same project

## What each file template means

- `Entry`: mounts React with `createRoot(...)` and imports the app shell or global styles.
- `App`: the top component for the lesson. It usually wires providers, pages and the main UI flow.
- `Component`: a reusable visual piece such as a card, panel, button row or list item.
- `Hook`: reusable stateful logic, usually named `useSomething`.
- `Page`: a screen-level component that groups multiple smaller pieces into one lesson flow.
- `Context`: shared state for a subtree, usually exposed through a provider and a custom hook.
- `Reducer`: a pure function for `useReducer`, useful when the state transitions should stay explicit.
- `Style`: project-wide CSS for the example.
- `Util`: a pure helper without React state, for formatting, mapping or small calculations.

## Example map

- `ex01`: entry + app + component + style
- `ex03`: hook
- `ex04`: context
- `ex05`: reducer
- `ex06`: complete template map with `page`, `util` and the other React project roles working together

## When to use it

- for hooks, component composition and import flow
- for teaching how files relate to each other in a React project without leaving the single-document model

## Limitations

- this is still a Markdown-hosted project, not a free-form filesystem
- the project should stay small and educational
