---
framework: vue
---

# HTML

```html
<main class="vue-app">
  <p class="eyebrow">Vue Composition API</p>
  <h1>{{ title }}</h1>
  <p>{{ summary }}</p>
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</main>
```

# JavaScript

```javascript
import { computed, ref } from 'vue';

export default {
  setup() {
    const title = ref('vue1');
    const count = ref(0);
    const summary = computed(() => `Reactive count: ${count.value}`);
    const increment = () => {
      count.value += 1;
    };

    return {
      count,
      increment,
      summary,
      title,
    };
  },
};
```