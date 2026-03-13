---
framework: vue
mode: multi-file
entry: src/main.ts
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
  <main class="dashboard">
    <header class="dashboard__hero">
      <p class="dashboard__eyebrow">Vue SFC + TS</p>
      <h1>{{ title }}</h1>
      <p>{{ summary }}</p>
    </header>
    <StatusCard label="Current value" :value="count" :total="target" />
    <div class="dashboard__actions">
      <button type="button" @click="decrement">Decrease</button>
      <button type="button" @click="increment">Increase</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusCard from './components/StatusCard.vue';
import { useProgress } from './composables/useProgress.ts';

const title = 'Vue Project SFC TypeScript';
const target = 12;
const { count, decrement, increment } = useProgress(4);
const summary = computed(() => `Goal progress: ${count.value}/${target}`);
</script>

<style scoped lang="scss">
.dashboard {
  display: grid;
  gap: 16px;

  &__hero {
    display: grid;
    gap: 8px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #38bdf8;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  h1,
  p {
    margin: 0;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: #38bdf8;
    color: #0f172a;
    cursor: pointer;
    font-weight: 700;
  }
}
</style>
```

## @file src/components/StatusCard.vue
## @lang vue
## @role component

```vue
<template>
  <section class="status-card">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small>Target: {{ total }}</small>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: number;
  total: number;
}>();
</script>

<style scoped>
.status-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #e2e8f0;
}

.status-card strong {
  font-size: 42px;
  color: #38bdf8;
}
</style>
```

## @file src/composables/useProgress.ts
## @lang typescript
## @role hook

```typescript
import { ref, type Ref } from 'vue';

export type ProgressApi = {
  count: Ref<number>;
  increment: () => void;
  decrement: () => void;
};

export function useProgress(initialValue: number): ProgressApi {
  const count = ref<number>(initialValue);

  return {
    count,
    increment: () => {
      count.value += 1;
    },
    decrement: () => {
      count.value -= 1;
    },
  };
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

#app {
  min-height: 100vh;
}

.dashboard {
  max-width: 560px;
  margin: 0 auto;
}
```
