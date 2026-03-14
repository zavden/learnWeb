---
framework: vue
console: true
---

# HTML

```html
<main class="vue-console">
  <h1>{{ title }}</h1>
  <p>{{ message }}</p>
  <button type="button" @click="toggleMood">{{ moodLabel }}</button>
</main>
```

# JavaScript

```javascript
import { computed, ref, watch } from 'vue';

export default {
  setup() {
    const title = ref('Vue Console Demo');
    const happy = ref(true);
    const moodLabel = computed(() => (happy.value ? 'Happy' : 'Calm'));
    const message = computed(() => (
      happy.value ? 'Watch the console when this changes.' : 'Vue watch logged the transition.'
    ));

    console.log('vue setup: component created');

    watch(happy, (value, oldValue) => {
      console.info('vue watch:', oldValue, '->', value);
    });

    const toggleMood = () => {
      console.warn('vue action: toggling mood');
      happy.value = !happy.value;
    };

    return {
      happy,
      message,
      moodLabel,
      title,
      toggleMood,
    };
  },
};
```

# CSS

```css
.vue-console {
  display: grid;
  gap: 12px;
  max-width: 360px;
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #dbeafe);
  color: #1e3a8a;
  font-family: system-ui, sans-serif;
}

.vue-console h1,
.vue-console p {
  margin: 0;
}

.vue-console button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
```
