---
example_stage: final-solution
console: true
---

# HTML

```html
<main class="profile-card">
  <p class="profile-card__eyebrow">Exercise</p>
  <h1>Semantic HTML Checklist</h1>
  <ul class="profile-card__list">
    <li>Review semantic HTML</li>
    <li>Inspect the locked stylesheet</li>
    <li>Use the console to verify interactions</li>
  </ul>
  <button id="profile-btn" type="button">Track progress</button>
</main>
```

# CSS

```css
.profile-card {
  display: grid;
  gap: 12px;
  max-width: 420px;
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f8fafc, #dbeafe);
  color: #1e3a8a;
  font-family: system-ui, sans-serif;
}

.profile-card__eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.profile-card h1,
.profile-card ul {
  margin: 0;
}

.profile-card__list {
  display: grid;
  gap: 8px;
  padding-left: 20px;
}

.profile-card button {
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
const button = document.getElementById('profile-btn');
let clicks = 0;

button?.addEventListener('click', () => {
  clicks += 1;
  console.info('Exercise progress clicks:', clicks);
});
```
