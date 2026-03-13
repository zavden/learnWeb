---
framework: vue
---

# HTML

```html
<main class="vue-app">
  <p class="eyebrow">Vue single-file</p>
  <h1>{{ title }}</h1>
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</main>
```

# JavaScript

```javascript
export default {
  data() {
    return {
      title: 'Vue JavaScript',
      count: 0,
    };
  },
  methods: {
    increment() {
      this.count += 1;
    },
  },
};
```
