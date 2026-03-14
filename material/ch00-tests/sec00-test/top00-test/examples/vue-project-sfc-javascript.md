---
framework: vue
mode: multi-file
entry: src/main.js
example_description: "Vue SFC project with an app shell, child component and composable counter in JavaScript."
example_tags: "vue|sfc|javascript|project|composable"
example_rating: 5
example_importance: critical
---

## @file src/main.js
## @lang javascript
## @role entry

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

createApp(App).mount('#app');
```

## @file src/App.vue
## @lang vue
## @role app

```vue
<template>
  <main class="playground-shell">
    <header class="playground-shell__hero">
      <p class="playground-shell__eyebrow">Vue SFC multi-file</p>
      <h1>{{ title }}</h1>
      <p>{{ summary }}</p>
    </header>
    <LessonCard :count="count" @increment="increment" />
  </main>
</template>

<script setup>
import { computed } from 'vue';
import LessonCard from './components/LessonCard.vue';
import { useCounter } from './composables/useCounter.js';

const title = 'Vue Project SFC JavaScript';
const { count, increment } = useCounter(2);
const summary = computed(() => `The current counter starts at ${count.value}.`);
</script>

<style scoped>
.playground-shell {
  display: grid;
  gap: 16px;
}

.playground-shell__hero {
  display: grid;
  gap: 6px;
}

.playground-shell__eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.playground-shell h1,
.playground-shell p {
  margin: 0;
}
</style>
```

## @file src/components/LessonCard.vue
## @lang vue
## @role component

```vue
<template>
  <section class="lesson-card">
    <h2>Composition API + SFC</h2>
    <p>Count: {{ count }}</p>
    <button type="button" @click="$emit('increment')">Increment</button>
  </section>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
  },
});

defineEmits(['increment']);
</script>

<style scoped>
.lesson-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
}

.lesson-card h2,
.lesson-card p {
  margin: 0;
}

.lesson-card button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}
</style>
```

## @file src/composables/useCounter.js
## @lang javascript
## @role hook

```javascript
import { ref } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  return {
    count,
    increment: () => {
      count.value += 1;
    },
  };
}
```

## @file src/styles.css
## @lang css
## @role style

```css
body {
  margin: 0;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

#app {
  min-height: 100vh;
}

.playground-shell {
  max-width: 680px;
  margin: 0 auto;
}
```
