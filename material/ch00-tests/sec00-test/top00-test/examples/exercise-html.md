---
exercise: true
exercise_title: "Complete the profile card"
exercise_instructions: "Replace the TODO heading with your own label || Add one extra list item to the checklist || Keep styles.css locked"
exercise_hints: "Edit index.html first || The button already has an id in script.js"
exercise_locked_files: styles.css
exercise_solution_example: exercise-html-solution.md
example_stage: exercise
console: true
example_description: "Guided HTML exercise with locked CSS and a tiny JavaScript tracker for progress clicks."
example_tags: "exercise|html|css|javascript|console"
example_rating: 5
example_importance: critical
---

# HTML

```html
<main class="profile-card">
  <p class="profile-card__eyebrow">Exercise</p>
  <h1>TODO: Add your title</h1>
  <ul class="profile-card__list">
    <li>Review semantic HTML</li>
    <li>Inspect the locked stylesheet</li>
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
