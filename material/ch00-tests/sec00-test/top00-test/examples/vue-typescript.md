---
framework: vue
---

# HTML

```html
<section class="vue-ts">
  <h1>{{ title }}</h1>
  <p>Current step: {{ step }}</p>
  <p>Double step: {{ doubled }}</p>
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
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const title = ref('Vue TypeScript');
    const step = ref<number>(1);
    const doubled = computed(() => step.value * 2);
    const advance = () => {
      step.value += 1;
    };

    return {
      advance,
      doubled,
      step,
      title,
    };
  },
});
```
