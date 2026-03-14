---
framework: vue
exercise: true
exercise_title: "Complete the Vue progress panel"
exercise_instructions: "Replace the TODO text with the computed summary || Keep styles.css locked || Use the button to verify reactive updates"
exercise_hints: "The computed value is already returned from setup() || Edit the HTML block before touching the script"
exercise_locked_files: styles.css
exercise_solution_example: exercise-vue-solution.md
example_stage: exercise
console: true
---

# HTML

```html
<section class="vue-exercise">
  <p class="vue-exercise__eyebrow">Exercise</p>
  <h1>{{ title }}</h1>
  <p>TODO: Show the computed summary here.</p>
  <button type="button" @click="advance">Advance</button>
</section>
```

# JavaScript

```javascript
import { computed, ref } from 'vue';

export default {
  setup() {
    const title = ref('Vue Exercise');
    const step = ref(1);
    const summary = computed(() => `Current step: ${step.value}`);
    const advance = () => {
      step.value += 1;
      console.log('Step advanced to', step.value);
    };

    return {
      advance,
      summary,
      step,
      title,
    };
  },
};
```

# CSS

```css
.vue-exercise {
  display: grid;
  gap: 12px;
  max-width: 420px;
  padding: 24px;
  border-radius: 18px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.vue-exercise__eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #38bdf8;
}

.vue-exercise h1,
.vue-exercise p {
  margin: 0;
}

.vue-exercise button {
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
