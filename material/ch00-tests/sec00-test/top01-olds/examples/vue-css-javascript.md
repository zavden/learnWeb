---
framework: vue
---

# HTML

```html
<main class="vue-card">
  <p class="eyebrow">Vue single-file</p>
  <h1>{{ title }}</h1>
  <p>{{ message }}</p>
  <button type="button" @click="toggleMood">{{ happy ? 'Happy' : 'Calm' }}</button>
</main>
```

# CSS

```css
.vue-card {
  display: grid;
  gap: 12px;
  max-width: 420px;
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #dbeafe);
  color: #1e3a8a;
  font-family: system-ui, sans-serif;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.vue-card h1,
.vue-card p {
  margin: 0;
}

.vue-card button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}
```

# JavaScript

```javascript
export default {
  data() {
    return {
      title: 'Vue CSS JavaScript',
      happy: true,
    };
  },
  computed: {
    message() {
      return this.happy ? 'Computed properties also work here.' : 'Vue keeps the template reactive.';
    },
  },
  methods: {
    toggleMood() {
      this.happy = !this.happy;
    },
  },
};
```
