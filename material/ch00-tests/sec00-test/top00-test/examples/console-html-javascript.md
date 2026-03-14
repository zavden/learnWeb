---
console: true
example_description: "Trace synchronous logs, a promise microtask and a timeout from one HTML button."
example_tags: "html|javascript|console|events|async"
example_rating: 4
example_importance: useful
---

# HTML

```html
<main class="console-demo">
  <h1>Console HTML + JavaScript</h1>
  <button id="run-order" type="button">Run order test</button>
</main>
```

# JavaScript

```javascript
console.log('sync log: script start');
console.warn('sync warn: console is active');

const button = document.getElementById('run-order');

button?.addEventListener('click', () => {
  console.info('event: click handler');
  Promise.resolve().then(() => {
    console.log('microtask: promise resolved');
  });
  setTimeout(() => {
    console.log('macrotask: timeout fired');
  }, 120);
});
```
