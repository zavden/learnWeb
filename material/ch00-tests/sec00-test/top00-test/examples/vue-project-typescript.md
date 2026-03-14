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
import App from './App.ts';
import './styles.scss';

createApp(App).mount('#app');
```

## @file src/App.ts
## @lang typescript
## @role app

```typescript
import { defineComponent, ref } from 'vue';
import StatusCard from './components/StatusCard.ts';
import { useStepCounter } from './composables/useStepCounter.ts';
import render from './App.html';

export default defineComponent({
  name: 'App',
  components: {
    StatusCard,
  },
  setup() {
    const title = ref('Vue Project TypeScript');
    const { count, decrement, increment } = useStepCounter(2);

    return {
      count,
      decrement,
      increment,
      title,
    };
  },
  render,
});
```

## @file src/App.html
## @lang html
## @role markup

```html
<main class="dashboard">
  <header class="dashboard__hero">
    <p class="dashboard__eyebrow">Vue TS multi-file</p>
    <h1>{{ title }}</h1>
  </header>
  <StatusCard label="Current value" :value="count" />
  <div class="dashboard__actions">
    <button type="button" @click="decrement">Decrease</button>
    <button type="button" @click="increment">Increase</button>
  </div>
</main>
```

## @file src/components/StatusCard.ts
## @lang typescript
## @role component

```typescript
import { defineComponent, type PropType } from 'vue';
import render from './StatusCard.html';

export default defineComponent({
  name: 'StatusCard',
  props: {
    label: {
      type: String as PropType<string>,
      required: true,
    },
    value: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  render,
});
```

## @file src/components/StatusCard.html
## @lang html
## @role markup

```html
<section class="status-card">
  <span>{{ label }}</span>
  <strong>{{ value }}</strong>
</section>
```

## @file src/composables/useStepCounter.ts
## @lang typescript
## @role hook

```typescript
import { ref, type Ref } from 'vue';

export type StepCounterApi = {
  count: Ref<number>;
  increment: () => void;
  decrement: () => void;
};

export function useStepCounter(step: number): StepCounterApi {
  const count = ref<number>(step);

  return {
    count,
    increment: () => {
      count.value += step;
    },
    decrement: () => {
      count.value -= step;
    },
  };
}
```

## @file src/styles.scss
## @lang scss
## @role style

```scss
$bg: #0f172a;
$accent: #38bdf8;
$surface: rgba(15, 23, 42, 0.88);

body {
  margin: 0;
  background: radial-gradient(circle at top, #1e293b, $bg 68%);
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.dashboard {
  display: grid;
  gap: 16px;
  max-width: 520px;
  margin: 0 auto;

  &__hero {
    display: grid;
    gap: 8px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $accent;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: $accent;
    color: $bg;
    cursor: pointer;
    font-weight: 700;
  }
}

.status-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba($accent, 0.25);
  border-radius: 18px;
  background: $surface;

  strong {
    font-size: 42px;
    color: $accent;
  }
}
```
