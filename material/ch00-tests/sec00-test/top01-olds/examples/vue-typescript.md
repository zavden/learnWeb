---
framework: vue
---

# HTML

```html
<section class="vue-ts">
  <h1>{{ title }}</h1>
  <p>Current step: {{ step }}</p>
  <button type="button" @click="advance">Advance</button>
</section>
```

# CSS

```css
.vue-ts {
  display: grid;
  gap: 10px;
  max-width: 360px;
  padding: 24px;
  border-radius: 16px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.vue-ts h1,
.vue-ts p {
  margin: 0;
}

.vue-ts button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #38bdf8;
  color: #0f172a;
  cursor: pointer;
  font-weight: 700;
}
```

# TypeScript

```typescript
import { defineComponent } from 'vue';

type StepState = {
  title: string;
  step: number;
};

export default defineComponent({
  data(): StepState {
    return {
      title: 'Vue TypeScript',
      step: 1,
    };
  },
  methods: {
    advance() {
      this.step += 1;
    },
  },
});
```
