---
framework: vue
mode: multi-file
entry: src/main.js
---

## @file src/main.js
## @lang javascript
## @role entry

```javascript
import { createApp } from 'vue';
import App from './App.js';
import './styles.css';

createApp(App).mount('#app');
```

## @file src/App.js
## @lang javascript
## @role app

```javascript
import { computed, defineComponent, ref } from 'vue';
import CounterPanel from './components/CounterPanel.js';
import LessonList from './components/LessonList.js';
import render from './App.html';

export default defineComponent({
  name: 'App',
  components: {
    CounterPanel,
    LessonList,
  },
  setup() {
    const title = ref('Vue Project JavaScript');
    const lessonCount = ref(2);
    const subtitle = computed(() => `There are ${lessonCount.value} reactive pieces in this demo.`);
    const registerLesson = () => {
      lessonCount.value += 1;
    };

    return {
      lessonCount,
      registerLesson,
      subtitle,
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
<main class="playground">
  <header class="hero">
    <p class="eyebrow">Vue multi-file</p>
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </header>
  <CounterPanel @register="registerLesson" />
  <LessonList :count="lessonCount" />
</main>
```

## @file src/components/CounterPanel.js
## @lang javascript
## @role component

```javascript
import { defineComponent, ref } from 'vue';
import render from './CounterPanel.html';

export default defineComponent({
  name: 'CounterPanel',
  emits: ['register'],
  setup(_, { emit }) {
    const count = ref(0);
    const increment = () => {
      count.value += 1;
      emit('register');
    };

    return {
      count,
      increment,
    };
  },
  render,
});
```

## @file src/components/CounterPanel.html
## @lang html
## @role markup

```html
<section class="card stack">
  <h2>Counter component</h2>
  <p>Each click emits an event to the parent.</p>
  <button type="button" @click="increment">Clicked {{ count }} times</button>
</section>
```

## @file src/components/LessonList.js
## @lang javascript
## @role component

```javascript
import { computed, defineComponent } from 'vue';
import render from './LessonList.html';

export default defineComponent({
  name: 'LessonList',
  props: {
    count: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const lessons = computed(() => Array.from({ length: props.count }, (_, index) => `Lesson ${index + 1}`));

    return {
      lessons,
    };
  },
  render,
});
```

## @file src/components/LessonList.html
## @lang html
## @role markup

```html
<section class="card">
  <h2>Lesson list</h2>
  <ol class="timeline">
    <li v-for="lesson in lessons" :key="lesson">{{ lesson }}</li>
  </ol>
</section>
```

## @file src/styles.css
## @lang css
## @role style

```css
:root {
  color-scheme: light;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

.playground {
  display: grid;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  display: grid;
  gap: 6px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.hero h1,
.card h2,
.card p {
  margin: 0;
}

.card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
}

.stack {
  align-items: start;
}

button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.timeline {
  display: grid;
  gap: 10px;
  padding-left: 20px;
}
```
