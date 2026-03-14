---
framework: vue
mode: multi-file
entry: src/main.ts
example_description: "Vue TypeScript project that reads local JSON data and combines it with SCSS styling."
example_tags: "vue|typescript|json|project|scss"
example_rating: 5
example_importance: important
---

## @file src/main.ts
## @lang typescript
## @role entry

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import './styles.scss';

createApp(App).mount('#app');
```

## @file src/App.vue
## @lang vue
## @role app

```vue
<template>
  <main class="json-dashboard">
    <header class="json-dashboard__hero">
      <img src="lesson-badge.svg" alt="Lesson badge" width="64" height="64" />
      <div>
        <p class="json-dashboard__eyebrow">Vue + local JSON</p>
        <h1>{{ dataset.title }}</h1>
        <p>{{ dataset.summary }}</p>
      </div>
    </header>
    <ul class="json-dashboard__list">
      <li v-for="module in dataset.modules" :key="module.id">
        <strong>{{ module.label }}</strong>
        <span>{{ module.count }} steps</span>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import dataset from './data/modules.json';
</script>

<style scoped lang="scss">
.json-dashboard {
  display: grid;
  gap: 18px;

  &__hero {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__eyebrow {
    margin: 0 0 4px;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #38bdf8;
  }

  &__list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__list li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.82);
    color: #e2e8f0;
  }

  h1,
  p {
    margin: 0;
  }
}
</style>
```

## @file src/data/modules.json
## @lang json
## @role config

```json
{
  "title": "Vue Data Snapshot",
  "summary": "This project consumes JSON stored inside the same Markdown file.",
  "modules": [
    {
      "id": 1,
      "label": "Refs",
      "count": 3
    },
    {
      "id": 2,
      "label": "Computed",
      "count": 2
    },
    {
      "id": 3,
      "label": "Composables",
      "count": 4
    }
  ]
}
```

## @file src/styles.scss
## @lang scss
## @role style

```scss
$bg: #0f172a;

body {
  margin: 0;
  background: radial-gradient(circle at top, #1e293b, $bg 68%);
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.json-dashboard {
  max-width: 720px;
  margin: 0 auto;
}
```
