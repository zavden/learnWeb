# Vue Project SFC JavaScript

Use this template when the lesson should introduce controlled `.vue` Single File Components with JavaScript.

## Format

- `framework: vue`
- `mode: multi-file`
- `.vue` files plus JavaScript helpers or composables

## Expected structure

- one entry file
- one or more `.vue` components
- optional extra JavaScript files for composables or helpers

## What each file template means

- `Entry`: creates the Vue app and mounts it into `#app`.
- `App`: the root SFC for the lesson. It usually imports a page or the main component tree.
- `Component`: a reusable child SFC.
- `Composable`: reusable Composition API logic, usually named `useSomething`.
- `Page`: a screen-level SFC that groups multiple smaller files into one lesson flow.
- `Store`: shared reactive state. In this project it is usually a composable-style module that multiple components can call.
- `Derived State`: a computed helper built from refs or store values. It is useful when you want a read-only summary instead of more mutable state.
- `Style`: project-wide CSS, SCSS or SASS.
- `Util`: a pure helper module for formatting or tiny transformations.

## Example map

- `ex01`: entry + app + component + style
- `ex02`: app-only SFC interaction with local state
- `ex03`: child event emission
- `ex04`: composable
- `ex05`: multiple child components
- `ex06`: complete SFC template map with `page`, `store`, `derived state`, `util` and the base SFC roles working together
- `ex07` to `ex10`: small focused combinations for `component`, `emit`, `composable` and `util`
- `ex11` to `ex13`: combinations centered on `page`, `store` and `derived state`
- `ex14` to `ex16`: broader project combinations that mix `page`, `component`, `composable`, `store`, `derived state`, `util` and base SFC roles

## When to use it

- for modern Vue authoring with `<template>`, `<script setup>` and `<style>`
- for lessons that should look closer to the common Vue workflow

## Limitations

- SFC support is controlled, not fully open-ended
- features like `template src`, `script src`, style modules and custom blocks are outside the current scope
